import os
import json
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from database import get_supabase
import google.generativeai as genai

router = APIRouter()

# In-memory storage for active interview sessions (transcript)
# In production, you'd store this in a database or Redis
active_sessions = {}

@router.websocket("/ws/{student_id}")
async def mock_interview_ws(websocket: WebSocket, student_id: str):
    studentId = student_id  # Map it back to what the rest of the code uses
    await websocket.accept()
    
    supabase = get_supabase()
    
    # 1. Fetch Student Profile
    res = supabase.table("student_profiles").select("target_role, full_name, education, experience, projects, skills").eq("id", student_id).execute()
    
    if not res.data:
        profile = {}
    else:
        profile = res.data[0]
    target_role = profile.get("target_role") or "Software Engineer"
    candidate_name = profile.get("full_name") or "Candidate"
    
    # Construct a concise summary of their resume for the LLM
    resume_summary = f"""
    Education: {json.dumps(profile.get('education') or [])}
    Experience: {json.dumps(profile.get('experience') or [])}
    Projects: {json.dumps(profile.get('projects') or [])}
    Skills: {json.dumps(profile.get('skills') or [])}
    """

    # 2. Initialize Gemini Chat Session
    gemini_key = os.getenv("GEMINI_API_KEY")
    if not gemini_key:
        await websocket.send_json({"type": "error", "message": "GEMINI_API_KEY not found."})
        await websocket.close()
        return

    genai.configure(api_key=gemini_key)
    
    system_instruction = f"""
    You are an expert technical and behavioral interviewer for the role of '{target_role}'.
    You are interviewing {candidate_name}.
    Here is their resume summary:
    {resume_summary}

    Rules for the interview:
    1. Ask ONE question at a time. Keep it conversational.
    2. Start by introducing yourself and asking them to briefly introduce themselves based on their resume.
    3. Ask follow-up questions based on their answers. 
    4. Mix behavioral and technical questions relevant to '{target_role}'.
    5. Do NOT give them feedback immediately after every answer unless they are completely stuck. Just acknowledge and ask the next question.
    6. Keep your responses brief and spoken-word friendly (avoid long lists or code blocks unless necessary).
    """

    model_name = os.getenv("GEMINI_MODEL", "gemini-3.6-flash")
    model = genai.GenerativeModel(
        model_name=model_name,
        system_instruction=system_instruction
    )
    
    chat = model.start_chat(history=[])
    
    # Store the chat object and transcript
    active_sessions[studentId] = {
        "chat": chat,
        "transcript": []
    }

    try:
        # Start the interview — run in thread to avoid blocking the event loop
        import asyncio
        from google.api_core.exceptions import GoogleAPIError
        
        try:
            initial_response = await asyncio.to_thread(chat.send_message, "Start the interview.")
            ai_msg = initial_response.text
        except GoogleAPIError as e:
            ai_msg = "I'm sorry, I am currently experiencing high traffic or API rate limits. Please try again in a few minutes."
            print(f"Gemini API Error: {e}")
            
        active_sessions[studentId]["transcript"].append({"role": "assistant", "text": ai_msg})
        await websocket.send_json({"type": "question", "text": ai_msg})

        # Loop to receive answers
        while True:
            data = await websocket.receive_json()
            msg_type = data.get("type")
            
            if msg_type == "answer":
                user_text = data.get("text")
                active_sessions[studentId]["transcript"].append({"role": "user", "text": user_text})
                
                # Send to LLM — run in thread to avoid blocking
                try:
                    response = await asyncio.to_thread(chat.send_message, user_text)
                    ai_text = response.text
                except GoogleAPIError as e:
                    ai_text = "I'm having trouble connecting to my brain due to rate limits. Could you repeat that or try again shortly?"
                    print(f"Gemini API Error: {e}")
                
                active_sessions[studentId]["transcript"].append({"role": "assistant", "text": ai_text})
                await websocket.send_json({"type": "message", "text": ai_text})
                
            elif msg_type == "end_interview":
                # Generate Feedback
                await generate_and_send_feedback(websocket, studentId)
                break

    except WebSocketDisconnect:
        print(f"Client {studentId} disconnected from interview.")
    finally:
        if studentId in active_sessions:
            del active_sessions[studentId]


async def generate_and_send_feedback(websocket: WebSocket, studentId: str):
    import asyncio
    
    if studentId not in active_sessions:
        print(f"[FEEDBACK] No active session found for {studentId}")
        return
        
    transcript = active_sessions[studentId]["transcript"]
    
    if not transcript:
        print(f"[FEEDBACK] Empty transcript for {studentId}")
        await websocket.send_json({
            "type": "feedback",
            "feedback": {
                "communication": "No conversation was recorded to evaluate.",
                "grammar": "N/A",
                "technical": "N/A",
                "overall": "Please try again with a longer interview session."
            }
        })
        return
    
    transcript_text = "\n".join([f"{msg['role']}: {msg['text']}" for msg in transcript])
    
    prompt = f"""
    Based on the following interview transcript, generate a detailed feedback report for the candidate.
    
    Transcript:
    {transcript_text}
    
    You MUST return a JSON object with exactly these 4 keys (lowercase):
    {{
      "communication": "Detailed feedback on communication skills (clarity, conciseness, confidence, articulation).",
      "grammar": "Detailed feedback on grammar mistakes, delivery issues, filler words, sentence structure.",
      "technical": "Detailed feedback on technical competence, depth of answers, problem-solving approach.",
      "overall": "Overall recommendation: strengths, weaknesses, areas of improvement, and readiness for the role."
    }}
    
    Return ONLY valid JSON with these exact keys.
    """
    
    try:
        model_name = os.getenv("GEMINI_MODEL", "gemini-3.6-flash")
        model = genai.GenerativeModel(model_name, generation_config={"response_mime_type": "application/json"})
        
        # Run blocking Gemini call in a thread to avoid blocking the event loop
        print(f"[FEEDBACK] Generating feedback for {studentId}...")
        response = await asyncio.to_thread(model.generate_content, prompt)
        
        raw_text = response.text
        print(f"[FEEDBACK] Raw LLM response: {raw_text[:500]}")
        
        feedback_data = json.loads(raw_text)
        
        # Normalize keys to lowercase in case LLM uses different casing
        normalized = {}
        for key, value in feedback_data.items():
            normalized[key.lower().strip()] = value
        
        # Ensure all required keys exist
        final_feedback = {
            "communication": normalized.get("communication", normalized.get("communication skills", "No feedback available.")),
            "grammar": normalized.get("grammar", normalized.get("grammar & delivery", "No feedback available.")),
            "technical": normalized.get("technical", normalized.get("technical competence", "No feedback available.")),
            "overall": normalized.get("overall", normalized.get("overall recommendation", "No feedback available."))
        }
        
        print(f"[FEEDBACK] Sending feedback: {json.dumps(final_feedback)[:300]}")
        
        await websocket.send_json({
            "type": "feedback",
            "feedback": final_feedback
        })
        print(f"[FEEDBACK] Feedback sent successfully for {studentId}")
        
    except Exception as e:
        print(f"[FEEDBACK] Error generating feedback: {e}")
        import traceback
        traceback.print_exc()
        # Send fallback feedback
        await websocket.send_json({
            "type": "feedback",
            "feedback": {
                "communication": "Unable to generate detailed feedback at this time. Please try again.",
                "grammar": "The interview session was too short to evaluate grammar patterns.",
                "technical": "Not enough technical discussion to evaluate.",
                "overall": f"The interview concluded. Error during analysis: {str(e)[:100]}"
            }
        })

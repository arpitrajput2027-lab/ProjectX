import os
import json
from dotenv import load_dotenv
from groq import Groq
import warnings
warnings.filterwarnings("ignore", category=FutureWarning)
import google.generativeai as genai

load_dotenv()

def analyze_ats_score(resume_data: dict) -> dict:
    """Evaluates the resume across 8 ATS dimensions."""
    
    system_prompt = """
    You are an expert ATS (Applicant Tracking System) and career coach AI.
    Evaluate the provided resume data across 8 specific dimensions to generate an ATS compatibility score.
    
    The 8 dimensions are:
    1. Formatting (0-100)
    2. Content Quality (0-100)
    3. Skills Optimization (0-100)
    4. Keyword Density (0-100)
    5. Section Completeness (0-100)
    6. Readability (0-100)
    7. Structure (0-100)
    8. Overall ATS Compatibility (0-100)
    
    The JSON should have exactly this schema:
    {
      "overall_score": 72,
      "dimension_scores": [
        {"dimension": "Formatting", "score": 80, "feedback": "Good use of sections..."}
      ],
      "missing_keywords": ["Docker", "CI/CD", "Agile"],
      "section_recommendations": [
        {"section": "Experience", "issues": ["No quantified achievements"], "suggestions": ["Add metrics like percentage improvements"]}
      ],
      "improvement_tips": ["Add a professional summary section"],
      "strengths": ["Strong technical skills section"],
      "weaknesses": ["Weak project descriptions"]
    }
    
    Return ONLY valid JSON matching this schema. Do not include markdown formatting or explanations.
    """
    
    try:
        groq_key = os.getenv("GROQ_API_KEY")
        if not groq_key:
            raise ValueError("GROQ_API_KEY not found")
            
        client = Groq(api_key=groq_key)
        completion = client.chat.completions.create(
            model=os.getenv("GROQ_MODEL", "openai/gpt-oss-120b"),
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": f"Resume Data:\n{json.dumps(resume_data, indent=2)}"}
            ],
            temperature=0,
            response_format={"type": "json_object"}
        )
        
        result_str = completion.choices[0].message.content
        return json.loads(result_str)
        
    except Exception as e:
        print(f"Groq ATS analysis failed: {e}. Falling back to Gemini...")
        
        gemini_key = os.getenv("GEMINI_API_KEY")
        if not gemini_key:
            raise ValueError("GEMINI_API_KEY not found, and Groq failed.")
            
        genai.configure(api_key=gemini_key)
        model_name = os.getenv("GEMINI_MODEL", "gemini-3.6-flash")
        model = genai.GenerativeModel(model_name, generation_config={"response_mime_type": "application/json"})
        
        prompt = f"{system_prompt}\n\nResume Data:\n{json.dumps(resume_data, indent=2)}"
        response = model.generate_content(prompt)
        
        return json.loads(response.text)

def match_resume_to_jd(resume_data: dict, job_description: str) -> dict:
    """Matches a resume against a job description."""
    
    system_prompt = """
    You are an expert technical recruiter and ATS AI.
    Compare the provided resume data against the provided job description.
    Extract the requirements from the job description and evaluate how well the candidate matches.
    
    The JSON should have exactly this schema:
    {
      "overall_match_score": 65,
      "readiness_score": 70,
      "matched_skills": ["Python", "React"],
      "missing_skills": [{"skill": "Kubernetes", "importance": "high"}, {"skill": "GraphQL", "importance": "medium"}],
      "keyword_matches": [{"keyword": "machine learning", "found": true, "context": "Listed in skills"}, {"keyword": "distributed systems", "found": false}],
      "experience_alignment": "Candidate has 1 year experience, JD requires 2+ years. Partial match.",
      "strengths": ["Strong match in frontend skills"],
      "gaps": ["No backend deployment experience"],
      "recommendations": ["Add Kubernetes to skills if you have exposure"]
    }
    
    Return ONLY valid JSON matching this schema. Do not include markdown formatting or explanations.
    """
    
    try:
        groq_key = os.getenv("GROQ_API_KEY")
        if not groq_key:
            raise ValueError("GROQ_API_KEY not found")
            
        client = Groq(api_key=groq_key)
        completion = client.chat.completions.create(
            model=os.getenv("GROQ_MODEL", "openai/gpt-oss-120b"),
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": f"Resume Data:\n{json.dumps(resume_data, indent=2)}\n\nJob Description:\n{job_description}"}
            ],
            temperature=0,
            response_format={"type": "json_object"}
        )
        
        result_str = completion.choices[0].message.content
        return json.loads(result_str)
        
    except Exception as e:
        print(f"Groq JD matching failed: {e}. Falling back to Gemini...")
        
        gemini_key = os.getenv("GEMINI_API_KEY")
        if not gemini_key:
            raise ValueError("GEMINI_API_KEY not found, and Groq failed.")
            
        genai.configure(api_key=gemini_key)
        model_name = os.getenv("GEMINI_MODEL", "gemini-3.6-flash")
        model = genai.GenerativeModel(model_name, generation_config={"response_mime_type": "application/json"})
        
        prompt = f"{system_prompt}\n\nResume Data:\n{json.dumps(resume_data, indent=2)}\n\nJob Description:\n{job_description}"
        response = model.generate_content(prompt)
        
        return json.loads(response.text)

def customize_resume_for_jd(resume_data: dict, job_description: str, match_analysis: dict) -> dict:
    """Generates an optimized version of the resume for the specific job description."""
    
    system_prompt = """
    You are an expert resume writer and career coach.
    Your task is to optimize the provided resume data for the given job description and match analysis.
    
    CRITICAL INSTRUCTIONS (MUST FOLLOW):
    1. STRICT TRUTHFULNESS: You MUST NOT fabricate, hallucinate, or make up any new skills, experiences, projects, or degrees.
    2. Only rearrange, rephrase, and highlight EXISTING skills and experiences from the provided resume.
    3. Reorder skills to prioritize those relevant to the JD.
    4. Rewrite project and experience bullet points to emphasize aspects relevant to the JD.
    5. Enhance descriptions with JD keywords ONLY where truthfully applicable to the original experience.
    
    The JSON should have exactly this schema:
    {
      "customized_resume": { 
        "education": [],
        "experience": [],
        "projects": [],
        "skills": [],
        "achievements": [],
        "certifications": []
      },
      "changes_made": [{"section": "skills", "change_type": "reordered", "description": "Moved Python and ML skills to top"}],
      "warnings": ["Could not add 'Kubernetes' as it's not in your original resume"]
    }
    
    The "customized_resume" object should maintain the exact same structural schema as the input resume_data.
    Return ONLY valid JSON matching this schema. Do not include markdown formatting or explanations.
    """
    
    try:
        groq_key = os.getenv("GROQ_API_KEY")
        if not groq_key:
            raise ValueError("GROQ_API_KEY not found")
            
        client = Groq(api_key=groq_key)
        completion = client.chat.completions.create(
            model=os.getenv("GROQ_MODEL", "openai/gpt-oss-120b"),
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": f"Resume Data:\n{json.dumps(resume_data, indent=2)}\n\nJob Description:\n{job_description}\n\nMatch Analysis:\n{json.dumps(match_analysis, indent=2)}"}
            ],
            temperature=0,
            response_format={"type": "json_object"}
        )
        
        result_str = completion.choices[0].message.content
        return json.loads(result_str)
        
    except Exception as e:
        print(f"Groq customization failed: {e}. Falling back to Gemini...")
        
        gemini_key = os.getenv("GEMINI_API_KEY")
        if not gemini_key:
            raise ValueError("GEMINI_API_KEY not found, and Groq failed.")
            
        genai.configure(api_key=gemini_key)
        model_name = os.getenv("GEMINI_MODEL", "gemini-3.6-flash")
        model = genai.GenerativeModel(model_name, generation_config={"response_mime_type": "application/json"})
        
        prompt = f"{system_prompt}\n\nResume Data:\n{json.dumps(resume_data, indent=2)}\n\nJob Description:\n{job_description}\n\nMatch Analysis:\n{json.dumps(match_analysis, indent=2)}"
        response = model.generate_content(prompt)
        
        return json.loads(response.text)

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
import json
import os

router = APIRouter()

class ProjectChatRequest(BaseModel):
    repo_data: dict  # GitHub API repo data (name, description, language, etc.)
    user_prompt: str
    chat_history: list = []  # Previous messages for context

@router.post("/chat")
async def chat_about_project(request: ProjectChatRequest):
    """AI-powered chat about a specific GitHub project."""
    
    repo = request.repo_data
    repo_name = repo.get("name", "Unknown")
    repo_desc = repo.get("description", "No description")
    repo_lang = repo.get("language", "Unknown")
    repo_stars = repo.get("stargazers_count", 0)
    repo_forks = repo.get("forks_count", 0)
    repo_issues = repo.get("open_issues_count", 0)
    repo_topics = repo.get("topics", [])
    repo_has_pages = repo.get("has_pages", False)
    repo_has_wiki = repo.get("has_wiki", False)
    repo_homepage = repo.get("homepage", "")
    repo_created = repo.get("created_at", "")
    repo_updated = repo.get("updated_at", "")
    repo_size = repo.get("size", 0)
    repo_default_branch = repo.get("default_branch", "main")
    repo_license = repo.get("license", {})
    license_name = repo_license.get("name", "None") if repo_license else "None"

    system_prompt = f"""You are an expert Software Engineering Mentor and Code Reviewer AI.

You are analyzing a GitHub repository with the following details:
- **Name**: {repo_name}
- **Description**: {repo_desc}
- **Primary Language**: {repo_lang}
- **Stars**: {repo_stars} | **Forks**: {repo_forks} | **Open Issues**: {repo_issues}
- **Topics/Tags**: {', '.join(repo_topics) if repo_topics else 'None'}
- **Has GitHub Pages**: {repo_has_pages}
- **Has Wiki**: {repo_has_wiki}
- **Homepage URL**: {repo_homepage or 'None'}
- **License**: {license_name}
- **Created**: {repo_created} | **Last Updated**: {repo_updated}
- **Size**: {repo_size} KB
- **Default Branch**: {repo_default_branch}

Your job is to:
1. Answer the user's questions about this project with specific, actionable advice.
2. When asked for improvements, give concrete steps (not generic advice).
3. When asked about mistakes, analyze the metadata above and provide specific observations.
4. When asked about what to add, suggest features, tools, or practices relevant to the project's language and type.
5. Be conversational, helpful, and encouraging. Use markdown-like formatting for clarity (bold, lists, etc.).
6. If the user asks something unrelated to the project, gently redirect them.

Return ONLY a JSON object with one key:
- "reply": Your response message as a string.

Do NOT include markdown code fences or anything outside the JSON object."""

    # Build messages from chat history
    messages = [{"role": "system", "content": system_prompt}]
    
    for msg in request.chat_history:
        role = "user" if msg.get("role") == "user" else "assistant"
        messages.append({"role": role, "content": msg.get("text", "")})
    
    messages.append({"role": "user", "content": request.user_prompt})

    try:
        from groq import Groq
        groq_key = os.getenv("GROQ_API_KEY")
        if not groq_key:
            raise ValueError("GROQ_API_KEY not found")
            
        client = Groq(api_key=groq_key)
        completion = client.chat.completions.create(
            model="meta-llama/llama-4-scout-17b-16e-instruct",
            messages=messages,
            temperature=0.4,
            response_format={"type": "json_object"}
        )
        
        result_str = completion.choices[0].message.content
        result = json.loads(result_str)
        return {
            "status": "success",
            "reply": result.get("reply", "I analyzed your project but couldn't generate a specific response.")
        }
        
    except Exception as e:
        print(f"Groq project chat failed: {e}. Falling back to Gemini...")
        
        try:
            import google.generativeai as genai
            gemini_key = os.getenv("GEMINI_API_KEY")
            if not gemini_key:
                raise ValueError("GEMINI_API_KEY not found, and Groq failed.")
                
            genai.configure(api_key=gemini_key)
            model = genai.GenerativeModel('gemini-3.6-flash', generation_config={"response_mime_type": "application/json"})
            
            # Flatten messages into a single prompt for Gemini
            full_prompt = system_prompt + "\n\n"
            for msg in request.chat_history:
                role_label = "User" if msg.get("role") == "user" else "Assistant"
                full_prompt += f"{role_label}: {msg.get('text', '')}\n"
            full_prompt += f"User: {request.user_prompt}"
            
            response = model.generate_content(full_prompt)
            result = json.loads(response.text)
            return {
                "status": "success",
                "reply": result.get("reply", "I analyzed your project but couldn't generate a specific response.")
            }
        except Exception as e2:
            print(f"Gemini project chat also failed: {e2}")
            raise HTTPException(status_code=500, detail=f"AI service unavailable: {str(e2)}")

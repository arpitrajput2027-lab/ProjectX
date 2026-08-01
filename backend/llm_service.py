import os
import json
from dotenv import load_dotenv
from groq import Groq
import google.generativeai as genai
from pydantic import BaseModel, Field
from typing import List, Optional

load_dotenv()

# Models
class EducationEntry(BaseModel):
    institution: str
    degree: str
    field_of_study: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    gpa: Optional[str] = None
    location: Optional[str] = None

class ExperienceEntry(BaseModel):
    company: str
    role: str
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    location: Optional[str] = None
    description: Optional[str] = None

class ProjectEntry(BaseModel):
    title: str
    description: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    live_url: Optional[str] = None
    github_url: Optional[str] = None

class SkillCategory(BaseModel):
    category_name: str
    skills_list: str

class AchievementEntry(BaseModel):
    title: str
    description: Optional[str] = None
    date: Optional[str] = None

class CertificationEntry(BaseModel):
    name: str
    issuer: Optional[str] = None
    date: Optional[str] = None
    url: Optional[str] = None

class ResumeExtraction(BaseModel):
    education: List[EducationEntry] = []
    experience: List[ExperienceEntry] = []
    projects: List[ProjectEntry] = []
    skills: List[SkillCategory] = []
    achievements: List[AchievementEntry] = []
    certifications: List[CertificationEntry] = []

def extract_resume_data(raw_text: str) -> dict:
    """Extracts structured JSON from resume text using Groq with Gemini fallback."""
    
    system_prompt = """
    You are an expert ATS and resume parsing AI.
    Extract the following information from the provided resume text and return it as a structured JSON object.
    Ensure dates are in a consistent format (e.g., 'Jan 2020 - Present' or '2020 - 2024').
    If a field is not found, omit it or set it to null.
    
    The JSON should have these keys:
    - education (array of objects with: institution, degree, field_of_study, start_date, end_date, gpa, location)
    - experience (array of objects with: company, role, start_date, end_date, location, description)
    - projects (array of objects with: title, description, start_date, end_date, live_url, github_url)
    - skills (array of objects with: category_name (e.g., 'Languages', 'Frameworks'), skills_list (comma separated string))
    - achievements (array of objects with: title, description, date. Includes co-curricular activities, awards, scholarships)
    - certifications (array of objects with: name, issuer, date, url)
    
    Return ONLY valid JSON matching this schema. Do not include markdown formatting or explanations.
    """
    
    try:
        # Try Groq first
        groq_key = os.getenv("GROQ_API_KEY")
        if not groq_key:
            raise ValueError("GROQ_API_KEY not found")
            
        client = Groq(api_key=groq_key)
        completion = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": f"Resume Text:\n{raw_text}"}
            ],
            temperature=0,
            response_format={"type": "json_object"}
        )
        
        result_str = completion.choices[0].message.content
        return json.loads(result_str)
        
    except Exception as e:
        print(f"Groq extraction failed: {e}. Falling back to Gemini...")
        
        # Fallback to Gemini
        gemini_key = os.getenv("GEMINI_API_KEY")
        if not gemini_key:
            raise ValueError("GEMINI_API_KEY not found, and Groq failed.")
            
        genai.configure(api_key=gemini_key)
        model = genai.GenerativeModel('gemini-2.0-flash', generation_config={"response_mime_type": "application/json"})
        
        prompt = f"{system_prompt}\n\nResume Text:\n{raw_text}"
        response = model.generate_content(prompt)
        
        return json.loads(response.text)

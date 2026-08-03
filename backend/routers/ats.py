from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from database import get_supabase
from ats_service import analyze_ats_score, match_resume_to_jd, customize_resume_for_jd

router = APIRouter()

class AtsCheckRequest(BaseModel):
    resume_data: dict
    user_id: Optional[str] = None

class JdMatchRequest(BaseModel):
    resume_data: dict
    job_description: str
    user_id: Optional[str] = None

class CustomizeRequest(BaseModel):
    resume_data: dict
    job_description: str
    match_analysis: Optional[dict] = None
    user_id: Optional[str] = None

@router.post("/check")
def check_resume(request: AtsCheckRequest):
    try:
        result = analyze_ats_score(request.resume_data)
        
        # Optionally save to Supabase
        if request.user_id:
            try:
                supabase = get_supabase()
                supabase.table("ats_checks").insert({
                    "user_id": request.user_id,
                    "overall_score": result.get("overall_score", 0),
                    "dimension_scores": result.get("dimension_scores", []),
                    "missing_keywords": result.get("missing_keywords", []),
                    "recommendations": result.get("section_recommendations", []),
                    "strengths": result.get("strengths", []),
                    "weaknesses": result.get("weaknesses", [])
                }).execute()
            except Exception as e:
                print(f"Warning: Failed to save ATS check to DB: {e}")
                
        return result
    except Exception as e:
        print(f"Error in ATS check: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/match-jd")
def match_jd(request: JdMatchRequest):
    try:
        result = match_resume_to_jd(request.resume_data, request.job_description)
        
        # Optionally save to Supabase
        if request.user_id:
            try:
                supabase = get_supabase()
                supabase.table("jd_matches").insert({
                    "user_id": request.user_id,
                    "job_description_text": request.job_description,
                    "overall_match_score": result.get("overall_match_score", 0),
                    "readiness_score": result.get("readiness_score", 0),
                    "matched_skills": result.get("matched_skills", []),
                    "missing_skills": result.get("missing_skills", []),
                    "recommendations": result.get("recommendations", [])
                }).execute()
            except Exception as e:
                print(f"Warning: Failed to save JD match to DB: {e}")
                
        return result
    except Exception as e:
        print(f"Error in JD match: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/customize")
def customize_resume(request: CustomizeRequest):
    try:
        match_analysis = request.match_analysis or {}
        result = customize_resume_for_jd(request.resume_data, request.job_description, match_analysis)
        return result
    except Exception as e:
        print(f"Error customizing resume: {e}")
        raise HTTPException(status_code=500, detail=str(e))

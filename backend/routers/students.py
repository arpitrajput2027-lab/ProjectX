from fastapi import APIRouter, HTTPException
import os
from database import get_supabase
from readyindex_scorer import compute_katalyst_score

router = APIRouter()

@router.post("/onboarding")
def complete_onboarding():
    return {"message": "Onboarding completed"}

@router.get("/me")
def get_student_profile():
    return {"message": "Student profile data"}

@router.post("/{student_id}/katalyst-score")
def calculate_score(student_id: str):
    try:
        supabase = get_supabase()
        
        # 1. Fetch Student Profile
        res = supabase.table("student_profiles").select("*").eq("id", student_id).maybe_single().execute()
        if not res.data:
            raise HTTPException(status_code=404, detail="Student profile not found")
            
        profile = res.data
        
        # 2. Compute Score
        github_token = os.environ.get("GITHUB_TOKEN", "")
        score_data = compute_katalyst_score(profile, github_token)
        
        # 3. Save to DB
        supabase.table("student_profiles").update({
            "katalyst_score": score_data["total_score"],
            "katalyst_score_breakdown": score_data["components"]
        }).eq("id", student_id).execute()
        
        return {"message": "Score calculated successfully", "data": score_data}
    except Exception as e:
        print(f"Error in calculate_score: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{student_id}/katalyst-score")
def get_score(student_id: str):
    supabase = get_supabase()
    res = supabase.table("student_profiles").select("katalyst_score, katalyst_score_breakdown").eq("id", student_id).maybe_single().execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Student profile not found")
        
    return {"data": res.data}

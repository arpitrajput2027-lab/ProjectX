from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from database import get_supabase
from datetime import datetime

router = APIRouter()

class ScheduleInterviewRequest(BaseModel):
    application_id: str
    scheduled_at: str # ISO string
    duration_minutes: int = 60
    interviewer_name: str
    meeting_link: Optional[str] = None

class FeedbackRequest(BaseModel):
    rating: int
    feedback_text: str
    recommendation: str

@router.post("/")
def schedule_interview(req: ScheduleInterviewRequest):
    supabase = get_supabase()
    
    # Insert interview
    res = supabase.table("interviews").insert({
        "application_id": req.application_id,
        "scheduled_at": req.scheduled_at,
        "duration_minutes": req.duration_minutes,
        "interviewer_name": req.interviewer_name,
        "meeting_link": req.meeting_link,
        "status": "SCHEDULED"
    }).execute()
    
    # Update application status
    supabase.table("applications").update({"status": "interview_scheduled"}).eq("id", req.application_id).execute()
    
    return {"message": "Interview scheduled", "data": res.data[0]}

@router.get("/")
def get_interviews():
    supabase = get_supabase()
    res = supabase.table("interviews").select(
        "*, applications(id, status, jobs(title), student_profiles(full_name))"
    ).execute()
    return {"data": res.data}

@router.patch("/{interview_id}/feedback")
def submit_feedback(interview_id: str, req: FeedbackRequest):
    supabase = get_supabase()
    
    res = supabase.table("interviews").update({
        "rating": req.rating,
        "feedback_text": req.feedback_text,
        "recommendation": req.recommendation,
        "status": "COMPLETED"
    }).eq("id", interview_id).execute()
    
    if not res.data:
        raise HTTPException(status_code=404, detail="Interview not found")
        
    # Update application status
    app_id = res.data[0]["application_id"]
    new_status = "selected" if req.recommendation in ["STRONG_HIRE", "HIRE"] else "rejected"
    supabase.table("applications").update({"status": new_status}).eq("id", app_id).execute()
        
    return {"message": "Feedback submitted successfully"}

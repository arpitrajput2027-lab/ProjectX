from fastapi import APIRouter

router = APIRouter()

@router.post("/onboarding")
def complete_onboarding():
    return {"message": "Onboarding completed"}

@router.get("/me")
def get_student_profile():
    return {"message": "Student profile data"}

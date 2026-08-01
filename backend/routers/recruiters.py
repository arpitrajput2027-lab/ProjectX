from fastapi import APIRouter

router = APIRouter()

@router.post("/jobs")
def create_job():
    return {"message": "Create a job post"}

@router.get("/talent-pool")
def get_talent_pool():
    return {"message": "Get talent pool candidates"}

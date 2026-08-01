from fastapi import APIRouter

router = APIRouter()

@router.get("/")
def get_jobs():
    return {"message": "Get list of jobs"}

@router.get("/{job_id}")
def get_job(job_id: str):
    return {"message": f"Get job {job_id}"}

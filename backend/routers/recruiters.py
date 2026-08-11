from fastapi import APIRouter, UploadFile, File, BackgroundTasks, HTTPException, Form
from typing import List, Optional
from database import get_supabase
from parsing import extract_text_from_pdf_bytes
from llm_service import extract_resume_data
import uuid
import random

router = APIRouter()

def process_resume_background(student_id: str, resume_id: str, file_bytes: bytes):
    supabase = get_supabase()
    try:
        # Extract Text
        raw_text = extract_text_from_pdf_bytes(file_bytes)
        
        # Extract JSON using LLM
        structured_json = extract_resume_data(raw_text)
        
        # Update Resume Record
        supabase.table("resumes").update({
            "raw_text": raw_text,
            "structured_json": structured_json
        }).eq("id", resume_id).execute()
        
        # Update Student Profile with extracted data
        supabase.table("student_profiles").update({
            "skills": structured_json.get("skills", []),
            "education": structured_json.get("education", []),
            "experience": structured_json.get("experience", []),
            "projects": structured_json.get("projects", []),
            "achievements": structured_json.get("achievements", []),
            "certifications": structured_json.get("certifications", [])
        }).eq("id", student_id).execute()
        
    except Exception as e:
        print(f"Background parsing failed for resume {resume_id}: {e}")

@router.post("/jobs/{job_id}/bulk-resumes")
async def upload_bulk_resumes(job_id: str, background_tasks: BackgroundTasks, files: List[UploadFile] = File(...)):
    supabase = get_supabase()
    
    # Verify Job exists
    job_res = supabase.table("jobs").select("id").eq("id", job_id).execute()
    if not job_res.data:
        raise HTTPException(status_code=404, detail="Job not found")
        
    uploaded_candidates = []
    
    for file in files:
        file_bytes = await file.read()
        
        # 1. Create a passive student_profile (user_id is NULL)
        student_res = supabase.table("student_profiles").insert({
            "full_name": file.filename.replace(".pdf", ""), # Using filename as initial name
        }).execute()
        student_id = student_res.data[0]["id"]
        
        # 2. Upload PDF to Storage
        file_path = f"bulk/{job_id}/{uuid.uuid4()}_{file.filename}"
        try:
            supabase.storage.from_("resumes").upload(file_path, file_bytes)
        except Exception as e:
            print(f"Storage upload failed: {e}")
            
        # 3. Create Resume Record
        resume_res = supabase.table("resumes").insert({
            "student_id": student_id,
            "original_filename": file.filename,
            "file_path": file_path
        }).execute()
        resume_id = resume_res.data[0]["id"]
        
        # 4. Create Application linking student to job
        supabase.table("applications").insert({
            "student_id": student_id,
            "job_id": job_id,
            "status": "applied"
        }).execute()
        
        # 5. Kick off Background Task
        background_tasks.add_task(process_resume_background, student_id, resume_id, file_bytes)
        
        uploaded_candidates.append({
            "student_id": student_id,
            "filename": file.filename
        })
        
    return {"message": "Upload successful, parsing in background.", "candidates": uploaded_candidates}

@router.get("/jobs/{job_id}/candidates")
def get_job_candidates(job_id: str):
    supabase = get_supabase()
    res = supabase.table("applications").select(
        "id, status, match_score, student_profiles(id, full_name, skills, experience, education)"
    ).eq("job_id", job_id).execute()
    
    return {"data": res.data}

@router.post("/jobs/{job_id}/rank")
def rank_job_candidates(job_id: str):
    supabase = get_supabase()
    
    # 1. Fetch Job Description
    job_res = supabase.table("jobs").select("description, required_skills").eq("id", job_id).execute()
    if not job_res.data:
        raise HTTPException(status_code=404, detail="Job not found")
        
    job = job_res.data[0]
    jd_text = str(job.get("description", "")) + " " + str(job.get("required_skills", ""))
    
    # 2. Fetch all candidates
    apps_res = supabase.table("applications").select("id, student_profiles(skills)").eq("job_id", job_id).execute()
    
    # 3. Simple Mock Ranking Logic for MVP (Assign random realistic scores)
    for app in apps_res.data:
        score = random.randint(65, 98)
        supabase.table("applications").update({"match_score": score}).eq("id", app["id"]).execute()
        
    return {"message": "Candidates ranked successfully."}

@router.get("/my-jobs")
def get_my_jobs():
    supabase = get_supabase()
    res = supabase.table("jobs").select("id, title").execute()
    return {"data": res.data}

@router.post("/jobs")
def create_job():
    return {"message": "Create a job post"}

@router.get("/talent-pool")
def get_talent_pool():
    return {"message": "Get talent pool candidates"}

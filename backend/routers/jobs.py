from typing import Optional, List
import json
import re
import io

from fastapi import APIRouter, HTTPException, UploadFile, File

from parsing import extract_text_from_pdf_bytes
from jobs_store import store, job_from_raw
from jobs_models import Job, RefreshResponse
import jobs_search_pipeline as search_pipeline

router = APIRouter()


@router.get("", response_model=List[Job])
@router.get("/", response_model=List[Job])
def list_jobs(
    keyword: Optional[str] = None,
    location: Optional[str] = None,
    work_mode: Optional[str] = None,
    min_score: int = 0,
    sort_by: str = "latest",  # "latest" | "score"
):
    jobs = store.all(sort_by=sort_by)
    if keyword:
        k = keyword.lower()
        jobs = [j for j in jobs if k in j.job_title.lower() or k in (j.company or "").lower()]
    if location:
        loc = location.lower()
        jobs = [j for j in jobs if loc in (j.location or "").lower()]
    if work_mode and work_mode != "any":
        jobs = [j for j in jobs if j.work_mode == work_mode]
    if min_score:
        jobs = [j for j in jobs if j.match_score >= min_score]
    return jobs


@router.get("/saved", response_model=List[Job])
def list_saved():
    return store.saved_jobs()


@router.get("/{job_id}", response_model=Job)
def get_job(job_id: str):
    job = store.get(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Role not found")
    return job


@router.post("/{job_id}/save", response_model=Job)
def toggle_save(job_id: str):
    job = store.toggle_saved(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Role not found")
    return job


@router.post("/{job_id}/apply", response_model=Job)
def apply_to_job(job_id: str, mode: str = "manual"):
    job = store.mark_applied(job_id, mode=mode)
    if not job:
        raise HTTPException(status_code=404, detail="Role not found")
    return job


@router.post("/refresh", response_model=RefreshResponse)
def refresh_jobs(
    resume_text: Optional[str] = None,
    job_roles: Optional[List[str]] = None,
    location: Optional[str] = None,
):
    """Runs the live DuckDuckGo + Sarvam pipeline and merges new roles into the store."""
    try:
        raw_jobs = search_pipeline.run_search(
            resume_text=resume_text,
            job_roles=job_roles,
            location=location,
        )
    except RuntimeError as e:
        raise HTTPException(status_code=400, detail=str(e))

    added = 0
    for raw in raw_jobs:
        job = job_from_raw(
            job_title=raw.get("job_title") or "Untitled role",
            company=raw.get("company"),
            location=raw.get("location"),
            remote_flag=str(raw.get("remote", "false")),
            match_score=int(raw.get("match_score", 0) or 0),
            match_reason=raw.get("match_reason"),
            source_url=raw.get("source_url"),
            source_title=raw.get("source_title"),
        )
        if store.upsert(job):
            added += 1

    return RefreshResponse(
        added=added,
        total=len(store.all()),
        message=f"{added} new roles indexed." if added else "No new roles this pass.",
    )


def _parse_resume_with_llm(resume_text: str) -> dict:
    prompt = f"""Neeche ek candidate ka resume diya gaya hai.
Is resume ko analyze karo aur candidate ke profile ke matching details extract karo:
1. Target Job Roles (suggested job titles, max 3, e.g. ["Python Developer", "Data Analyst"])
2. Target Location (e.g. "Bangalore", "Delhi", "Remote", or null)
3. Target Work Mode (remote | hybrid | onsite | any)

STRICT RULES:
- Target Job Roles aur skills ke basis par realistic role suggestions do.
- Output MUST be a valid JSON object matching this schema:
{{"suggested_roles": [...], "suggested_location": "...", "suggested_work_mode": "..."}}

Do NOT return any other text, reasoning, or markdown wrapper. Return ONLY the raw JSON string.

Resume:
{resume_text[:6000]}
"""
    try:
        content = search_pipeline._call_sarvam([{"role": "user", "content": prompt}])
        content = re.sub(r"```json|```", "", content).strip()
        data = json.loads(content)
        return {
            "suggested_roles": data.get("suggested_roles", []),
            "suggested_location": data.get("suggested_location") or "India",
            "suggested_work_mode": data.get("suggested_work_mode") or "any",
        }
    except Exception as e:
        print(f"Failed to parse resume with LLM: {e}")
        return {
            "suggested_roles": ["Software Engineer"],
            "suggested_location": "India",
            "suggested_work_mode": "any",
        }


@router.post("/parse-resume")
async def parse_resume(file: UploadFile = File(...)):
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are acceptable.")
    
    try:
        content_bytes = await file.read()
        resume_text = extract_text_from_pdf_bytes(content_bytes)
        
        if not resume_text.strip():
            raise HTTPException(status_code=400, detail="Could not extract text from the PDF file.")
            
        parsed = _parse_resume_with_llm(resume_text)
        parsed["resume_text"] = resume_text
        
        return parsed
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to parse resume: {str(e)}")

import csv
import hashlib
import os
import re
import time
from typing import Optional, List

from jobs_models import Job

SEED_CSV = os.path.join(os.path.dirname(__file__), "seed_jobs.csv")

TAG_KEYWORDS = [
    "Python", "Django", "FastAPI", "React", "TypeScript", "JavaScript",
    "Node", "SQL", "AWS", "Docker", "AI", "ML", "Data", "REST",
    "PostgreSQL", "Full Stack", "Tailwind",
]

SKILL_HINTS = {
    "python": "Python", "django": "Django", "fastapi": "FastAPI",
    "react": "React", "typescript": "TypeScript", "javascript": "JavaScript",
    "node": "Node", "sql": "SQL", "aws": "AWS", "docker": "Docker",
    " ai": "AI", "ml ": "ML", "data": "Data", "full stack": "Full Stack",
}


def _match_label(score: int) -> str:
    if score >= 85:
        return "Strong match"
    if score >= 70:
        return "Good match"
    if score >= 50:
        return "Fair match"
    return "Long shot"


def _work_mode(remote_flag: str, title: str, location: str) -> str:
    text = f"{title} {location}".lower()
    if remote_flag.strip().lower() == "true" or "remote" in text:
        return "remote"
    if "hybrid" in text:
        return "hybrid"
    if location and location.strip():
        return "onsite"
    return "unknown"


def _seniority(title: str) -> str:
    t = title.lower()
    if any(k in t for k in ["intern", "trainee", "fresher"]):
        return "entry"
    if any(k in t for k in ["senior", "sr.", "lead", "staff", "principal"]):
        return "senior"
    return "mid"


def _tags(title: str) -> List[str]:
    t = title.lower()
    found = []
    for hint, label in SKILL_HINTS.items():
        if hint in t and label not in found:
            found.append(label)
    return found[:5] if found else ["General"]


def _source_platform(url: str) -> str:
    if not url:
        return "Web"
    if "linkedin" in url:
        return "LinkedIn"
    if "naukri" in url:
        return "Naukri"
    if "indeed" in url:
        return "Indeed"
    return "Web"


def _make_id(*parts: str) -> str:
    raw = "|".join(p or "" for p in parts)
    return hashlib.sha1(raw.encode("utf-8")).hexdigest()[:12]


def job_from_raw(
    job_title: str,
    company: Optional[str],
    location: Optional[str],
    remote_flag: str = "false",
    match_score: int = 0,
    match_reason: Optional[str] = None,
    source_url: Optional[str] = None,
    source_title: Optional[str] = None,
) -> Job:
    return Job(
        id=_make_id(job_title, company or "", source_url or ""),
        job_title=job_title,
        company=company or None,
        location=location or None,
        work_mode=_work_mode(remote_flag, job_title, location or ""),
        seniority=_seniority(job_title),
        tags=_tags(job_title),
        match_score=match_score,
        match_label=_match_label(match_score),
        match_reason=match_reason,
        source_platform=_source_platform(source_url or ""),
        source_url=source_url,
        posted_relative="Indexed this session",
        created_at=time.time(),
    )


def load_seed_jobs() -> List[Job]:
    jobs: List[Job] = []
    if not os.path.exists(SEED_CSV):
        return jobs
    with open(SEED_CSV, newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            try:
                score = int(float(row.get("match_score") or 0))
            except ValueError:
                score = 0
            jobs.append(
                job_from_raw(
                    job_title=row.get("job_title") or "Untitled role",
                    company=row.get("company"),
                    location=row.get("location"),
                    remote_flag=row.get("remote", "false"),
                    match_score=score,
                    match_reason=row.get("match_reason"),
                    source_url=row.get("source_url"),
                    source_title=row.get("source_title"),
                )
            )
    return jobs


class JobStore:
    """Simple in-memory store. Swap for a real DB when you're ready."""

    def __init__(self):
        self._jobs: dict[str, Job] = {}
        self._counter = 0
        for job in load_seed_jobs():
            self._insert(job)

    def _insert(self, job: Job) -> None:
        job.indexed_order = self._counter
        self._counter += 1
        self._jobs[job.id] = job

    def all(self, sort_by: str = "latest") -> List[Job]:
        jobs = list(self._jobs.values())
        if sort_by == "score":
            return sorted(jobs, key=lambda j: (j.match_score, j.indexed_order), reverse=True)
        # default: most recently indexed job first
        return sorted(jobs, key=lambda j: j.indexed_order, reverse=True)

    def get(self, job_id: str) -> Optional[Job]:
        return self._jobs.get(job_id)

    def upsert(self, job: Job) -> bool:
        """Returns True if this was a new job. Existing jobs are left untouched
        (their saved/applied state and original indexed_order are preserved)."""
        is_new = job.id not in self._jobs
        if is_new:
            self._insert(job)
        return is_new

    def toggle_saved(self, job_id: str) -> Optional[Job]:
        job = self._jobs.get(job_id)
        if job:
            job.saved = not job.saved
        return job

    def mark_applied(self, job_id: str, mode: str = "manual") -> Optional[Job]:
        job = self._jobs.get(job_id)
        if job:
            job.applied = True
            job.apply_mode = mode
        return job

    def saved_jobs(self) -> List[Job]:
        jobs = [j for j in self._jobs.values() if j.saved]
        return sorted(jobs, key=lambda j: j.indexed_order, reverse=True)


store = JobStore()

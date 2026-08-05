from typing import Optional, List
from pydantic import BaseModel

class Job(BaseModel):
    id: str
    job_title: str
    company: Optional[str] = None
    location: Optional[str] = None
    work_mode: str = "unknown"          # remote | hybrid | onsite | unknown
    seniority: str = "unknown"          # entry | mid | senior | unknown
    tags: List[str] = []
    match_score: int = 0
    match_label: str = "Unscored"
    match_reason: Optional[str] = None
    source_platform: Optional[str] = None
    source_url: Optional[str] = None
    posted_relative: str = "Recently indexed"
    saved: bool = False
    applied: bool = False
    apply_mode: Optional[str] = None  # "manual" | "agentic" | None
    created_at: float = 0.0             # unix timestamp
    indexed_order: int = 0              # monotonic tie-breaker

class ToggleResponse(BaseModel):
    id: str
    saved: Optional[bool] = None
    applied: Optional[bool] = None

class RefreshResponse(BaseModel):
    added: int
    total: int
    message: str

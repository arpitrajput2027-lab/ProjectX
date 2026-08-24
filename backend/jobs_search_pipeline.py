"""
Live job search pipeline: DuckDuckGo raw results -> Sarvam-105B extraction.
"""
import os
import json
import re
from typing import Optional, List

import requests
from ddgs import DDGS

# Load environment keys (these are loaded by backend/main.py or dotenv)
SARVAM_API_KEY = os.getenv("SARVAM_API_KEY", "")
SARVAM_BASE_URL = os.getenv("SARVAM_BASE_URL", "https://api.sarvam.ai/v1/chat/completions")
SARVAM_MODEL = os.getenv("SARVAM_MODEL", "sarvam-105b")
SERPAPI_API_KEY = os.getenv("SERPAPI_API_KEY", "")

DEFAULT_SEARCH_QUERIES = [
    '"Python Developer" (jobs OR hiring OR careers) "Remote" India',
    '"Python Developer" (jobs OR hiring OR careers) "Delhi"',
    '"Data Analyst" (jobs OR hiring OR careers) "Remote" India',
]

LISTING_PAGE_PATTERNS = [
    r"^\d[\d,]*\+?\s*(jobs|vagas|python|django|data|remote|fastapi)",
    r"jobs in \w+",
    r"^\d[\d,]*\+?\s",
]

NON_JOB_URL_PATTERNS = [
    r"indeed\.com/?$",
    r"assessment\.",
    r"/campus/career-guidance",
    r"/cmp/.*reviews",
    r"how-to-become",
]


def _is_listing_page(title: str) -> bool:
    t = title.lower()
    return any(re.search(p, t) for p in LISTING_PAGE_PATTERNS)


def _is_non_job_page(url: str, title: str) -> bool:
    combined = f"{url} {title}".lower()
    return any(re.search(p, combined) for p in NON_JOB_URL_PATTERNS)


def _call_sarvam(messages, max_tokens=4096, temperature=0.2) -> str:
    api_key = os.getenv("SARVAM_API_KEY", SARVAM_API_KEY)
    if not api_key:
        raise RuntimeError("SARVAM_API_KEY is not set. Add it to backend/.env")
    headers = {
        "Content-Type": "application/json",
        "api-subscription-key": api_key,
    }
    payload = {
        "model": os.getenv("SARVAM_MODEL", SARVAM_MODEL),
        "messages": messages,
        "max_tokens": max_tokens,
        "temperature": temperature,
        "reasoning_effort": None,
    }
    base_url = os.getenv("SARVAM_BASE_URL", SARVAM_BASE_URL)
    resp = requests.post(base_url, headers=headers, json=payload, timeout=60)
    resp.raise_for_status()
    return resp.json()["choices"][0]["message"]["content"]


def _extract_jobs_from_snippet(snippet: str, source_url: str, source_title: str) -> List[dict]:
    prompt = f"""Neeche ek job-search snippet diya gaya hai jo search engine se aaya hai.
Isme kai jobs ek saath mix ho sakti hain. Har alag REAL job listing ko identify karo
aur JSON array format me return karo.

STRICT RULES:
- Sirf tab extract karo jab snippet me ek clear, specific job opening ho.
- Homepage navigation links ya generic aggregator text ignore karo.
- Confident nahi ho? Empty array [] do.

Format:
[{{"job_title": "...", "company": "... (ya null)", "location": "...", "remote": true/false}}]

SIRF JSON return karo, koi extra text nahi.

Source: {source_title}
Snippet: {snippet}
"""
    try:
        content = _call_sarvam([{"role": "user", "content": prompt}])
        content = re.sub(r"```json|```", "", content).strip()
        jobs = json.loads(content)
        for job in jobs:
            job["source_url"] = source_url
            job["source_title"] = source_title
        return jobs
    except Exception:
        return []


def _score_job_match(job: dict, resume_text: str) -> tuple[int, str]:
    prompt = f"""Resume:
{resume_text}

Job:
Title: {job.get('job_title')}
Company: {job.get('company')}
Location: {job.get('location')}
Remote: {job.get('remote')}

Is job ka resume se match kitna achha hai? SIRF JSON return karo:
{{"score": <0-100>, "reason": "<1 line reasoning in Hinglish>"}}
"""
    try:
        content = _call_sarvam([{"role": "user", "content": prompt}], max_tokens=4096)
        content = re.sub(r"```json|```", "", content).strip()
        result = json.loads(content)
        return int(result.get("score", 0)), result.get("reason", "")
    except Exception:
        return 0, "scoring unavailable"


def _search(query: str, max_results: int = 15) -> List[dict]:
    results = []
    try:
        with DDGS() as ddgs:
            for r in ddgs.text(query, max_results=max_results, timelimit="w"):
                results.append({
                    "title": r.get("title", ""),
                    "url": r.get("href", ""),
                    "snippet": r.get("body", ""),
                })
    except Exception:
        pass
    return results


def _search_serpapi(query: str, api_key: str) -> List[dict]:
    """Search Google Jobs using SerpApi."""
    if not api_key:
        return []
    url = "https://serpapi.com/search"
    params = {
        "engine": "google_jobs",
        "q": query,
        "api_key": api_key,
        "hl": "en",
        "chips": "date_posted:week",
    }
    try:
        resp = requests.get(url, params=params, timeout=20)
        resp.raise_for_status()
        data = resp.json()
        jobs_results = data.get("jobs_results", [])
        extracted = []
        for j in jobs_results:
            title = j.get("title") or "Untitled role"
            company = j.get("company_name")
            location = j.get("location")
            
            # Check if remote
            is_remote = False
            location_lower = (location or "").lower()
            if "remote" in location_lower or "work from home" in location_lower:
                is_remote = True
            for ext in j.get("extensions", []):
                if "work from home" in ext.lower() or "remote" in ext.lower():
                    is_remote = True
                    break
            
            # Extract source URL from apply_options
            source_url = None
            apply_options = j.get("apply_options", [])
            if apply_options:
                source_url = apply_options[0].get("link")
                source_title = apply_options[0].get("title") or j.get("via", "Google Jobs")
            else:
                source_title = j.get("via", "Google Jobs")
            
            if source_title.lower().startswith("via "):
                source_title = source_title[4:]
                
            extracted.append({
                "job_title": title,
                "company": company,
                "location": location,
                "remote": is_remote,
                "source_url": source_url,
                "source_title": source_title,
            })
        return extracted
    except Exception as e:
        print(f"SerpApi query '{query}' failed: {e}")
        return []


def build_queries_for_roles(
    job_roles: List[str],
    location: Optional[str] = None,
) -> List[str]:
    """Build DuckDuckGo search queries from user-chosen job roles + location."""
    queries: List[str] = []
    loc = location.strip() if location else "India"
    for role in job_roles:
        role = role.strip()
        if not role:
            continue
        queries.append(f'"{role}" (jobs OR hiring OR careers) "{loc}"')
    # Deduplicate while preserving order
    seen: set[str] = set()
    unique: List[str] = []
    for q in queries:
        if q not in seen:
            seen.add(q)
            unique.append(q)
    return unique


def run_search(
    resume_text: str | None = None,
    queries: List[str] | None = None,
    job_roles: List[str] | None = None,
    location: str | None = None,
) -> List[dict]:
    """Runs the full pipeline and returns a flat list of raw job dicts, ready for job_from_raw()."""
    extracted = []
    
    serpapi_key = os.getenv("SERPAPI_API_KEY", SERPAPI_API_KEY)
    # 1. SerpApi search (if api key is available)
    if serpapi_key:
        serpapi_queries = []
        if job_roles:
            loc_str = location.strip() if location else "India"
            for role in job_roles:
                serpapi_queries.append(f"{role} {loc_str}")
        else:
            for q in (queries or DEFAULT_SEARCH_QUERIES):
                clean_q = re.sub(r'site:\S+', '', q).replace('"', '').strip()
                serpapi_queries.append(clean_q)
                
        for sq in serpapi_queries:
            serpapi_jobs = _search_serpapi(sq, serpapi_key)
            extracted.extend(serpapi_jobs)
            
    # 2. DuckDuckGo search (Fallback if SerpApi fails or key is missing)
    if not extracted:
        ddg_queries = queries
        if not ddg_queries:
            if job_roles:
                ddg_queries = build_queries_for_roles(job_roles, location)
            else:
                ddg_queries = DEFAULT_SEARCH_QUERIES
                
        raw_results = []
        for q in ddg_queries:
            raw_results.extend(_search(q))
            
        for r in raw_results:
            if _is_listing_page(r["title"]) or _is_non_job_page(r["url"], r["title"]):
                continue
            ddg_jobs = _extract_jobs_from_snippet(r["snippet"], r["url"], r["title"])
            extracted.extend(ddg_jobs)
        
    # 3. Deduplication by job title & company, or URL
    seen_jobs = set()
    deduped = []
    for job in extracted:
        title = (job.get("job_title") or "").strip().lower()
        company = (job.get("company") or "").strip().lower()
        url = (job.get("source_url") or "").strip()
        
        key = (title, company)
        url_key = url if url else None
        
        if key in seen_jobs or (url_key and url_key in seen_jobs):
            continue
            
        seen_jobs.add(key)
        if url_key:
            seen_jobs.add(url_key)
        deduped.append(job)
    extracted = deduped
    
    # 4. Scoring (if resume text is present)
    if resume_text:
        for job in extracted:
            score, reason = _score_job_match(job, resume_text)
            job["match_score"] = score
            job["match_reason"] = reason

    return extracted

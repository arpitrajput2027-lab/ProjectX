import os
import requests
from fastapi import APIRouter, HTTPException
from typing import List, Optional
from pydantic import BaseModel

router = APIRouter()

SERPAPI_API_KEY = os.getenv("SERPAPI_API_KEY", "")

class CourseRecommendation(BaseModel):
    id: int
    title: str
    provider: str
    duration: str
    gap: str
    url: str

@router.get("/recommend", response_model=List[CourseRecommendation])
def recommend_courses(gap: str):
    if not SERPAPI_API_KEY:
        raise HTTPException(status_code=500, detail="SerpAPI key not configured")

    query = f"{gap} course certification site:udemy.com OR site:coursera.org"
    url = "https://serpapi.com/search"
    params = {
        "engine": "google",
        "q": query,
        "api_key": SERPAPI_API_KEY,
        "hl": "en",
        "num": 3
    }
    
    try:
        resp = requests.get(url, params=params, timeout=20)
        resp.raise_for_status()
        data = resp.json()
        
        organic_results = data.get("organic_results", [])
        
        courses = []
        for i, result in enumerate(organic_results[:3]):
            link = result.get("link", "")
            title = result.get("title", "")
            
            provider = "Web Resource"
            if "udemy.com" in link:
                provider = "Udemy"
            elif "coursera.org" in link:
                provider = "Coursera"
                
            courses.append(CourseRecommendation(
                id=i+1,
                title=title.split("|")[0].strip() if "|" in title else title,
                provider=provider,
                duration="Self-paced",
                gap=gap,
                url=link
            ))
            
        return courses
    except Exception as e:
        print(f"Failed to fetch courses from SerpApi: {e}")
        return []

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import auth, students, resumes, recruiters, jobs, ats, interviews, projects, mock_interview

app = FastAPI(title="AI Career OS API", version="1.0.0")


# Allow CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:3001", "http://127.0.0.1:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/auth", tags=["Auth"])
app.include_router(students.router, prefix="/api/students", tags=["Students"])
app.include_router(resumes.router, prefix="/api/resumes", tags=["Resumes"])
app.include_router(recruiters.router, prefix="/api/recruiters", tags=["Recruiters"])
app.include_router(jobs.router, prefix="/api/jobs", tags=["Jobs"])
app.include_router(ats.router, prefix="/api/ats", tags=["ATS"])
app.include_router(interviews.router, prefix="/api/interviews", tags=["Interviews"])
app.include_router(projects.router, prefix="/api/projects", tags=["Projects"])
app.include_router(mock_interview.router, prefix="/api/mock-interview", tags=["Mock Interview"])

@app.get("/")
def read_root():
    return {"message": "Welcome to AI Career OS API"}

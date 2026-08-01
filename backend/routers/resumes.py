from fastapi import APIRouter, UploadFile, File, HTTPException
from pydantic import BaseModel
import os
from parsing import extract_text_from_pdf_bytes
from llm_service import extract_resume_data

router = APIRouter()

@router.post("/parse")
async def parse_resume(file: UploadFile = File(...)):
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")
        
    try:
        # Read file bytes
        file_bytes = await file.read()
        
        # Extract raw text
        raw_text = extract_text_from_pdf_bytes(file_bytes)
        if not raw_text or len(raw_text.strip()) < 50:
            raise HTTPException(
                status_code=400, 
                detail="Failed to extract text. Make sure your PDF is a text-based document, not a scanned image."
            )
            
        # Extract structured data using LLM
        structured_data = extract_resume_data(raw_text)
        
        return {
            "status": "success",
            "message": "Resume parsed successfully",
            "data": structured_data
        }
        
    except Exception as e:
        print(f"Error parsing resume: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to parse resume: {str(e)}")

@router.get("/{resume_id}")
def get_resume(resume_id: str):
    return {"message": f"Get resume {resume_id}"}

@router.put("/{resume_id}")
def update_resume(resume_id: str):
    return {"message": f"Update resume {resume_id}"}

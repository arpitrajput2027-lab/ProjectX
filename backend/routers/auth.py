from fastapi import APIRouter

router = APIRouter()

@router.post("/login")
def login():
    return {"message": "Login logic here"}

@router.post("/signup")
def signup():
    return {"message": "Signup logic here"}

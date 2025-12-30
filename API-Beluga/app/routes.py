from dotenv import load_dotenv
from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm

from app.auth import create_access_token, verify_token


load_dotenv()


router = APIRouter(prefix="/v1")


@router.get("/health")
def health_check():
    return {"status": "API is running"}


@router.post("/token")
def login(form_data: OAuth2PasswordRequestForm = Depends()):
    if form_data.username == "user" and form_data.password == "password":
        access_token = create_access_token(data={"sub": form_data.username})
        return {"access_token": access_token, "token_type": "bearer"}
    else:
        raise HTTPException(status_code=400, detail="Incorrect username or password")


@router.get("/protected")
def protected_route(payload: dict = Depends(verify_token)):
    return {"message": "This is a protected route", "payload": payload}

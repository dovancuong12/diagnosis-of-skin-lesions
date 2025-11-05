from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from models.user import User
from models.diagnosis import DiagnosisRequest
from schemas.user import UserCreate, UserResponse
from schemas.diagnosis import DiagnosisRequestCreate, DiagnosisRequestResponse
from api.deps import get_db

router = APIRouter()


@router.post("/", response_model=UserResponse)
def create_user(user: UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    db_user = User(
        username=user.username,
        email=user.email,
        full_name=user.full_name
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    return db_user


@router.get("/{user_id}", response_model=UserResponse)
def get_user(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@router.get("/{user_id}/diagnoses", response_model=List[DiagnosisRequestResponse])
def get_user_diagnoses(user_id: int, db: Session = Depends(get_db)):
    diagnoses = db.query(DiagnosisRequest).filter(DiagnosisRequest.user_id == user_id).all()
    return diagnoses
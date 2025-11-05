from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from typing import List
import uuid
import os
from datetime import datetime

from models.diagnosis import DiagnosisRequest
from models.user import User
from schemas.diagnosis import DiagnosisRequestCreate, DiagnosisRequestResponse, DiagnosisRequestUpdate
from api.deps import get_db

router = APIRouter()


@router.post("/", response_model=DiagnosisRequestResponse)
async def create_diagnosis_request(
    user_id: int,
    image: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    # Kiểm tra xem người dùng có tồn tại không
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Tạo tên file duy nhất
    file_extension = image.filename.split(".")[-1]
    unique_filename = f"{uuid.uuid4()}.{file_extension}"
    
    # Thư mục lưu trữ ảnh
    upload_dir = "uploads"
    if not os.path.exists(upload_dir):
        os.makedirs(upload_dir)
    
    file_path = os.path.join(upload_dir, unique_filename)
    
    # Lưu file
    with open(file_path, "wb") as buffer:
        content = await image.read()
        buffer.write(content)
    
    # Tạo bản ghi yêu cầu chẩn đoán
    diagnosis_request = DiagnosisRequest(
        user_id=user_id,
        image_path=file_path,
        status="pending"
    )
    
    db.add(diagnosis_request)
    db.commit()
    db.refresh(diagnosis_request)
    
    return diagnosis_request


@router.get("/{request_id}", response_model=DiagnosisRequestResponse)
def get_diagnosis_request(request_id: int, db: Session = Depends(get_db)):
    diagnosis_request = db.query(DiagnosisRequest).filter(
        DiagnosisRequest.id == request_id
    ).first()
    
    if not diagnosis_request:
        raise HTTPException(status_code=404, detail="Diagnosis request not found")
    
    return diagnosis_request


@router.put("/{request_id}", response_model=DiagnosisRequestResponse)
def update_diagnosis_request(
    request_id: int,
    diagnosis_update: DiagnosisRequestUpdate,
    db: Session = Depends(get_db)
):
    diagnosis_request = db.query(DiagnosisRequest).filter(
        DiagnosisRequest.id == request_id
    ).first()
    
    if not diagnosis_request:
        raise HTTPException(status_code=404, detail="Diagnosis request not found")
    
    # Cập nhật các trường được cung cấp
    if diagnosis_update.diagnosis_result is not None:
        diagnosis_request.diagnosis_result = diagnosis_update.diagnosis_result
    if diagnosis_update.confidence_score is not None:
        diagnosis_request.confidence_score = diagnosis_update.confidence_score
    if diagnosis_update.status is not None:
        diagnosis_request.status = diagnosis_update.status
        if diagnosis_update.status == "completed":
            diagnosis_request.completed_time = datetime.utcnow()
    
    db.commit()
    db.refresh(diagnosis_request)
    
    return diagnosis_request


@router.get("/user/{user_id}", response_model=List[DiagnosisRequestResponse])
def get_user_diagnosis_requests(user_id: int, db: Session = Depends(get_db)):
    diagnosis_requests = db.query(DiagnosisRequest).filter(
        DiagnosisRequest.user_id == user_id
    ).all()
    
    return diagnosis_requests
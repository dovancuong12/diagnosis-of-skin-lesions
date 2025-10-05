from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class DiagnosisRequestBase(BaseModel):
    user_id: int
    image_path: str
    diagnosis_result: Optional[str] = None
    confidence_score: Optional[str] = None
    status: str = "pending"


class DiagnosisRequestCreate(DiagnosisRequestBase):
    user_id: int
    image_path: str  # This will be set by the system based on the uploaded file


class DiagnosisRequestUpdate(BaseModel):
    diagnosis_result: Optional[str] = None
    confidence_score: Optional[str] = None
    status: Optional[str] = None


class DiagnosisRequestResponse(DiagnosisRequestBase):
    id: int
    request_time: datetime
    completed_time: Optional[datetime] = None
    
    class Config:
        from_attributes = True
from sqlalchemy import Column, Integer, String, DateTime, Text, ForeignKey, LargeBinary
from sqlalchemy.sql import func
from .database import Base


class DiagnosisRequest(Base):
    __tablename__ = "diagnosis_requests"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    image_path = Column(String)  # Đường dẫn lưu trữ ảnh
    image_data = Column(LargeBinary)  # Dữ liệu ảnh (nếu lưu trực tiếp)
    diagnosis_result = Column(Text)  # Kết quả chẩn đoán từ model
    confidence_score = Column(String)  # Độ tin cậy của kết quả
    request_time = Column(DateTime(timezone=True), server_default=func.now())
    completed_time = Column(DateTime(timezone=True))
    status = Column(String, default="pending")  # pending, processing, completed, failed
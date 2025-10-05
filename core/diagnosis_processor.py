from sqlalchemy.orm import Session
from ml_model.predictor import SkinLesionPredictor
from models.diagnosis import DiagnosisRequest
from datetime import datetime
import logging

# Cấu hình logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class DiagnosisProcessor:
    """
    Lớp xử lý chẩn đoán tổn thương da
    """
    
    def __init__(self):
        self.predictor = SkinLesionPredictor()
    
    def process_diagnosis_request(self, request_id: int, db: Session):
        """
        Xử lý yêu cầu chẩn đoán
        :param request_id: ID của yêu cầu chẩn đoán
        :param db: Session database
        :return: Kết quả chẩn đoán
        """
        try:
            # Lấy yêu cầu chẩn đoán từ DB
            diagnosis_request = db.query(DiagnosisRequest).filter(
                DiagnosisRequest.id == request_id
            ).first()
            
            if not diagnosis_request:
                logger.error(f"Diagnosis request with ID {request_id} not found")
                return None
            
            # Cập nhật trạng thái thành đang xử lý
            diagnosis_request.status = "processing"
            db.commit()
            
            # Gọi model để dự đoán
            prediction_result, confidence_score = self.predictor.predict(
                diagnosis_request.image_path
            )
            
            # Cập nhật kết quả vào DB
            diagnosis_request.diagnosis_result = prediction_result
            diagnosis_request.confidence_score = str(confidence_score)
            diagnosis_request.status = "completed"
            diagnosis_request.completed_time = datetime.utcnow()
            
            db.commit()
            db.refresh(diagnosis_request)
            
            logger.info(f"Diagnosis completed for request {request_id}")
            return diagnosis_request
            
        except Exception as e:
            logger.error(f"Error processing diagnosis request {request_id}: {str(e)}")
            
            # Cập nhật trạng thái lỗi vào DB
            diagnosis_request = db.query(DiagnosisRequest).filter(
                DiagnosisRequest.id == request_id
            ).first()
            
            if diagnosis_request:
                diagnosis_request.status = "failed"
                diagnosis_request.diagnosis_result = f"Error: {str(e)}"
                db.commit()
            
            return None


# Hàm tiện ích để xử lý yêu cầu chẩn đoán trong background
def process_diagnosis_background(request_id: int, db: Session):
    """
    Hàm xử lý chẩn đoán chạy trong nền (có thể được sử dụng với Celery hoặc thread)
    """
    processor = DiagnosisProcessor()
    return processor.process_diagnosis_request(request_id, db)
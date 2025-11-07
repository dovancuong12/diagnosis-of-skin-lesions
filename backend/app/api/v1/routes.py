from fastapi import APIRouter
from app.api.v1.endpoints import ml

router = APIRouter()

# Include routers
router.include_router(ml.router, prefix="/ml", tags=["machine learning"])

# Các routes khác có thể được thêm vào đây
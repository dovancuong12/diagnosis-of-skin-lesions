from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1.routes_predict import router as predict_router
from app.api.v1.routes_images import router as images_router
from app.api.v1.routes_cases import router as cases_router
from app.api.v1.routes_models import router as models_router
from app.api.v1.routes_logs import router as logs_router
from app.middlewares.audit import AuditMiddleware
from app.middlewares.cors import add_cors_middleware
from app.db.base import engine, Base
import uvicorn
import os

# Tạo database tables
Base.metadata.create_all(bind=engine)

# Khởi tạo ứng dụng FastAPI
app = FastAPI(
    title="Skin Lesion Diagnosis API",
    description="API for skin lesion diagnosis using deep learning",
    version="1.0.0"
)

# Thêm middleware
add_cors_middleware(app)
app.add_middleware(AuditMiddleware)

# Mount các router
app.include_router(predict_router, prefix="/api/v1", tags=["prediction"])
app.include_router(images_router, prefix="/api/v1", tags=["images"])
app.include_router(cases_router, prefix="/api/v1", tags=["cases"])
app.include_router(models_router, prefix="/api/v1", tags=["models"])
app.include_router(logs_router, prefix="/api/v1", tags=["logs"])

@app.get("/")
def read_root():
    return {"message": "Skin Lesion Diagnosis API"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)

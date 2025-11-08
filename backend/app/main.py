from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1.endpoints.ml import router as ml_router

app = FastAPI(
    title="Skin Lesion Diagnosis API",
    description="Basic API for skin lesion diagnosis",
    version="1.0.0"
)

# Thêm CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include router cho ml endpoints
app.include_router(ml_router, prefix="/api/v1/ml", tags=["machine learning"])

@app.get("/")
def read_root():
    return {"message": "Basic Skin Lesion Diagnosis API"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}
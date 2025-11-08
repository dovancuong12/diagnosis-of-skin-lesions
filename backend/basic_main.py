from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.api.v1.endpoints.ml import router as ml_router

app = FastAPI(
    title="Skin Lesion Diagnosis API",
    description="Basic API for skin lesion diagnosis",
    version="1.0.0"
)

# Thêm CORS middleware để cho phép frontend từ bất kỳ nguồn nào
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Cho phép tất cả các origins - chỉ dùng trong môi trường phát triển
    allow_credentials=True,
    allow_methods=["*"],  # Cho phép tất cả các phương thức HTTP
    allow_headers=["*"],  # Cho phép tất cả các header
    # Thêm các tùy chọn sau để xử lý lỗi CORS tốt hơn
    allow_origin_regex=None,
    # expose_headers=["Access-Control-Allow-Origin"] # Có thể thêm nếu cần
)

# Include router cho ml endpoints
app.include_router(ml_router, prefix="/api/v1/ml", tags=["machine learning"])

# Mount thư mục uploads để phục vụ file tĩnh
app.mount("/uploads", StaticFiles(directory="./uploads"), name="uploads")

@app.get("/")
def read_root():
    return {"message": "Basic Skin Lesion Diagnosis API"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8002)
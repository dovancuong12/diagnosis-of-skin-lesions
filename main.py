from fastapi import FastAPI
from api.routers import users, diagnosis

app = FastAPI(title="Skin Lesion Diagnosis API", version="1.0.0")

# Include routers
app.include_router(users.router, prefix="/api/v1/users", tags=["users"])
app.include_router(diagnosis.router, prefix="/api/v1/diagnosis", tags=["diagnosis"])

@app.get("/")
def read_root():
    return {"message": "Welcome to Skin Lesion Diagnosis API"}

# Endpoint để khởi tạo cơ sở dữ liệu
@app.get("/init-db")
def initialize_database():
    from scripts.init_db import init_db
    init_db()
    return {"message": "Database initialized successfully"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
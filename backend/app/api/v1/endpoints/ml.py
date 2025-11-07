from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse
import torch
import torchvision.transforms as transforms
import cv2
from PIL import Image
import os
from pathlib import Path
import uuid
import sys
from app.ml.efficientnet_model import EfficientNetClassifier

router = APIRouter()

# Device configuration
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# Load model function (copied from test.py)
def load_model_cls(model_path: str, device):
    ckpt = torch.load(model_path, map_location=device, weights_only=False)
    idx_to_class = ckpt["idx_to_class"]

    model = EfficientNetClassifier(
        num_classes=len(idx_to_class),
        embedding_dim=256,
        pretrained=True,
        apply_softmax=True
    ).to(device)

    model.load_state_dict(ckpt["model_state_dict"])
    model.transform = transforms.Compose([
            transforms.Resize((300, 300)),
            transforms.ToTensor(),
            transforms.Normalize(mean=[0.7539897561073303, 0.5854063034057617, 0.5899980068206787],
                                 std=[0.12629127502441406, 0.14309869706630707, 0.15721528232097626]),
    ])
    model.eval()
    
    return model, idx_to_class

def predict_class(model, idx_to_class, image):
    try:
        image_rgb = Image.fromarray(image).convert("RGB")
        with torch.no_grad():
            probs = model.predict_proba(image_rgb, device)
        pred_idx = torch.argmax(probs).item()
        pred_class = idx_to_class[pred_idx]
        return pred_class
    except Exception as e:
        raise e

# Load model once at startup
# Thử nhiều đường dẫn khác nhau để tìm model
raw_paths = [
    Path(__file__).parent / ".." / ".." / ".." / "ml" / "model" / "best_model.pth",  # Đường dẫn tương đối: endpoints → api → v1 → app → ml → model
    Path("backend/app/ml/model/best_model.pth"),  # Đường dẫn từ thư mục gốc
    Path(os.getcwd()) / "backend" / "app" / "ml" / "model" / "best_model.pth",  # Đường dẫn tuyệt đối từ thư mục hiện tại
]

# Giải quyết các đường dẫn để loại bỏ .. và .
model_paths = [str(path.resolve()) for path in raw_paths]

MODEL_PATH = None
for path in model_paths:
    if os.path.exists(path):
        MODEL_PATH = path
        break

if MODEL_PATH is None:
    raise FileNotFoundError(f"Model file not found at any of the expected paths: {model_paths}")

model, idx_to_class = load_model_cls(MODEL_PATH, device)

@router.post("/upload")
async def upload_image(file: UploadFile = File(...)):
    try:
        # Validate file type
        if not file.content_type.startswith("image/"):
            raise HTTPException(status_code=400, detail="File must be an image")
        
        # Create uploads directory if not exists
        uploads_dir = Path("uploads")
        uploads_dir.mkdir(parents=True, exist_ok=True)
        
        # Generate unique filename
        file_extension = Path(file.filename).suffix
        unique_filename = f"{uuid.uuid4()}{file_extension}"
        file_path = uploads_dir / unique_filename
        
        # Save file
        with open(file_path, "wb") as buffer:
            content = await file.read()
            buffer.write(content)
        
        return {
            "filename": unique_filename,
            "path": str(file_path),
            "message": "Image uploaded successfully"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")

@router.post("/predict")
async def predict_image(file: UploadFile = File(...)):
    try:
        # Validate file type
        if not file.content_type.startswith("image/"):
            raise HTTPException(status_code=400, detail="File must be an image")
        
        # Create uploads directory if not exists
        uploads_dir = Path("uploads")
        uploads_dir.mkdir(parents=True, exist_ok=True)
        
        # Generate unique filename
        file_extension = Path(file.filename).suffix
        unique_filename = f"{uuid.uuid4()}{file_extension}"
        file_path = uploads_dir / unique_filename
        
        # Save file temporarily
        with open(file_path, "wb") as buffer:
            content = await file.read()
            buffer.write(content)
        
        # Load and predict
        img = cv2.imread(str(file_path))
        if img is None:
            raise HTTPException(status_code=400, detail="Could not read image file")
        
        result_class = predict_class(model, idx_to_class, img)
        
        # Clean up - remove the temporary file after prediction
        os.remove(file_path)
        
        return {
            "filename": unique_filename,
            "prediction": result_class,
            "message": "Prediction completed successfully"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")

@router.post("/predict-from-upload/{filename}")
async def predict_from_uploaded_image(filename: str):
    try:
        file_path = Path(f"uploads/{filename}")
        
        if not file_path.exists():
            raise HTTPException(status_code=404, detail="File not found")
        
        img = cv2.imread(str(file_path))
        if img is None:
            raise HTTPException(status_code=400, detail="Could not read image file")
        
        result_class = predict_class(model, idx_to_class, img)
        
        return {
            "filename": filename,
            "prediction": result_class,
            "message": "Prediction completed successfully"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")
from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse
import torch
import torchvision.transforms as transforms
import cv2
from PIL import Image
import os
from pathlib import Path
import uuid
import sys
from app.ml.efficientnet_model import EfficientNetClassifier

from typing import List, Dict, Optional
import json
from datetime import datetime

router = APIRouter()

# In-memory storage for prediction history
prediction_history: List[Dict] = []

# Device configuration
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# Load model function (copied from test.py)
def load_model_cls(model_path: str, device):
    ckpt = torch.load(model_path, map_location=device, weights_only=False)
    idx_to_class = ckpt["idx_to_class"]

    model = EfficientNetClassifier(
        num_classes=len(idx_to_class),
        embedding_dim=256,
        pretrained=True,
        apply_softmax=True
    ).to(device)

    model.load_state_dict(ckpt["model_state_dict"])
    model.transform = transforms.Compose([
            transforms.Resize((300, 300)),
            transforms.ToTensor(),
            transforms.Normalize(mean=[0.7539897561073303, 0.5854063034057617, 0.5899980068206787],
                                 std=[0.12629127502441406, 0.14309869706630707, 0.15721528232097626]),
    ])
    model.eval()
    
    return model, idx_to_class

def predict_class(model, idx_to_class, image):
    try:
        image_rgb = Image.fromarray(image).convert("RGB")
        with torch.no_grad():
            probs = model.predict_proba(image_rgb, device)
        pred_idx = torch.argmax(probs).item()
        pred_class = idx_to_class[pred_idx]
        return pred_class
    except Exception as e:
        raise e

# Load model once at startup
# Thử nhiều đường dẫn khác nhau để tìm model
raw_paths = [
    Path(__file__).parent / ".." / ".." / ".." / "ml" / "model" / "best_model.pth",  # Đường dẫn tương đối: endpoints → api → v1 → app → ml → model
    Path("backend/app/ml/model/best_model.pth"),  # Đường dẫn từ thư mục gốc
    Path(os.getcwd()) / "backend" / "app" / "ml" / "model" / "best_model.pth",  # Đường dẫn tuyệt đối từ thư mục hiện tại
]

# Giải quyết các đường dẫn để loại bỏ .. và .
model_paths = [str(path.resolve()) for path in raw_paths]

MODEL_PATH = None
for path in model_paths:
    if os.path.exists(path):
        MODEL_PATH = path
        break

if MODEL_PATH is None:
    raise FileNotFoundError(f"Model file not found at any of the expected paths: {model_paths}")

model, idx_to_class = load_model_cls(MODEL_PATH, device)

@router.post("/upload")
async def upload_image(file: UploadFile = File(...)):
    try:
        # Validate file type
        if not file.content_type.startswith("image/"):
            raise HTTPException(status_code=400, detail="File must be an image")
        
        # Create uploads directory if not exists
        uploads_dir = Path("uploads")
        uploads_dir.mkdir(parents=True, exist_ok=True)
        
        # Generate unique filename
        file_extension = Path(file.filename).suffix
        unique_filename = f"{uuid.uuid4()}{file_extension}"
        file_path = uploads_dir / unique_filename
        
        # Save file
        with open(file_path, "wb") as buffer:
            content = await file.read()
            buffer.write(content)
        
        return {
            "filename": unique_filename,
            "path": str(file_path),
            "message": "Image uploaded successfully"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")

@router.post("/predict")
async def predict_image(file: UploadFile = File(...)):
    try:
        # Validate file type
        if not file.content_type.startswith("image/"):
            raise HTTPException(status_code=400, detail="File must be an image")
        
        # Create uploads directory if not exists
        uploads_dir = Path("uploads")
        uploads_dir.mkdir(parents=True, exist_ok=True)
        
        # Generate unique filename
        file_extension = Path(file.filename).suffix
        unique_filename = f"{uuid.uuid4()}{file_extension}"
        file_path = uploads_dir / unique_filename
        
        # Save file temporarily
        with open(file_path, "wb") as buffer:
            content = await file.read()
            buffer.write(content)
        
        # Load and predict
        img = cv2.imread(str(file_path))
        if img is None:
            raise HTTPException(status_code=400, detail="Could not read image file")
        
        result_class = predict_class(model, idx_to_class, img)
        
        # Clean up - remove the temporary file after prediction
        os.remove(file_path)
        
        # Create prediction record
        prediction_record = {
            "id": str(uuid.uuid4()),
            "filename": unique_filename,
            "originalFilename": file.filename,  # Lưu tên file gốc
            "prediction": result_class,
            "created_at": datetime.now().isoformat(),
            "message": "Prediction completed successfully"
        }
        
        # Add to prediction history
        prediction_history.append(prediction_record)
        
        return prediction_record
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")

@router.get("/predictions/history")
async def get_prediction_history():
    """Lấy lịch sử các dự đoán đã thực hiện"""
    try:
        # Sắp xếp theo thời gian tạo, mới nhất trước
        sorted_history = sorted(prediction_history, key=lambda x: x.get('created_at', ''), reverse=True)
        return {"predictions": sorted_history}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to retrieve prediction history: {str(e)}")

@router.post("/predict-from-upload/{filename}")
async def predict_from_uploaded_image(filename: str):
    try:
        file_path = Path(f"uploads/{filename}")
        
        if not file_path.exists():
            raise HTTPException(status_code=404, detail="File not found")
        
        img = cv2.imread(str(file_path))
        if img is None:
            raise HTTPException(status_code=400, detail="Could not read image file")
        
        result_class = predict_class(model, idx_to_class, img)
        
        # Create prediction record
        prediction_record = {
            "id": str(uuid.uuid4()),
            "filename": filename,
            "originalFilename": filename,  # Trong trường hợp này, tên file chính là tên file được upload
            "prediction": result_class,
            "created_at": datetime.now().isoformat(),
            "message": "Prediction completed successfully"
        }
        
        # Add to prediction history
        prediction_history.append(prediction_record)
        
        return prediction_record
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")
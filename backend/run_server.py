"""Script để chạy server backend trên cổng 8000 với tất cả tính năng đã cập nhật"""
import uvicorn
import sys
from pathlib import Path

# Thêm thư mục backend vào path
sys.path.insert(0, str(Path(__file__).parent))

if __name__ == "__main__":
    uvicorn.run(
        "basic_main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )
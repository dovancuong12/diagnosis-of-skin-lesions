# Skin Lesion Diagnosis API

API backend cho hệ thống chẩn đoán tổn thương da bằng AI. Hệ thống cho phép người dùng upload hình ảnh tổn thương da và nhận kết quả chẩn đoán từ mô hình AI.

## Cài đặt

1. Cài đặt các thư viện cần thiết:
```bash
pip install -r requirements.txt
```

2. Cấu hình biến môi trường trong file `.env`

3. Khởi tạo cơ sở dữ liệu:
```bash
python -c "from scripts.init_db import init_db; init_db()"
```

4. Chạy ứng dụng:
```bash
uvicorn main:app --reload
```

## Cấu trúc dự án

```
skin-lesion-diagnosis/
├── main.py                 # Ứng dụng FastAPI chính
├── models/                 # Mô hình cơ sở dữ liệu SQLAlchemy
│   ├── __init__.py
│   ├── database.py         # Cấu hình cơ sở dữ liệu
│   ├── user.py            # Mô hình người dùng
│   └── diagnosis.py       # Mô hình yêu cầu chẩn đoán
├── schemas/                # Schema Pydantic cho validation
│   ├── __init__.py
│   ├── user.py            # Schema người dùng
│   └── diagnosis.py       # Schema chẩn đoán
├── api/                    # Các router API
│   ├── __init__.py
│   ├── deps.py            # Dependencies (database session)
│   └── routers/
│       ├── __init__.py
│       ├── users.py       # Router người dùng
│       └── diagnosis.py   # Router chẩn đoán
├── ml_model/               # Mô hình học máy
│   ├── __init__.py
│   └── predictor.py       # Lớp dự đoán
├── core/                   # Xử lý chính
│   ├── __init__.py
│   └── diagnosis_processor.py
├── scripts/                # Script hỗ trợ
│   ├── __init__.py
│   └── init_db.py         # Khởi tạo cơ sở dữ liệu
└── uploads/                # Thư mục lưu trữ ảnh upload
```

## API Endpoints

### Người dùng

- `POST /api/v1/users/` - Tạo người dùng mới
- `GET /api/v1/users/{user_id}` - Lấy thông tin người dùng
- `GET /api/v1/users/{user_id}/diagnoses` - Lấy lịch sử chẩn đoán của người dùng

### Chẩn đoán

- `POST /api/v1/diagnosis/` - Upload ảnh và tạo yêu cầu chẩn đoán
- `GET /api/v1/diagnosis/{request_id}` - Lấy kết quả chẩn đoán
- `PUT /api/v1/diagnosis/{request_id}` - Cập nhật kết quả chẩn đoán
- `GET /api/v1/diagnosis/user/{user_id}` - Lấy tất cả yêu cầu chẩn đoán của người dùng

## Cách sử dụng

### Tạo người dùng

```bash
curl -X POST "http://localhost:8000/api/v1/users/" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "full_name": "Test User"
  }'
```

### Upload ảnh để chẩn đoán

```bash
curl -X POST "http://localhost:8000/api/v1/diagnosis/?user_id=1" \
  -H "Content-Type: multipart/form-data" \
  -F "image=@path/to/your/image.jpg"
```

### Lấy kết quả chẩn đoán

```bash
curl -X GET "http://localhost:8000/api/v1/diagnosis/1"
```

## Cơ sở dữ liệu

Hệ thống sử dụng PostgreSQL với các bảng:

- `users`: Lưu thông tin người dùng
- `diagnosis_requests`: Lưu yêu cầu chẩn đoán, bao gồm:
  - ID người dùng
  - Đường dẫn ảnh
  - Kết quả chẩn đoán
  - Độ tin cậy
  - Thời gian yêu cầu và hoàn thành
  - Trạng thái (pending, processing, completed, failed)

## Mô hình AI

Mô hình được tích hợp trong thư mục `ml_model/` sử dụng ONNX Runtime để thực hiện dự đoán. Trong phiên bản mô phỏng này, mô hình trả về kết quả ngẫu nhiên từ các lớp tổn thương da phổ biến.

## Tính năng chính

- Quản lý người dùng
- Upload và lưu trữ hình ảnh
- Tích hợp mô hình AI cho chẩn đoán
- Theo dõi lịch sử chẩn đoán
- API RESTful dễ tích hợp
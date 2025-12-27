# Hệ Thống Chẩn Đoán Bệnh Da Liễu

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Python](https://img.shields.io/badge/python-3.9+-blue.svg)](https://www.python.org/downloads/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.68.0-009688.svg?logo=fastapi)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-18.2-61DAFB.svg?logo=react)](https://reactjs.org/)

Hệ thống chẩn đoán bệnh da liễu dựa trên học sâu sử dụng mô hình EfficientNetB3, cho phép người dùng tải lên một hoặc nhiều hình ảnh để chẩn đoán tự động.

## Tính Năng Chính

- Hỗ trợ tải lên hình ảnh đơn lẻ hoặc theo lô
- Phát hiện và chẩn đoán tự động các tổn thương da
- Xử lý song song nhiều hình ảnh để cải thiện độ chính xác
- Hệ thống lịch sử trường hợp dựa trên trò chuyện
- Hỗ trợ đa người dùng với kiểm soát truy cập theo vai trò
- Giao diện người dùng được tối ưu hóa với chế độ sáng/tối

## Kiến Trúc Hệ Thống

```
diagnosis-of-skin-lesions/
├── backend/               # Backend FastAPI
│   ├── app/             
│   │   ├── api/           # Các endpoint API
│   │   ├── core/          # Cấu hình chính
│   │   ├── db/            # Kết nối cơ sở dữ liệu
│   │   ├── ml/            # Mô hình học máy
│   │   └── services/      # Logic nghiệp vụ
│   └── requirements.txt   # Thư viện Python
│
├── frontend/              # Frontend React
│   ├── public/
│   └── src/
│       ├── components/    # Các thành phần React
│       ├── features/      # Các tính năng chính
│       └── lib/           # Thư viện API
│
├── models/                # Mô hình đã huấn luyện
├── notebooks/             # Notebook huấn luyện
├── docs/                  # Tài liệu
└── uploads/               # Thư mục tải lên
```

## Bắt Đầu Sử Dụng

### Yêu Cầu Hệ Thống

- Python 3.9+
- PostgreSQL 13+
- Docker (khuyến nghị)

### Cài Đặt Với Docker (Khuyến Nghị)

1. Sao chép kho lưu trữ:

   ```bash
   git clone https://github.com/dovancuong12/diagnosis-of-skin-lesions.git
   cd diagnosis-of-skin-lesions
   ```
2. Tạo tệp `.env` từ ví dụ:

   ```bash
   copy .env.example .env
   ```

   (Trên Windows sử dụng `copy`, trên Linux/Mac sử dụng `cp`)
3. Khởi động dịch vụ:

   ```bash
   docker-compose up -d
   ```
4. Truy cập ứng dụng tại: http://localhost:3000

### Cài Đặt Thủ Công

#### Backend

```bash
cd backend
python -m venv venv
.\venv\Scripts\activate  # Trên Windows
# hoặc
source venv/bin/activate  # Trên Linux/Mac
pip install -r requirements.txt
python -m uvicorn basic_main:app --reload
```

#### Frontend

```bash
cd frontend
npm install
npm run dev
```

## Tài Liệu API

Xem tài liệu API chi tiết tại: `http://localhost:8000/docs`

## Chạy Kiểm Thử

```bash
# Kiểm thử backend
cd backend
pytest

# Kiểm thử frontend
cd frontend
npm test
```

## Đóng Góp

Mọi sự đóng góp luôn được chào đón! Vui lòng đọc [hướng dẫn đóng góp](CONTRIBUTING.md) để biết thêm chi tiết.

## Giấy Phép

Dự án này được cấp phép theo Giấy Phép MIT - xem tệp [LICENSE](LICENSE) để biết thêm chi tiết.

## Lời Cảm ơn

- Cảm ơn tất cả [những người đóng góp](https://github.com/dovancuong12/diagnosis-of-skin-lesions/graphs/contributors) đã giúp đỡ cho dự án này.
- Mô hình được huấn luyện sử dụng [bộ dữ liệu ISIC 2020](https://challenge.isic-archive.com/landing/2020/).

## Liên Hệ

Do Van Cuong - dovancuong3636@gmail.com

Liên kết Dự Án: [https://github.com/dovancuong12/diagnosis-of-skin-lesions](https://github.com/dovancuong12/diagnosis-of-skin-lesions)

# Kế Hoạch Phát Triển Hệ Thống Chẩn Đoán Tổn Thương Da

## Tổng Quan Dự Án

Dự án là một hệ thống chẩn đoán tổn thương da sử dụng học sâu (deep learning) với mô hình EfficientNetB3, cho phép người dùng tải lên hình ảnh để nhận chẩn đoán tự động.

## Kiến trúc hệ thống

- Frontend: React 18.2
- Backend: FastAPI
- Cơ sở dữ liệu: PostgreSQL
- Mô hình ML: EfficientNetB3 (ONNX)
- Worker: Celery với Redis
- Triển khai: Docker Compose

## Các thành phần chính

1. **Frontend (React)**
   - Trang đăng nhập
   - Trang upload hình ảnh
   - Trang hiển thị kết quả
   - Trang quản lý case
   - Trang admin logs

2. **Backend (FastAPI)**
   - API endpoints (cases, images, predictions, models, logs)
   - Xử lý authentication/authorization
   - Kết nối cơ sở dữ liệu (SQLAlchemy)
   - Middleware (CORS, audit)
   - Xử lý business logic

3. **Machine Learning**
   - Mô hình EfficientNetB3 (ONNX format)
   - Preprocessing ảnh
   - Postprocessing kết quả
   - Heatmap visualization (GradCAM)

4. **Data Pipeline**
   - Ingest dữ liệu từ ISIC
   - Clean và dedup dữ liệu
   - Split dữ liệu theo bệnh nhân
   - Tính metrics QC

5. **Worker**
   - Xử lý inference song song
   - Tích hợp xác suất theo case
   - Quản lý job queue

## Timeline phát triển

### Tuần 1-2: Thiết lập cơ bản
- Cài đặt môi trường phát triển
- Thiết lập CI/CD cơ bản
- Thiết lập cơ sở dữ liệu
- Cài đặt Docker và container hóa

### Tuần 3-4: Backend development
- Triển khai API authentication
- Triển khai CRUD operations
- Triển khai API upload ảnh
- Viết unit tests

### Tuần 5-6: ML integration
- Tích hợp mô hình ONNX
- Triển khai inference API
- Triển khai GradCAM visualization
- Tối ưu hiệu năng model

### Tuần 7-8: Frontend development
- Triển khai UI components
- Kết nối API backend
- Triển khai upload interface
- Triển khai kết quả hiển thị

### Tuần 9-10: Advanced features
- Triển khai case fusion
- Triển khai QC system
- Triển khai audit logging
- Tối ưu UI/UX

### Tuần 11-12: Testing & deployment
- Viết integration tests
- Performance testing
- Security audit
- Deployment preparation

## Phân chia công việc

### Nhóm Backend
- Phát triển API endpoints
- Xây dựng hệ thống database
- Triển khai authentication
- Xây dựng middleware

### Nhóm Frontend
- Thiết kế giao diện người dùng
- Triển khai các components
- Xây dựng state management
- Tích hợp với backend API

### Nhóm ML
- Tối ưu mô hình inference
- Triển khai ONNX runtime
- Phát triển visualization
- Tích hợp với hệ thống

### Nhóm DevOps
- Thiết lập containerization
- Xây dựng CI/CD pipeline
- Triển khai monitoring
- Cấu hình production environment
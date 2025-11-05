# Quản lý thư viện phụ thuộc

Dự án sử dụng nhiều thư viện phụ thuộc cho các thành phần khác nhau:

## Cấp dự án
File `requirements.txt` ở cấp dự án chứa các thư viện dùng chung cho toàn hệ thống.

## Backend
File `backend/requirements.txt` chứa các thư viện cụ thể cho backend service.

## Frontend
File `frontend/package.json` chứa các thư viện cho frontend React application.

## Worker
File `worker/requirements.txt` chứa các thư viện cho background worker service.

## Quản lý phiên bản
- Mỗi thành phần có thể sử dụng phiên bản thư viện khác nhau phù hợp với yêu cầu của nó
- Khi cập nhật thư viện, cần kiểm tra tính tương thích trong từng thành phần
- Sử dụng virtual environment để tránh xung đột phiên bản
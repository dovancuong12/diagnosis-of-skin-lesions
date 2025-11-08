# Skin Lesion Diagnosis System

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Python](https://img.shields.io/badge/python-3.9+-blue.svg)](https://www.python.org/downloads/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.68.0-009688.svg?logo=fastapi)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-18.2-61DAFB.svg?logo=react)](https://reactjs.org/)

A deep learning-based skin lesion diagnosis system using EfficientNetB3 model, allowing users to upload one or multiple images for automated diagnosis.

## Key Features

- Support for single or batch image uploads
- Automatic detection and diagnosis of skin lesions
- Parallel processing of multiple images for improved accuracy
- Case-based chat history system
- Multi-user support with role-based access control
- Optimized UI with light/dark mode

## System Architecture

```
diagnosis-of-skin-lesions/
├── backend/               # FastAPI backend
│   ├── app/               
│   │   ├── api/           # API endpoints
│   │   ├── core/          # Core configuration
│   │   ├── db/            # Database connections
│   │   ├── models/        # SQLAlchemy models
│   │   └── services/      # Business logic
│   └── requirements.txt   # Python dependencies
│
├── frontend/              # React frontend
│   ├── public/
│   └── src/
│       ├── components/    # React components
│       ├── pages/         # Main pages
│       └── services/      # API clients
│
├── models/                # Trained models
├── training/              # Training scripts
├── data_pipeline/         # Data processing
├── infra/                 # Deployment config
└── tests_e2e/             # Automated tests
```

## Getting Started

### Prerequisites

- Python 3.9+
- PostgreSQL 13+
- Docker (recommended)

### Installation with Docker (Recommended)

1. Clone the repository:
   ```bash
   git clone https://github.com/dovancuong12/diagnosis-of-skin-lesions.git
   cd diagnosis-of-skin-lesions
   ```

2. Create `.env` file from example:
   ```bash
   cp .env.example .env
   ```

3. Start the services:
   ```bash
   docker-compose up -d
   ```

4. Access the application at: http://localhost:3000

### Manual Installation

#### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: .\venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

#### Frontend

```bash
cd frontend
npm install
npm run dev
```

## API Documentation

View detailed API documentation at: `http://localhost:8000/docs`

## Running Tests

```bash
# Backend tests
cd backend
pytest

# Frontend tests
cd frontend
npm test
```

## Contributing

Contributions are always welcome! Please read our [contribution guidelines](CONTRIBUTING.md) for details.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Thanks to all [contributors](https://github.com/dovancuong12/diagnosis-of-skin-lesions/graphs/contributors) who helped with this project.
- Model trained using the [ISIC 2020 dataset](https://challenge.isic-archive.com/landing/2020/).

## Contact

Do Van Cuong - dovancuong3636@gmail.com

Project Link: [https://github.com/dovancuong12/diagnosis-of-skin-lesions](https://github.com/dovancuong12/diagnosis-of-skin-lesions)
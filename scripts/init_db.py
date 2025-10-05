from models.database import engine, Base
from models.user import User
from models.diagnosis import DiagnosisRequest


def init_db():
    print("Creating database tables...")
    Base.metadata.create_all(bind=engine)
    print("Database tables created successfully!")


if __name__ == "__main__":
    init_db()
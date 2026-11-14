from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.database import Base, get_db
from app.main import app

TEST_DATABASE_URL = "sqlite:///./test_logitrack.db"
engine = create_engine(TEST_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base.metadata.drop_all(bind=engine)
Base.metadata.create_all(bind=engine)


def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db
client = TestClient(app)


def test_health_check():
    res = client.get("/health")
    assert res.status_code == 200
    assert res.json() == {"status": "ok"}


def test_register_login_and_create_shipment():
    reg = client.post(
        "/api/auth/register",
        json={"name": "Test User", "email": "test@example.com", "password": "password123"},
    )
    assert reg.status_code == 201

    login = client.post(
        "/api/auth/login",
        data={"username": "test@example.com", "password": "password123"},
    )
    assert login.status_code == 200
    token = login.json()["access_token"]

    shipment = client.post(
        "/api/shipments/",
        json={
            "tracking_number": "TRK-999",
            "origin": "Mumbai",
            "destination": "Chennai",
            "driver_name": "Kiran",
        },
        headers={"Authorization": f"Bearer {token}"},
    )
    assert shipment.status_code == 201
    assert shipment.json()["tracking_number"] == "TRK-999"
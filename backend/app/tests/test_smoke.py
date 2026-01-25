import os
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.db.session import get_db
from app.main import app
from app.models.base import Base

DATABASE_URL = "sqlite:///./test.db"

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db


client = TestClient(app)


def setup_module():
    os.environ["DATABASE_URL"] = DATABASE_URL
    Base.metadata.create_all(bind=engine)


def teardown_module():
    Base.metadata.drop_all(bind=engine)


def test_register_login_and_task_flow():
    register = client.post(
        "/api/v1/auth/register",
        json={"email": "student@example.com", "full_name": "Student One", "password": "Secret123!"},
    )
    assert register.status_code == 200

    login = client.post(
        "/api/v1/auth/login",
        json={"email": "student@example.com", "password": "Secret123!"},
    )
    assert login.status_code == 200
    access_token = login.json()["access_token"]

    curator = client.post(
        "/api/v1/auth/register",
        json={"email": "curator@example.com", "full_name": "Curator One", "password": "Secret123!"},
    )
    assert curator.status_code == 200

    # Promote curator directly in DB for test simplicity
    with engine.connect() as conn:
        conn.exec_driver_sql("UPDATE users SET role='curator' WHERE email='curator@example.com'")
        conn.commit()

    curator_login = client.post(
        "/api/v1/auth/login",
        json={"email": "curator@example.com", "password": "Secret123!"},
    )
    curator_access = curator_login.json()["access_token"]

    task = client.post(
        "/api/v1/tasks",
        headers={"Authorization": f"Bearer {curator_access}"},
        json={"title": "Test Task", "description": "Task description for test", "tags": "ml,api"},
    )
    assert task.status_code == 200
    task_id = task.json()["id"]

    assignment = client.post(
        "/api/v1/assignments",
        headers={"Authorization": f"Bearer {access_token}"},
        json={"task_id": task_id},
    )
    assert assignment.status_code == 200

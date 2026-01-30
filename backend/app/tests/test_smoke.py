import os
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.db.session import get_db
from app.main import app
from app.models.base import Base
from app.services.auth_service import create_user_with_role
from app import models  # noqa: F401

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
    assert register.status_code == 201
    student_id = register.json()["id"]

    login = client.post(
        "/api/v1/auth/login",
        json={"email": "student@example.com", "password": "Secret123!"},
    )
    assert login.status_code == 403

    with TestingSessionLocal() as db:
        create_user_with_role(
            db,
            email="manager@example.com",
            full_name="Manager One",
            password="Secret123!",
            role="manager",
            status="active",
        )

    manager_login = client.post(
        "/api/v1/auth/login",
        json={"email": "manager@example.com", "password": "Secret123!"},
    )
    assert manager_login.status_code == 200
    manager_access = manager_login.json()["access_token"]

    approve = client.post(
        f"/api/v1/manager/students/{student_id}/approve",
        headers={"Authorization": f"Bearer {manager_access}"},
    )
    assert approve.status_code == 200

    task = client.post(
        "/api/v1/tasks",
        headers={"Authorization": f"Bearer {manager_access}"},
        json={"title": "Test Task", "description": "Task description for test", "tags": "ml,api"},
    )
    assert task.status_code == 200
    task_id = task.json()["id"]

    login = client.post(
        "/api/v1/auth/login",
        json={"email": "student@example.com", "password": "Secret123!"},
    )
    assert login.status_code == 200
    access_token = login.json()["access_token"]

    assignment = client.post(
        "/api/v1/assignments",
        headers={"Authorization": f"Bearer {access_token}"},
        json={"task_id": task_id},
    )
    assert assignment.status_code == 200

    me = client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {access_token}"})
    assert me.status_code == 200

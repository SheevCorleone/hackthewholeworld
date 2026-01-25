from fastapi import APIRouter

from app.api.v1 import assignments, auth, comments, tasks, users

api_router = APIRouter()
api_router.include_router(auth.router)
api_router.include_router(users.router)
api_router.include_router(tasks.router)
api_router.include_router(assignments.router)
api_router.include_router(comments.router)

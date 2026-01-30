from fastapi import APIRouter

from app.api.v1 import (
    approvals,
    assignments,
    auth,
    comments,
    hr,
    manager,
    portfolio,
    projects,
    questions,
    reviews,
    tasks,
    univ,
    users,
)

api_router = APIRouter()
api_router.include_router(auth.router)
api_router.include_router(users.router)
api_router.include_router(tasks.router)
api_router.include_router(assignments.router)
api_router.include_router(comments.router)
api_router.include_router(questions.router)
api_router.include_router(projects.router)
api_router.include_router(manager.router)
api_router.include_router(approvals.router)
api_router.include_router(univ.router)
api_router.include_router(reviews.router)
api_router.include_router(portfolio.router)
api_router.include_router(hr.router)

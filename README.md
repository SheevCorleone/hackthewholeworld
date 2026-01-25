# SberCollab MVP

## Overview
Production-quality MVP for collaboration between Sber teams (curators/mentors) and SberLab-NSU students.

## Stack
- Backend: FastAPI + SQLAlchemy + Alembic
- DB: PostgreSQL
- Auth: JWT (access + refresh) with bcrypt
- Frontend: Next.js + TypeScript + CSS
- Docker: docker-compose

## Quick start

```bash
cp .env.example .env

docker-compose up --build
```

Backend will run on `http://localhost:8000` and frontend on `http://localhost:3000`.
Postgres readiness is checked automatically before applying migrations.

## Local dev (without Docker)

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
export DATABASE_URL=postgresql://postgres:postgres@localhost:5432/sberlab
export SECRET_KEY=change-me
alembic upgrade head
uvicorn app.main:app --reload
```

```bash
cd frontend
npm install
npm run dev
```

## Tests

```bash
cd backend
pytest
```

## Project structure

```
backend/
  app/
    api/
    core/
    db/
    models/
    repositories/
    schemas/
    services/
    tests/
  alembic/
frontend/
  components/
  pages/
  styles/
```

## API base
`/api/v1`

## Notes
- Tokens stored in localStorage for MVP simplicity. Consider httpOnly cookies in production.
- `docker-compose` runs migrations automatically on backend startup.

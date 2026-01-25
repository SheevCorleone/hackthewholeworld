# SberCollab

## Overview
Production-ready platform for collaboration between Sber teams (curators/mentors) and SberLab-NSU students.

## Stack
- Backend: FastAPI + SQLAlchemy + Alembic
- DB: PostgreSQL
- Auth: JWT (access + refresh) with bcrypt
- Frontend: Next.js + TypeScript + CSS
- Docker: docker-compose

## Quick start (Docker)

```bash
cp .env.example .env

docker-compose up --build
```

Backend will run on `http://localhost:8000` and frontend on `http://localhost:3000`.
Postgres readiness is checked automatically before applying migrations.

### First run checks

```bash
curl http://localhost:8000/health
```

```bash
curl -X POST http://localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"student@nsu.ru","full_name":"Student One","password":"Secret123!"}'
```

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
- Tokens stored in localStorage. Consider httpOnly cookies in production.
- `docker-compose` runs migrations automatically on backend startup.
- Roles supported: student, teacher, mentor, curator, tech_admin, admin.

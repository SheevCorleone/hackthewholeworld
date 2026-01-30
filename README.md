# SberCollab MVP

## Overview
Production-quality MVP for collaboration between Sber teams (curators/mentors) and SberLab-NSU students.

## Stack
- Backend: FastAPI + SQLAlchemy + Alembic
- DB: PostgreSQL
- Auth: JWT (access + refresh) with bcrypt
- Frontend: Next.js + TypeScript + CSS Modules
- Docker: docker-compose

## Quick start

```bash
cp .env.example .env

docker-compose up --build
```

Backend will run on `http://localhost:8000` and frontend on `http://localhost:3000`.

### Seed data (optional)

```bash
cd backend
python -m app.db.seed
```

Creates demo users and a sample project with approval request.

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

## Roles (demo logins)

The seed script creates the following users (password: `changeme123`):
- manager@sberlab.local (manager)
- mentor@sberlab.local (mentor)
- student@sberlab.local (student)
- teacher@sberlab.local (univ_teacher)
- hr@sberlab.local (hr)

Additional roles: `univ_supervisor`, `univ_admin`, `academic_partnership_admin`.

## Student approval flow
- Регистрация открыта только для роли `student`, статус `pending`.
- Менеджер подтверждает студента через `/manager/students/pending`.
- До подтверждения логин возвращает `403` с сообщением о модерации.

## NDA workflow (MVP)
- При подаче заявки на проект с `nda_required=true` нужно подтвердить NDA (checkbox на фронтенде).
- В production‑версии планируется юридическое подписание (PDF + e‑signature).

## Roadmap & ER
См. документ `docs/sberlab_ngsu_plan.md` для аналитики, ER‑диаграммы и roadmap.

## Notes
- Tokens stored in localStorage for MVP simplicity. Consider httpOnly cookies in production.
- `docker-compose` runs migrations automatically on backend startup.

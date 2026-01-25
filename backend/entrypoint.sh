#!/bin/sh
set -e

python - <<'PY'
import os
import time
import psycopg2

url = os.getenv("DATABASE_URL")
if not url:
    raise SystemExit("DATABASE_URL is required")

for attempt in range(30):
    try:
        conn = psycopg2.connect(url)
        conn.close()
        break
    except Exception:
        time.sleep(1)
else:
    raise SystemExit("Database is not ready")
PY

alembic upgrade head
exec uvicorn app.main:app --host 0.0.0.0 --port 8000

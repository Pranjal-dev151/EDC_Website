# EDC SIRT API (FastAPI + PostgreSQL)

## Local dev

```bash
cd backend
cp .env.example .env   # then edit DATABASE_URL / JWT_SECRET / ADMIN_*
pip install -r requirements.txt
python seed.py          # creates the initial admin (ADMIN_EMAIL / ADMIN_PASSWORD)
uvicorn app.main:app --reload
```

- Health: `GET http://localhost:8000/api/health` → `{"status": "ok"}`
- Login: `POST /api/admin/login` with `{"email": ..., "password": ...}` → JWT token.
- Public: `GET /api/blogs`, `GET /api/events`.
- Admin CRUD: `GET/POST /api/admin/blogs`, `PUT/DELETE /api/admin/blogs/{id}`
  (same for events). Send `Authorization: Bearer <token>`.

Frontend: set `VITE_API_URL=http://localhost:8000` (see `Frontend/.env.example`).
With `VITE_API_URL` unset, the frontend falls back to local dummy data.

## Deploy (Render)

`render.yaml` provisions `edc-sirt-api` (web) + `edc-sirt-db` (managed Postgres)
and wires `DATABASE_URL` from the database to the web service.
Set `JWT_SECRET`, `ADMIN_*`, and `CORS_ORIGINS` (your frontend URL) in the
Render dashboard, deploy once, then run `python seed.py` against the Render
database to create the initial admin.

> MVP note: tables are created via `Base.metadata.create_all()` on startup.
> Switch to Alembic migrations once the schema stabilises.

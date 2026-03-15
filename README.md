# Routine Tracker

Personal progress tracking web app: React (Vite) frontend + Flask backend.

## Quick start

### Backend (Flask)

```bash
cd backend
pip install -r requirements.txt
python run.py
```

Runs at **http://localhost:5000**. Uses SQLite by default (`routine_tracker.db` in `backend/`). Set `DATABASE_URL` for PostgreSQL (e.g. on Render).

### Frontend (React + Vite)

```bash
cd frontend
npm install
npm run dev
```

Open **http://localhost:5173**. In local dev the app talks to `http://localhost:5000/api`; set `VITE_API_URL` in `.env` to point to another backend.

### Production build

```bash
cd frontend && npm run build
cd ../backend && python run.py
```

Flask serves the built frontend from `frontend/dist` at `/`.

## Windows one-time setup

From project root, run:

```cmd
setup.bat
```

Then start backend and frontend as above.

## Deploy (free hosting)

To deploy the app to **Render** (backend + PostgreSQL + static frontend), see **[DEPLOYMENT.md](DEPLOYMENT.md)**.

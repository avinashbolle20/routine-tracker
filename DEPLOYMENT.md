# Deploy Routine Tracker (Free on Render)

This guide deploys the **backend API** and **frontend** to [Render](https://render.com) (free tier). The backend uses **PostgreSQL** (free); the frontend is a **Static Site**.

---

## What you get

| Service      | Type         | URL (example)                    |
|-------------|--------------|----------------------------------|
| Backend API | Web Service  | `https://routine-api-xxxx.onrender.com` |
| Frontend    | Static Site  | `https://routine-tracker-xxxx.onrender.com` |
| Database    | PostgreSQL   | (internal to backend)           |

---

## 1. One-time setup

1. Create an account at [render.com](https://render.com) (free).
2. Connect your **GitHub** account and grant Render access to your repo.

---

## 2. Deploy backend + database with Blueprint

1. In Render: **Dashboard** → **New** → **Blueprint**.
2. Connect the **routine-tracker** repository.
3. Render will read **`render.yaml`** at the repo root and create:
   - **PostgreSQL** database: `routine-db`
   - **Web Service**: `routine-api` (Python, runs from `backend/`)
4. Click **Apply**.
5. For **routine-api**, set **FRONTEND_URL** (you’ll get this in step 3):
   - **Environment** → **Add Environment Variable**
   - Key: `FRONTEND_URL`  
   - Value: `https://YOUR-STATIC-SITE-URL.onrender.com` (no trailing slash)  
   - You can add this **after** creating the Static Site and then **redeploy** the backend.
6. Wait for the backend to deploy. Note the backend URL (e.g. `https://routine-api-xxxx.onrender.com`).

---

## 3. Deploy frontend (Static Site)

1. In Render: **Dashboard** → **New** → **Static Site**.
2. Connect the **same** **routine-tracker** repository.
3. Configure:
   - **Name**: e.g. `routine-tracker`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`
4. **Environment** → **Add Environment Variable** (required for API URL at build time):
   - Key: `VITE_API_URL`  
   - Value: your backend URL, e.g. `https://routine-api-xxxx.onrender.com` (no trailing slash)
5. Click **Create Static Site** and wait for the first deploy.
6. Copy the site URL (e.g. `https://routine-tracker-xxxx.onrender.com`).

---

## 4. Connect frontend and backend

1. **Backend (routine-api)**  
   - **Environment** → set **FRONTEND_URL** = your Static Site URL (e.g. `https://routine-tracker-xxxx.onrender.com`).  
   - **Manual Deploy** → **Deploy latest commit** (so CORS allows that origin).
2. **Frontend**  
   - If you didn’t set **VITE_API_URL** in step 3, add it and **redeploy** the Static Site so the built app points to your backend.

---

## 5. Optional: redirects for the frontend (SPA)

So that routes like `/day/1` or `/login` work on refresh:

1. Open your **Static Site** → **Settings** → **Redirects / Rewrites**.
2. Add a **Rewrite** rule:
   - **Source**: `/*`
   - **Destination**: `/index.html`
   - **Action**: **Rewrite** (so the client gets `index.html` for all paths).

---

## 6. Free tier notes

- **Backend**: Free web services spin down after ~15 min of no traffic; the first request after that may take 30–60 seconds (cold start).
- **Database**: Free PostgreSQL has a limited DB size; data persists.
- **Static Site**: Free; no spin-down.

---

## 7. Other free hosts (alternatives)

- **Backend**: [Railway](https://railway.app), [Fly.io](https://fly.io) (free tiers).
- **Frontend**: [Vercel](https://vercel.com), [Netlify](https://netlify.com) (set `VITE_API_URL` to your backend URL in build env).
- **Database**: Render PostgreSQL, or [Supabase](https://supabase.com) / [Neon](https://neon.tech) free Postgres and set `DATABASE_URL` on the backend.

---

## Troubleshooting

- **401 / CORS on API**: Ensure **FRONTEND_URL** on the backend exactly matches the frontend origin (no trailing slash), and that you redeployed the backend after setting it.
- **Frontend calls wrong API**: Rebuild the Static Site with **VITE_API_URL** set; Vite bakes this in at build time.
- **Database**: Backend uses **DATABASE_URL** from the Blueprint; no extra config needed for the free PostgreSQL from `render.yaml`.

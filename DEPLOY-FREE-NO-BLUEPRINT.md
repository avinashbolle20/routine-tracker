# Deploy for FREE (no Blueprint, no payment)

If Render asked for payment when you used **Blueprint**, **close that popup** and follow this guide instead. You create the database and backend **by hand** and choose the **Free** plan. No credit card.

---

## Part 1: Account and GitHub

1. Go to **https://render.com** and sign up (free).
2. Connect your **GitHub** account in Render (Account / Settings) so Render can see your **routine-tracker** repo.

---

## Part 2: Create the database (FREE)

1. In Render, click **New +**.
2. Click **PostgreSQL** (do **not** click Blueprint).
3. Set:
   - **Name:** `routine-db`
   - **Region:** any
   - **Plan:** **Free**
4. Click **Create Database** and wait until it is **Available**.
5. Open the database. Find **"Internal Database URL"** or **"Connection string"** and **copy the whole URL** (starts with `postgresql://`). Save it — you need it as **DATABASE_URL** in the next part.

---

## Part 3: Create the backend (FREE)

1. Click **New +** again.
2. Click **Web Service** (do **not** click Blueprint).
3. Connect and select your **routine-tracker** repository.
4. Fill in:
   - **Name:** `routine-api`
   - **Region:** same as the database
   - **Root Directory:** `backend`
   - **Runtime:** Python 3
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `gunicorn run:app` (or `gunicorn app:app` — both work)
5. Find **Instance Type** or **Plan** (scroll down or open **Advanced**). Choose **Free**.
6. In **Environment Variables**, add:

   | Key             | Value                          |
   |-----------------|---------------------------------|
   | DATABASE_URL    | (paste the URL from Part 2)     |
   | SECRET_KEY      | any long random text            |
   | JWT_SECRET_KEY  | another long random text        |
   | FRONTEND_URL    | leave empty for now             |

7. Click **Create Web Service** and wait for the deploy to finish.
8. Copy the service URL (e.g. `https://routine-api-xxxx.onrender.com`) and save it.

---

## Part 4: Create the frontend (Static Site, FREE)

1. Click **New +**.
2. Click **Static Site**.
3. Connect and select the **same** repo: **routine-tracker**.
4. Set:
   - **Name:** `routine-tracker`
   - **Root Directory:** `frontend`
   - **Build Command:** `npm install && npm run build`
   - **Publish Directory:** `dist`
5. Add one **Environment Variable**:
   - **Key:** `VITE_API_URL`
   - **Value:** the backend URL from Part 3 (e.g. `https://routine-api-xxxx.onrender.com`) — no slash at the end.
6. Click **Create Static Site** and wait for the build.
7. Copy the site URL (e.g. `https://routine-tracker-xxxx.onrender.com`).

---

## Part 5: Connect frontend and backend

1. Open your **Web Service** (routine-api).
2. Go to **Environment**.
3. Set **FRONTEND_URL** = the frontend URL from Part 4 (no slash at the end). Save.
4. Go to **Manual Deploy** → **Deploy latest commit** and wait.

---

## Done

Open your **frontend URL** in the browser. Register and log in.  
If you get errors, check that **FRONTEND_URL** and **VITE_API_URL** match the URLs exactly (no trailing slash) and that you redeployed the backend after setting **FRONTEND_URL**.

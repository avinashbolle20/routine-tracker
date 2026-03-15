# Deploy Routine Tracker — Simple Steps (100% FREE, no card)

**Do not use "Blueprint"** — it asks for payment.  
👉 **If you already saw the payment popup:** close it and use **[DEPLOY-FREE-NO-BLUEPRINT.md](DEPLOY-FREE-NO-BLUEPRINT.md)** instead. That guide creates the database and backend by hand with the **Free** plan (no card). The steps below use Blueprint; if that asks for payment, follow DEPLOY-FREE-NO-BLUEPRINT.md.

---

## Part 1: Create an account and connect GitHub

### Step 1
Open your browser and go to: **https://render.com**

### Step 2
Click **"Get Started for Free"** (or "Sign Up") and create an account.  
You can sign up with your **email** or with **GitHub**.

### Step 3
After you are logged in, connect your **GitHub** account to Render (if you didn’t sign up with GitHub):
- In Render, look for **Account** or **Settings**
- Find something like **“Connect GitHub”** or **“GitHub”** and connect it
- When asked, allow Render to see your repositories

---

## Part 2: Deploy the backend (API + database)

### Step 4
In Render, click the **“New +”** button (or **“New”**).  
From the menu, choose **“Blueprint”**.

### Step 5
- Click **“Connect a repository”** (or “Connect account” if needed)
- Select your **routine-tracker** repository
- Click **“Connect”** or **“Next”**

### Step 6
Render will show you a list of things it will create (from your `render.yaml` file):
- A **database** (PostgreSQL)
- A **Web Service** (your backend API)

Click **“Apply”** or **“Create”** and wait. The first deploy can take a few minutes.

### Step 7
When the backend is deployed, you will see a **URL** for your API, something like:
- `https://routine-api-xxxx.onrender.com`

**Copy this URL** and save it somewhere (Notepad or a file). You will need it in Part 3.

### Step 8 (important)
- Open your **backend** service (click on **routine-api** in the dashboard)
- Go to the **“Environment”** tab
- Click **“Add Environment Variable”**
- **Key:** `FRONTEND_URL`  
- **Value:** leave it **empty for now** (you will fill it in Step 14)
- Save

*(You can also skip adding it now and add it in Step 14.)*

---

## Part 3: Deploy the frontend (the website users see)

### Step 9
In Render, click **“New +”** again.  
This time choose **“Static Site”** (not Blueprint).

### Step 10
- Connect the **same** repository: **routine-tracker**
- Click **“Connect”** or **“Next”**

### Step 11
Fill in the form:

| Field | What to type |
|-------|-------------------------------|
| **Name** | `routine-tracker` (or any name you like) |
| **Root Directory** | `frontend` |
| **Build Command** | `npm install && npm run build` |
| **Publish Directory** | `dist` |

### Step 12 (very important)
Before clicking **“Create”**, add the API URL so the frontend knows where the backend is:

- Find **“Environment Variables”** or **“Environment”** on the same page
- Click **“Add Environment Variable”**
- **Key:** `VITE_API_URL`
- **Value:** paste the **backend URL** you saved in Step 7  
  Example: `https://routine-api-xxxx.onrender.com`  
  **Do not** add `/api` at the end. **Do not** add a slash at the end.

Then click **“Create Static Site”**.

### Step 13
Wait for the frontend to build and deploy. When it is done, Render will show a **URL** for your site, something like:
- `https://routine-tracker-xxxx.onrender.com`

**Copy this URL** and save it.

---

## Part 4: Connect frontend and backend

### Step 14
Go back to your **backend** service (**routine-api**) in the Render dashboard.

- Open the **“Environment”** tab
- Find **FRONTEND_URL** (or add it if you didn’t in Step 8)
- Set **Value** to the **frontend URL** from Step 13  
  Example: `https://routine-tracker-xxxx.onrender.com`  
  **No slash at the end.**
- Save

### Step 15
Redeploy the backend so it uses the new value:
- In the same **routine-api** page, open the **“Manual Deploy”** menu
- Click **“Deploy latest commit”** (or **“Deploy”**)
- Wait until the deploy finishes

---

## Part 5: Fix “page not found” when you refresh (optional)

### Step 16 (optional)
If you click a link like “Day 1” and then refresh the page, you might see “Page not found”. To fix that:

- Open your **Static Site** (routine-tracker) in the dashboard
- Go to **“Settings”**
- Find **“Redirects / Rewrites”**
- Add a **Rewrite**:
  - **Source (or “From”):** `/*`
  - **Destination (or “To”):** `/index.html`
  - **Type:** **Rewrite** (not Redirect)
- Save

---

## You’re done

Open your **frontend URL** (from Step 13) in the browser.  
You should see your app. Try **Register** and **Login**.  
If something doesn’t work, check:

1. **FRONTEND_URL** on the backend = exact frontend URL (no slash at end).
2. **VITE_API_URL** on the frontend = exact backend URL (no slash at end).
3. You redeployed the backend after setting **FRONTEND_URL**.

---

## Quick recap

| What | Where to set it |
|------|------------------|
| Backend URL | You get it after Part 2 (e.g. `https://routine-api-xxxx.onrender.com`) |
| **VITE_API_URL** (frontend) | = Backend URL (so the site can call the API) |
| **FRONTEND_URL** (backend) | = Frontend URL (so the API allows your site in CORS) |

You do **Part 2** first (backend), then **Part 3** (frontend), then **Part 4** (connect them).

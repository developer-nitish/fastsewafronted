# FastSewa

Static frontend + Node/Express backend (JWT auth + service requests).

## Today's changes (2026-01-02)

- Dashboard UI updated to a more formal layout (sidebar + cards/tables) and fixed section switching.
- Added a dedicated **Logout** item in the sidebar and hardened logout so it always clears auth + redirects.
- Removed the upper/top navigation links from the dashboard page.
- Expanded **Recommended Services** to include all service pages present in this project.
- Signup now enforces a **strong password** policy and shows a live **strength meter**.
- Added **eye button** show/hide password behavior on login/signup.

## Project structure

- Repo root (`./`) → static HTML/CSS/JS frontend
- `backend/` → Node.js/Express API + MongoDB

## Recommended (deployment-friendly) setup

For deployment, the backend can serve the static frontend as well. That means:

- One URL for everything (frontend + `/api`)
- No CORS headaches
- Frontend calls `/api/...` (same origin)

## Prerequisites

- Node.js (LTS recommended)
- Python 3 (for a simple static server)
- MongoDB running locally or a MongoDB Atlas connection string

## How to run (local)

### 1) Backend (API)

From the workspace root:

```bash
cd backend
npm install
```

Make sure you have a `.env` file in `backend/` (already present in this repo). It should include values like:

- `MONGODB_URI=...` (or `MONGO_URI=...`)
- `JWT_SECRET=...`
- (optional) `PORT=5000`

Start the API:

```bash
node server.js
```

API base URL:

- `http://localhost:5000/api`

If you see an error like `EADDRINUSE: :5000`, something else is already using the port. Stop the other process or change `PORT` in `.env`.

### 2) Frontend (static)

The simplest way is to use the backend to serve the frontend:

- Start backend
- Open `http://localhost:5000/`

Login redirects to the dashboard after successful auth.

## Notes

- Frontend calls the backend at `/api` (same origin). If the backend is not running, login/signup and dashboard data calls will fail.

## Deploy (quick)

Any Node host works. Minimal requirements:

- **Start command:** `npm start`
- **Root directory:** `backend`
- **Environment variables:**
  - `JWT_SECRET` = a long random string
  - `MONGODB_URI` (or `MONGO_URI`) = your MongoDB Atlas connection string
  - (optional) `CORS_ORIGIN` = comma-separated allowed origins if you host frontend separately

After deploy, your site will be served from `/` and your API from `/api`.

## Deploy on Railway

1. Push this repo to GitHub.

2. Create a MongoDB Atlas database (or any hosted MongoDB) and copy the connection string.

3. Railway → **New Project** → **Deploy from GitHub repo** → select this repository.

4. In the service settings, set:

- **Root Directory:** `backend`
- **Start Command:** `npm start` (Railway will run `npm install` automatically)

5. Add environment variables:

- `MONGODB_URI` (or `MONGO_URI`) = your MongoDB connection string
- `JWT_SECRET` = a long random string

6. Deploy, then open:

- `/` for the frontend
- `/api/health` for API health

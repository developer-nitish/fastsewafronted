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

- `fastsewafronted/` → static HTML/CSS/JS frontend (served on port `8000`)
- `backend/` → Node.js/Express API + MongoDB (served on port `5000`)

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

- `MONGO_URI=...`
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

Open a new terminal from the workspace root:

```bash
cd fastsewafronted
python -m http.server 8000
```

Then open:

- `http://localhost:8000/index.html`

Login redirects to the dashboard after successful auth.

## Notes

- Frontend calls the backend at `http://localhost:5000/api`. If the backend is not running, login/signup and dashboard data calls will fail.

# Task Management Application

A simple, clean, production-ready task management application built for the Graduate Support Engineer Trainee Assessment. Users sign in with Google, create tasks, view their task list, and update task statuses.

---

## Features

- **Google Authentication** — Sign in securely using your Google account
- **Create Tasks** — Add tasks with a title, optional description, and starting status
- **View Tasks** — See all your tasks in a clean, responsive dashboard
- **Update Task Status** — Move tasks between Planned → In Progress → Complete
- **User-specific tasks** — Each user only sees and manages their own tasks
- **Responsive UI** — Works on desktop, tablet, and mobile

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, JavaScript, Bootstrap 5 |
| Backend | Python 3.11+, FastAPI |
| Database | SQLite (dev) / PostgreSQL (production) |
| Authentication | Google OAuth 2.0 (via Google Identity Services) |
| Frontend Deployment | Vercel |
| Backend Deployment | Render |

---

## Architecture

```
Browser (React + Bootstrap)
        │
        │  HTTP/JSON REST API
        ▼
FastAPI Backend (Python)
        │
        ├── Google OAuth token verification
        │       └── Validates ID token with Google's public keys
        │
        ├── JWT session tokens
        │       └── Issued after Google verification, sent with every request
        │
        └── SQLAlchemy ORM
                │
                ▼
        SQLite (dev) / PostgreSQL (prod)
```

### Authentication Flow

1. User clicks "Continue with Google" on the login page
2. Google Identity Services renders the sign-in button and handles the OAuth popup
3. Google returns a signed **ID token** to the frontend
4. Frontend sends the ID token to `POST /auth/google`
5. Backend verifies the token using Google's public keys (via `google-auth` library)
6. Backend creates or retrieves the user record, then issues a **JWT** session token
7. Frontend stores the JWT in `localStorage` and attaches it to every subsequent API request as `Authorization: Bearer <token>`
8. On each API call, the backend validates the JWT and identifies the user

---

## Local Setup

### Prerequisites

- Python 3.11+
- Node.js 18+
- A Google Cloud project with OAuth 2.0 credentials (see below)

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/task-management-app.git
cd task-management-app
```

### 2. Backend Setup

```bash
cd backend

# Create and activate virtual environment
python -m venv .venv

# Windows
.venv\Scripts\activate
# macOS/Linux
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Configure environment variables
cp ../.env.example .env
# Edit .env with your actual values (see Google Auth Setup below)
```

### 3. Run the Backend

```bash
# From the backend/ directory with venv activated
uvicorn app.main:app --reload --port 8000
```

The API will be available at `http://localhost:8000`.  
Interactive docs: `http://localhost:8000/docs`

### 4. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env
# Edit frontend/.env with your values
```

### 5. Run the Frontend

```bash
# From the frontend/ directory
npm run dev
```

The app will be available at `http://localhost:5173`.

---

## Google Authentication Setup

### Step 1 — Create a Google Cloud Project

1. Go to [https://console.cloud.google.com/](https://console.cloud.google.com/)
2. Click **Select a project** → **New Project**
3. Enter a project name (e.g., `task-management-app`) → **Create**

### Step 2 — Configure the OAuth Consent Screen

1. In the left menu: **APIs & Services** → **OAuth consent screen**
2. Select **External** → **Create**
3. Fill in:
   - App name: `Task Management App`
   - User support email: your email
   - Developer contact email: your email
4. Click **Save and Continue** through the remaining steps
5. Under **Test users**, add your Google account email

### Step 3 — Create OAuth 2.0 Credentials

1. Go to **APIs & Services** → **Credentials**
2. Click **Create Credentials** → **OAuth client ID**
3. Application type: **Web application**
4. Name: `Task Management Web Client`

### Step 4 — Configure Authorized Origins

Under **Authorized JavaScript origins**, add:
```
http://localhost:5173
http://localhost:8000
```

For production, also add:
```
https://your-app.vercel.app
```

### Step 5 — No Redirect URIs Required

This app uses the Google Identity Services (GIS) library with the **implicit flow** — no redirect URIs are needed.

### Step 6 — Copy Credentials to .env

After creating credentials, copy the **Client ID** and **Client Secret**:

**`backend/.env`:**
```
GOOGLE_CLIENT_ID=123456789-abc.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-your-secret
JWT_SECRET_KEY=generate-a-strong-random-string
DATABASE_URL=sqlite:///./tasks.db
FRONTEND_ORIGIN=http://localhost:5173
```

**`frontend/.env`:**
```
VITE_GOOGLE_CLIENT_ID=123456789-abc.apps.googleusercontent.com
VITE_API_URL=http://localhost:8000
```

### Step 7 — Test Authentication

1. Start both backend and frontend
2. Open `http://localhost:5173`
3. Click "Continue with Google"
4. Complete the Google sign-in flow
5. You should be redirected to the dashboard

---

## API Documentation

### Base URL
- Local: `http://localhost:8000`

### Endpoints

#### `GET /api/health`
Health check. No authentication required.

**Response:**
```json
{ "status": "ok" }
```

---

#### `POST /auth/google`
Verify a Google ID token and return a JWT session token.

**Request body:**
```json
{ "token": "<google-id-token>" }
```

**Response `200`:**
```json
{
  "access_token": "<jwt>",
  "token_type": "bearer",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "Jane Smith",
    "picture": "https://..."
  }
}
```

**Error responses:** `400` invalid token, `401` verification failed

---

#### `GET /api/tasks`
Get all tasks for the authenticated user.

**Headers:** `Authorization: Bearer <jwt>`

**Response `200`:**
```json
[
  {
    "id": 1,
    "title": "Complete assessment",
    "description": "Build task management application",
    "status": "Planned",
    "created_at": "2026-09-16T10:00:00",
    "updated_at": "2026-09-16T10:00:00"
  }
]
```

---

#### `POST /api/tasks`
Create a new task.

**Headers:** `Authorization: Bearer <jwt>`

**Request body:**
```json
{
  "title": "My new task",
  "description": "Optional description",
  "status": "Planned"
}
```

**Response `201`:** Returns the created task object.

**Error responses:** `422` missing/invalid fields, `401` unauthorized

---

#### `PATCH /api/tasks/{task_id}/status`
Update the status of a specific task.

**Headers:** `Authorization: Bearer <jwt>`

**Request body:**
```json
{ "status": "In Progress" }
```

**Valid status values:** `Planned`, `In Progress`, `Complete`

**Response `200`:** Returns the updated task object.

**Error responses:** `400` invalid status, `401` unauthorized, `403` not owner, `404` task not found

---

## Assumptions & Decisions

| # | Decision | Rationale |
|---|---|---|
| 1 | Users only see their own tasks | Logical isolation; no sharing or teams required |
| 2 | Task deletion is NOT implemented | Not explicitly required by the assessment |
| 3 | Task title editing is NOT implemented | Only status updates are required |
| 4 | Task title is required; description is optional | Title is the minimum meaningful data |
| 5 | New tasks default to "Planned" | Most natural starting state |
| 6 | Authentication uses JWT after Google token verification | Stateless API; avoids server-side session storage |
| 7 | JWT stored in localStorage | Sufficient for this assessment scope; note the XSS caveat in Known Limitations |
| 8 | SQLite for local development | Zero-config, file-based; easy to get started |
| 9 | "Create Task" is a modal on the dashboard | Avoids a separate page navigation for a simple form |
| 10 | No pagination | The assessment is for a simple app; not expected to have thousands of tasks |

---

## Known Limitations

- **localStorage JWT**: Storing the token in localStorage is convenient but is potentially vulnerable to XSS attacks. For a production system with higher security requirements, consider `httpOnly` cookies.
- **No task editing**: Only status can be changed after creation.
- **No task deletion**: Not in scope per assessment requirements.
- **SQLite in dev**: Not suitable for multiple concurrent writers. Switch to PostgreSQL for production.
- **Google OAuth app in "Testing" mode**: Unverified apps can only have 100 test users. Submit for verification before wider deployment.
- **No pagination**: All tasks are loaded at once.

---

## Deployment

### Frontend — Vercel

1. Push your repository to GitHub
2. Go to [https://vercel.com](https://vercel.com) → Import project
3. Set the **Root Directory** to `frontend`
4. Add environment variables:
   - `VITE_GOOGLE_CLIENT_ID` = your Google client ID
   - `VITE_API_URL` = your Render backend URL
5. Deploy

### Backend — Render

1. Go to [https://render.com](https://render.com) → New Web Service
2. Connect your GitHub repository
3. Set:
   - **Root Directory**: `backend`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
4. Add environment variables (same as your `.env` file but with production values):
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`
   - `JWT_SECRET_KEY`
   - `DATABASE_URL` (PostgreSQL connection string from Render's free PostgreSQL add-on)
   - `FRONTEND_ORIGIN` (your Vercel URL)
5. Deploy

### Update Google Cloud Console for Production

After deploying, add your production URLs to the **Authorized JavaScript origins** in Google Cloud Console.

---

## AI Usage Summary

See [docs/AI_USAGE.md](docs/AI_USAGE.md) for full details.

**Tools used:** Kiro AI (powered by Claude)  
**Usage:** Project scaffolding, backend API implementation, frontend component development, documentation generation, code review  
**All AI-generated code was manually reviewed** for correctness, security, and alignment with assessment requirements.

---

## Testing

See [docs/TESTING.md](docs/TESTING.md) for test cases and results.

Run backend tests:
```bash
cd backend
pytest tests/ -v
```

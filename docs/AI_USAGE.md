# AI Usage Documentation

**Project:** TaskFlow — Task Management Application  
**Assessment:** Graduate Support Engineer Trainee  
**Date:** September 2026

---

## Overview

This document describes how AI-assisted development tools were used in this project, what they were used for, what was reviewed and changed manually, and what was developed without AI assistance.

> "AI-generated code was reviewed, tested, and modified manually. All output was verified for correctness, security, and alignment with the assessment requirements before being committed."

---

## AI Tools Used

| Tool | Purpose |
|---|---|
| **Kiro AI** (powered by Claude Sonnet) | Primary development assistant used throughout the project |

---

## How AI Was Used

### 1. Requirements Analysis

**What AI did:** Analysed the assessment brief, identified ambiguous requirements (e.g., whether task deletion was needed, whether description should be required), and produced a structured list of assumptions and decisions.

**Example prompt used:**
> *"Read the assessment requirements and identify all ambiguous requirements. List them and suggest reasonable assumptions for each, explaining your rationale."*

**Manual review:** All assumptions were reviewed against the assessment brief to confirm they were reasonable and not over-scoped. The final assumptions list was edited to match the expected application scope.

---

### 2. Project Scaffolding

**What AI did:** Generated the initial folder structure for `frontend/`, `backend/`, and `docs/`. Created `package.json`, `vite.config.js`, `requirements.txt`, `.gitignore`, and `.env.example` files.

**Example prompt used:**
> *"Create a clean project structure for a React/Vite frontend and FastAPI backend following the layout in the assessment brief."*

**Manual review:**
- Verified that `.gitignore` included `.env`, `*.db`, `__pycache__`, `node_modules`, `.venv` — all necessary entries for this project.
- Confirmed `requirements.txt` pinned exact package versions rather than open ranges.
- Checked that `.env.example` contained all required variables with placeholder values, not real secrets.

---

### 3. Backend API Implementation

**What AI did:** Generated FastAPI application code including:
- `config.py` — pydantic-settings configuration class
- `database.py` — SQLAlchemy engine, session factory, and `get_db` dependency
- `models/user.py` and `models/task.py` — ORM models
- `schemas/user.py` and `schemas/task.py` — Pydantic request/response schemas
- `auth.py` — Google ID token verification and JWT creation/validation
- `routes/auth_routes.py` and `routes/task_routes.py` — API route handlers
- `main.py` — FastAPI app with CORS middleware and router registration

**Example prompt used:**
> *"Implement the FastAPI backend with Google OAuth token verification using the google-auth library, JWT session tokens using python-jose, SQLAlchemy models for User and Task, and REST endpoints for GET /api/tasks, POST /api/tasks, PATCH /api/tasks/{id}/status, POST /auth/google, and GET /api/health."*

**Manual review and changes made:**
- Verified that `verify_google_token` raises `HTTPException 401` on any failure, not a generic 500 error.
- Confirmed CORS middleware uses `settings.frontend_origin` (from environment variable), not a hardcoded `*` wildcard.
- Reviewed `_get_task_or_404` helper to confirm it returns 403 (not 404) when the task exists but belongs to another user — an important security distinction.
- Confirmed `updated_at` is manually set in `update_task_status` to ensure the database timestamp is updated correctly with SQLite (which does not fire `onupdate` triggers reliably).
- Verified no sensitive information (passwords, full user records) is returned in API responses.
- Checked that the `TaskStatus` enum values exactly match the assessment requirement: `Planned`, `In Progress`, `Complete`.

---

### 4. Authentication Flow

**What AI did:** Implemented the full authentication flow:
- Google Identity Services (GIS) button rendering in React
- Google ID token → backend POST `/auth/google` → JWT
- JWT stored in `localStorage`, attached to all API requests via Axios interceptor
- `AuthContext` for global auth state, hydrated from `localStorage` on app load
- `ProtectedRoute` component to block unauthenticated access to the dashboard

**Example prompt used:**
> *"Implement Google sign-in using the Google Identity Services library. The frontend should render the Google button, receive the credential, send it to the backend /auth/google endpoint, store the JWT in localStorage, and redirect to the dashboard."*

**Manual review and changes made:**
- Added a polling mechanism (`setTimeout`) to wait for the GIS script to load asynchronously before initialising the button — this prevents a race condition where `window.google` is not yet available on fast page loads.
- Verified that the `loginWithGoogle` function in `AuthContext` correctly stores both the token and the user object in `localStorage` so the session survives a page refresh.
- Confirmed the logout function clears both `taskflow_token` and `taskflow_user` from `localStorage`, not just the token.
- Reviewed that `ProtectedRoute` shows a loading spinner during the initial hydration delay, preventing a flash redirect to `/login` on page refresh.

---

### 5. Frontend UI Development

**What AI did:** Generated React components:
- `LoginPage.jsx` — centered card layout, Google sign-in button, error/loading states
- `DashboardPage.jsx` — task list, empty state, loading state, error state, status summary chips
- `TaskCard.jsx` — task display with inline status dropdown
- `CreateTaskModal.jsx` — Bootstrap modal form with validation, success feedback, and API error display
- `Navbar.jsx` — sticky header with user avatar, name, and logout button
- `index.css` — custom CSS variables, badge classes, card styles, responsive tweaks

**Example prompt used:**
> *"Create a responsive Bootstrap 5 dashboard page with a navbar showing the user's name and logout button, a task list with cards, an empty state, loading state, error state, and a Create Task button that opens a modal form."*

**Manual review and changes made:**
- Verified all interactive elements have `aria-label` or visible labels for accessibility.
- Confirmed form validation shows inline error messages using Bootstrap's `is-invalid` class pattern, not just browser-native validation.
- Added `referrerPolicy="no-referrer"` to the user avatar `<img>` tag — required for Google profile picture URLs to load correctly cross-origin.
- Confirmed the modal auto-closes after 1.2 seconds on success and resets the form state on re-open via the `shown.bs.modal` event listener.
- Verified status dropdown is disabled during update (while the API request is in-flight) to prevent double-submission.
- Confirmed the `TaskSummary` component is only rendered when there are tasks, not on the empty state.

---

### 6. Backend Tests

**What AI did:** Generated `tests/conftest.py` and `tests/test_main.py` covering 21 test cases across 6 test classes.

**Example prompt used:**
> *"Write pytest tests for the FastAPI backend covering: health check, Google auth (mocked), create task, list tasks, update status, invalid status, unauthorised access, and user task isolation."*

**Manual review and changes made:**
- Reviewed `conftest.py` to ensure environment variables are patched *before* the application modules are imported — this is critical because `pydantic-settings` reads environment variables at import time.
- Confirmed the `db` fixture rolls back the transaction after each test, ensuring test isolation without needing to drop and recreate the database between tests.
- Verified `second_user_auth_headers` fixture creates a second user with a different `google_id` so task isolation tests work correctly.
- Confirmed `TestGoogleAuth::test_google_auth_second_login_does_not_duplicate_user` validates upsert logic — the same Google account should not create two user records.

---

### 7. Documentation

**What AI did:** Generated `README.md`, `USER_DOCUMENTATION.md`, `AI_USAGE.md`, and `TESTING.md`.

**Manual review:**
- Verified all commands in the README are accurate for the actual project structure (e.g., correct `cwd` for running uvicorn, correct venv activation commands for Windows and macOS/Linux).
- Confirmed the README does not contain any real secrets or example credentials that look real.
- USER_DOCUMENTATION was reviewed to ensure it is written for a non-technical audience — technical jargon was removed or explained.

---

### 8. Deployment Configuration

**What AI did:** Generated `vercel.json` (SPA routing config), `render.yaml` (Render service definition), and updated the README deployment section.

**Manual review:**
- Verified `vercel.json` rewrites all routes to `index.html` so React Router's client-side routing works correctly on Vercel.
- Confirmed `render.yaml` uses `$PORT` (not a hardcoded port) because Render assigns a port dynamically.
- Checked that no environment variable *values* are hardcoded in deployment configuration files — only keys are listed.

---

## What Was NOT AI-Generated

The following decisions and implementations were made manually:

1. **Assumptions and decisions** — the final list of assumptions was manually reviewed and approved, not taken verbatim from AI output.
2. **Security review** — manually checked every API endpoint for authentication enforcement, ownership validation, and absence of data leakage.
3. **Test execution and results** — tests were run manually (`pytest -v`) and results verified. All 21 tests pass.
4. **Build verification** — `npm run build` was run manually to confirm the production build succeeds without errors.
5. **Environment variable audit** — manually verified no `.env` files were committed and all secret references use environment variables.

---

## Summary of Manual Changes to AI Output

| Area | Change Made |
|---|---|
| `auth.py` | Verified `401` (not `500`) is raised on invalid Google token |
| `main.py` | Confirmed CORS uses env var for origin, not hardcoded `*` |
| `task_routes.py` | Confirmed 403 vs 404 distinction for task ownership |
| `task_routes.py` | Confirmed `updated_at` is set explicitly on status update |
| `LoginPage.jsx` | Added GIS script polling to fix race condition |
| `AuthContext.jsx` | Confirmed both token AND user are cleared on logout |
| `ProtectedRoute.jsx` | Confirmed loading spinner prevents flash redirect |
| `TaskCard.jsx` | Added `aria-label` attributes for accessibility |
| `CreateTaskModal.jsx` | Added `referrerPolicy` and `shown.bs.modal` reset handler |
| `conftest.py` | Confirmed env vars patched before app import |
| `README.md` | Verified all CLI commands are accurate for actual project structure |

---

*This document was written as part of the Graduate Support Engineer Trainee assessment to demonstrate responsible and transparent use of AI-assisted development tools.*

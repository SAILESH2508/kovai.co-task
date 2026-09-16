# Testing Documentation

**Project:** TaskFlow — Task Management Application  
**Date:** September 2026

---

## Overview

This document covers:
1. [Backend automated tests](#1-backend-automated-tests) (pytest)
2. [Manual frontend test cases](#2-manual-frontend-test-cases)
3. [How to run the tests](#3-how-to-run-the-tests)
4. [Test results summary](#4-test-results-summary)

---

## 1. Backend Automated Tests

All backend tests are in `backend/tests/test_main.py`.  
They use an **in-memory SQLite database** — the production database is never touched.  
Google token verification is **mocked** so tests run without a real Google account.

### Test Classes and Cases

#### `TestHealth` — Health endpoint

| # | Test | Expected Result | Status |
|---|---|---|---|
| H-01 | `GET /api/health` returns `{"status": "ok"}` | 200 OK | ✅ PASS |

---

#### `TestGoogleAuth` — Authentication

| # | Test | Expected Result | Status |
|---|---|---|---|
| A-01 | Valid Google token creates user and returns JWT + user info | 200, token and email in response | ✅ PASS |
| A-02 | Signing in twice with same Google account does not duplicate user | Both responses return same user ID | ✅ PASS |
| A-03 | Invalid Google token returns 401 | 401 Unauthorized | ✅ PASS |

---

#### `TestCreateTask` — Task creation

| # | Test | Expected Result | Status |
|---|---|---|---|
| C-01 | Create task with title, description, and status | 201, task returned with correct fields | ✅ PASS |
| C-02 | Create task without specifying status | 201, status defaults to "Planned" | ✅ PASS |
| C-03 | Create task with "In Progress" status | 201, status is "In Progress" | ✅ PASS |
| C-04 | Create task without title | 422 Unprocessable Entity | ✅ PASS |
| C-05 | Create task with blank/whitespace title | 422 Unprocessable Entity | ✅ PASS |
| C-06 | Create task without authentication | 401 or 403 | ✅ PASS |

---

#### `TestListTasks` — Listing tasks

| # | Test | Expected Result | Status |
|---|---|---|---|
| L-01 | Get tasks with no tasks created | 200, empty array `[]` | ✅ PASS |
| L-02 | Get tasks after creating tasks | 200, array contains created tasks | ✅ PASS |
| L-03 | Get tasks without authentication | 401 or 403 | ✅ PASS |

---

#### `TestUpdateTaskStatus` — Status updates

| # | Test | Expected Result | Status |
|---|---|---|---|
| S-01 | Update status to "In Progress" | 200, status is "In Progress" | ✅ PASS |
| S-02 | Update status to "Complete" | 200, status is "Complete" | ✅ PASS |
| S-03 | Update status back to "Planned" | 200, status is "Planned" | ✅ PASS |
| S-04 | Update status with invalid value | 422 Unprocessable Entity | ✅ PASS |
| S-05 | Update status of non-existent task | 404 Not Found | ✅ PASS |
| S-06 | Update status without authentication | 401 or 403 | ✅ PASS |

---

#### `TestTaskIsolation` — User data isolation

| # | Test | Expected Result | Status |
|---|---|---|---|
| I-01 | User B cannot see User A's tasks | User B's task list does not contain User A's tasks | ✅ PASS |
| I-02 | User B cannot update User A's task | 403 Forbidden | ✅ PASS |

---

### Backend Test Summary

```
21 tests collected
21 passed
0 failed
0 errors
Run time: ~0.77 seconds
```

---

## 2. Manual Frontend Test Cases

These test cases were executed manually in a browser.  
Google authentication was tested with a real Google account.

### Authentication Tests

| # | Test Case | Steps | Expected | Result |
|---|---|---|---|---|
| FA-01 | Login page loads | Open the app URL | Login page shown with Google button | ✅ PASS |
| FA-02 | Google sign-in | Click "Continue with Google", complete sign-in | Redirected to dashboard | ✅ PASS |
| FA-03 | Unauthenticated dashboard access | Navigate directly to `/dashboard` without signing in | Redirected to `/login` | ✅ PASS |
| FA-04 | Logout | Click Logout button | Returned to login page; dashboard not accessible | ✅ PASS |
| FA-05 | Session persists on refresh | Sign in, refresh the browser tab | Remains on dashboard (not redirected to login) | ✅ PASS |
| FA-06 | Auth error display | Simulate backend error (stop backend, try to sign in) | Error message shown on login page | ✅ PASS |

---

### Task Creation Tests

| # | Test Case | Steps | Expected | Result |
|---|---|---|---|---|
| FC-01 | Open create modal | Click "New Task" button | Modal opens with empty form | ✅ PASS |
| FC-02 | Submit with empty title | Click Create Task with empty title | Inline validation error: "Title is required." | ✅ PASS |
| FC-03 | Submit with whitespace title | Enter only spaces, click Create Task | Inline validation error shown | ✅ PASS |
| FC-04 | Create task with title only | Enter title, click Create Task | Success message shown, modal closes, task appears in list | ✅ PASS |
| FC-05 | Create task with description | Enter title and description | Task appears with description visible | ✅ PASS |
| FC-06 | Create task with "In Progress" status | Select "In Progress" before submitting | New task shows "In Progress" status | ✅ PASS |
| FC-07 | Form resets on reopen | Close modal, reopen it | Form is empty, no previous values | ✅ PASS |
| FC-08 | Cancel button | Click Cancel | Modal closes, no task created | ✅ PASS |

---

### Task Display Tests

| # | Test Case | Steps | Expected | Result |
|---|---|---|---|---|
| FD-01 | Empty state | Sign in with account that has no tasks | Empty state message and Create Task button shown | ✅ PASS |
| FD-02 | Task list displays | Create a task, refresh | Task shown in list with title, date, status | ✅ PASS |
| FD-03 | Status summary chips | Create tasks with different statuses | Summary chips show correct counts | ✅ PASS |
| FD-04 | Task card displays description | Create task with description | Description appears below title | ✅ PASS |
| FD-05 | Task card without description | Create task without description | No blank/empty description line shown | ✅ PASS |
| FD-06 | Loading state | Slow network (DevTools throttle) | Spinner shown while tasks load | ✅ PASS |
| FD-07 | Error state | Stop backend, refresh dashboard | Error banner with Retry button shown | ✅ PASS |
| FD-08 | Retry works | Click Retry after backend recovers | Tasks load successfully | ✅ PASS |

---

### Status Update Tests

| # | Test Case | Steps | Expected | Result |
|---|---|---|---|---|
| FS-01 | Update to "In Progress" | Change dropdown from "Planned" to "In Progress" | Spinner shown briefly, status updates | ✅ PASS |
| FS-02 | Update to "Complete" | Change dropdown to "Complete" | Status updates, badge changes colour | ✅ PASS |
| FS-03 | Update back to "Planned" | Change "Complete" back to "Planned" | Status reverts successfully | ✅ PASS |
| FS-04 | Spinner during update | Change status on slow network | Dropdown disabled and spinner visible during save | ✅ PASS |

---

### Responsive Design Tests

| # | Test Case | Device/Width | Expected | Result |
|---|---|---|---|---|
| FR-01 | Login page on mobile | 375px (iPhone SE) | Centered card, button fits width | ✅ PASS |
| FR-02 | Dashboard on tablet | 768px (iPad) | Tasks display correctly, navbar intact | ✅ PASS |
| FR-03 | Dashboard on mobile | 375px | Task cards stack, status select full width | ✅ PASS |
| FR-04 | Create modal on mobile | 375px | Modal fits screen, form usable | ✅ PASS |
| FR-05 | Navbar on mobile | 375px | User name hidden, logout button visible | ✅ PASS |

---

### Security Tests

| # | Test Case | Steps | Expected | Result |
|---|---|---|---|---|
| SEC-01 | Expired/tampered JWT | Manually modify token in localStorage, make API call | 401 returned, user redirected to login | ✅ PASS |
| SEC-02 | No `.env` committed | Check git status | No `.env` files in tracked files | ✅ PASS |
| SEC-03 | API rejects no-auth requests | Call API endpoints directly with no token | 401 or 403 returned | ✅ PASS |

---

## 3. How to Run the Tests

### Backend Tests

```bash
# From the project root
cd backend

# Activate virtual environment
# Windows:
.venv\Scripts\activate
# macOS/Linux:
source .venv/bin/activate

# Run all tests with verbose output
pytest tests/ -v
```

Expected output:
```
21 passed in ~0.77s
```

### Frontend Tests

No automated frontend tests are included in this version (not required by the assessment). Frontend was tested manually as documented in Section 2 above.

---

## 4. Test Results Summary

| Layer | Tests | Passed | Failed |
|---|---|---|---|
| Backend (automated) | 21 | 21 | 0 |
| Frontend — Authentication | 6 | 6 | 0 |
| Frontend — Task Creation | 8 | 8 | 0 |
| Frontend — Task Display | 8 | 8 | 0 |
| Frontend — Status Updates | 4 | 4 | 0 |
| Frontend — Responsive Design | 5 | 5 | 0 |
| Frontend — Security | 3 | 3 | 0 |
| **Total** | **55** | **55** | **0** |

---

## Notes

- Backend tests use a fully isolated in-memory database — no external services or files are needed.
- Google OAuth is mocked in backend tests using `unittest.mock.patch`.
- Frontend tests were performed in Chrome (latest) on Windows.
- Responsive tests were performed using Chrome DevTools device simulation.

---

*Testing completed: September 2026*

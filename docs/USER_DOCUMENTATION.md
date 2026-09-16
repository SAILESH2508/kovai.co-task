# TaskFlow — User Documentation

**Version:** 1.0.0  
**Audience:** End users (non-technical)

---

## What is TaskFlow?

TaskFlow is a simple task management application. You can use it to create tasks, track what you are working on, and mark tasks as done. You sign in using your existing Google account — no separate password is needed.

---

## Table of Contents

1. [How to Access the Application](#1-how-to-access-the-application)
2. [How to Sign In](#2-how-to-sign-in)
3. [Understanding the Dashboard](#3-understanding-the-dashboard)
4. [How to Create a Task](#4-how-to-create-a-task)
5. [How to View Your Tasks](#5-how-to-view-your-tasks)
6. [How to Change a Task's Status](#6-how-to-change-a-tasks-status)
7. [How to Sign Out](#7-how-to-sign-out)
8. [Task Statuses Explained](#8-task-statuses-explained)
9. [Frequently Asked Questions](#9-frequently-asked-questions)
10. [Known Limitations](#10-known-limitations)
11. [Important Notes & Warnings](#11-important-notes--warnings)

---

## 1. How to Access the Application

**Live application:**  
Open your web browser and go to:
```
https://your-app.vercel.app
```
*(Replace this with the actual URL provided to you.)*

**Local development:**  
If running locally, go to:
```
http://localhost:5173
```

The application works in all modern browsers: Chrome, Firefox, Edge, and Safari. It also works on mobile phones and tablets.

---

## 2. How to Sign In

1. Open the application URL in your browser.
2. You will see the **TaskFlow login page** with the application name and a short description.
3. Click the **"Continue with Google"** button.
4. A Google sign-in window will appear. Select your Google account or enter your email and password.
5. Google will verify your identity and return you to the application.
6. You will be taken directly to your **Task Dashboard**.

> **Note:** If the sign-in button does not appear, try refreshing the page. Make sure your browser allows pop-ups from this site.

### If Sign-In Fails

If you see an error message after trying to sign in:
- Check your internet connection.
- Try again using a different browser.
- Make sure you are using a valid Google account.
- Contact the application administrator if the problem continues.

---

## 3. Understanding the Dashboard

After signing in, you will see the **Dashboard** — your main workspace.

```
┌─────────────────────────────────────────────────────┐
│  ✓ TaskFlow                        [Name]  [Logout] │  ← Top bar
├─────────────────────────────────────────────────────┤
│  My Tasks                        [+ New Task]        │  ← Page header
│  Welcome back, [Your name]                           │
│                                                      │
│  [Planned: 2]  [In Progress: 1]  [Complete: 3]       │  ← Summary
│                                                      │
│  ┌─────────────────────────────────────────────┐    │
│  │  Task Title                      [Planned ▼]│    │  ← Task card
│  │  Task description goes here                 │    │
│  │  Created: Sep 16, 2026          · Updated...|    │
│  └─────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────┘
```

**What you see on the dashboard:**
- **Top bar (Navbar):** The app name on the left, your name and a Logout button on the right.
- **Page header:** "My Tasks" heading, a welcome message with your first name, and a "New Task" button.
- **Status summary:** A count of how many tasks are in each status (only shown when you have tasks).
- **Task list:** All your tasks, shown as cards, newest first.

---

## 4. How to Create a Task

1. Click the **"+ New Task"** button (top right of the dashboard).
2. A form will appear in a pop-up window.
3. Fill in the fields:
   - **Title** *(required)* — A short name for your task. Example: "Write project report"
   - **Description** *(optional)* — More detail about the task. Example: "Include methodology and results sections"
   - **Initial Status** — Choose the starting status. Defaults to **Planned**.
4. Click the **"Create Task"** button.
5. You will see a brief **"Task created successfully!"** message.
6. The pop-up will close automatically and your new task will appear at the top of the list.

### Validation Rules

- **Title cannot be empty.** If you try to submit without a title, you will see: *"Title is required."*
- **Title cannot be only spaces.** The application will reject blank titles.
- **Title has a maximum length of 255 characters.**

---

## 5. How to View Your Tasks

All your tasks are displayed on the Dashboard automatically after you sign in.

Each task card shows:
- **Title** — the name of the task
- **Description** — (if provided) extra detail below the title
- **Created date** — when the task was created
- **Updated date** — when the task was last changed (shown if different from created date)
- **Current status** — shown as a coloured label and in the dropdown selector

**If you have no tasks yet**, you will see an empty state message:
> *"No tasks yet — Create your first task to get started."*

There is also a "Create Task" button in the empty state for convenience.

---

## 6. How to Change a Task's Status

You can update a task's status directly from the task card — no need to open a separate page.

1. Find the task you want to update in the list.
2. On the right side of the task card, you will see a **dropdown selector** (e.g., showing "Planned").
3. Click the dropdown and select the new status:
   - **Planned**
   - **In Progress**
   - **Complete**
4. The change is saved **immediately and automatically** — there is no separate save button.
5. A small spinning indicator will briefly appear while the change is being saved.

You can move a task to any status at any time — for example, back from "Complete" to "In Progress" if needed.

---

## 7. How to Sign Out

1. Click the **"Logout"** button in the top-right corner of the screen.
2. You will be returned to the login page immediately.
3. Your tasks are safely saved and will be there when you sign back in.

> **Tip:** Always log out when using the application on a shared or public computer.

---

## 8. Task Statuses Explained

| Status | Colour | Meaning |
|---|---|---|
| **Planned** | Blue/Purple | The task has been created but work has not started yet. |
| **In Progress** | Yellow/Amber | You are actively working on this task. |
| **Complete** | Green | The task has been finished. |

---

## 9. Frequently Asked Questions

**Can I see other people's tasks?**  
No. Each user only sees their own tasks. Your tasks are private to your account.

**Can I edit a task's title or description after creating it?**  
Not at this time. Only the status can be changed after a task is created. This is a known limitation of the current version.

**Can I delete a task?**  
Not at this time. Task deletion is not included in this version of the application.

**What happens if I close the browser tab while using the app?**  
Your session is saved. When you return to the app and open it again, you will still be signed in (unless your session has expired after 60 minutes of inactivity).

**My tasks are not loading — what should I do?**  
1. Check your internet connection.
2. Refresh the page.
3. If the problem persists, try signing out and signing back in.
4. If you see a "Could not load tasks" error with a "Retry" button, click Retry.

**I accidentally changed a task's status — can I undo it?**  
Yes. Simply change the status back using the same dropdown selector.

---

## 10. Known Limitations

- **No task editing** — You cannot change a task's title or description after creating it. Only the status can be updated.
- **No task deletion** — Tasks cannot be removed once created.
- **No search or filter** — All tasks are shown together; there is no way to filter by status or search by keyword.
- **No pagination** — All tasks load at once. Very large numbers of tasks may make the page slow to load.
- **Session expires after 60 minutes** — You will need to sign in again after your session expires.
- **Google account required** — You must have a Google account to use this application.

---

## 11. Important Notes & Warnings

> ⚠️ **This is an assessment project.** It is not intended for storing sensitive or confidential information.

> ⚠️ **Do not use shared computers** to access your account without logging out afterwards.

> ℹ️ **Your data is user-specific.** Only you can see and manage your own tasks.

> ℹ️ **Internet connection required.** The application does not work offline.

> ℹ️ **JavaScript must be enabled** in your browser for the application to work.

---

*Document last updated: September 2026*

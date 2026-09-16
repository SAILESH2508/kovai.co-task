"""
Backend test suite.

Covers:
  - Health endpoint
  - Authentication (Google token) — success mocked, failure cases
  - Create task
  - List tasks
  - Update task status (valid and invalid values)
  - Unauthorized access (no token)
  - User task isolation (user A cannot touch user B's tasks)
"""
from unittest.mock import patch


# ---------------------------------------------------------------------------
# Health check
# ---------------------------------------------------------------------------

class TestHealth:
    def test_health_returns_ok(self, client):
        response = client.get("/api/health")
        assert response.status_code == 200
        assert response.json() == {"status": "ok"}


# ---------------------------------------------------------------------------
# Authentication
# ---------------------------------------------------------------------------

class TestGoogleAuth:
    MOCK_GOOGLE_INFO = {
        "sub": "google-sub-999",
        "email": "newuser@example.com",
        "name": "New User",
        "picture": "https://example.com/pic.jpg",
    }

    def test_google_auth_creates_user_and_returns_token(self, client):
        with patch("app.routes.auth_routes.verify_google_token", return_value=self.MOCK_GOOGLE_INFO):
            response = client.post("/auth/google", json={"token": "fake-google-token"})

        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert data["token_type"] == "bearer"
        assert data["user"]["email"] == "newuser@example.com"
        assert data["user"]["name"] == "New User"

    def test_google_auth_second_login_does_not_duplicate_user(self, client):
        """Calling /auth/google twice for the same Google account should upsert, not duplicate."""
        with patch("app.routes.auth_routes.verify_google_token", return_value=self.MOCK_GOOGLE_INFO):
            r1 = client.post("/auth/google", json={"token": "fake-token-1"})
            r2 = client.post("/auth/google", json={"token": "fake-token-2"})

        assert r1.status_code == 200
        assert r2.status_code == 200
        # Both calls return the same user ID
        assert r1.json()["user"]["id"] == r2.json()["user"]["id"]

    def test_google_auth_invalid_token_returns_401(self, client):
        with patch(
            "app.routes.auth_routes.verify_google_token",
            side_effect=__import__("fastapi").HTTPException(status_code=401, detail="Invalid Google token"),
        ):
            response = client.post("/auth/google", json={"token": "bad-token"})

        assert response.status_code == 401


# ---------------------------------------------------------------------------
# Task creation
# ---------------------------------------------------------------------------

class TestCreateTask:
    def test_create_task_success(self, client, auth_headers):
        payload = {"title": "Test Task", "description": "Some description", "status": "Planned"}
        response = client.post("/api/tasks", json=payload, headers=auth_headers)

        assert response.status_code == 201
        data = response.json()
        assert data["title"] == "Test Task"
        assert data["description"] == "Some description"
        assert data["status"] == "Planned"
        assert "id" in data
        assert "created_at" in data
        assert "updated_at" in data

    def test_create_task_defaults_to_planned(self, client, auth_headers):
        response = client.post("/api/tasks", json={"title": "No status provided"}, headers=auth_headers)
        assert response.status_code == 201
        assert response.json()["status"] == "Planned"

    def test_create_task_with_in_progress_status(self, client, auth_headers):
        response = client.post(
            "/api/tasks",
            json={"title": "Started task", "status": "In Progress"},
            headers=auth_headers,
        )
        assert response.status_code == 201
        assert response.json()["status"] == "In Progress"

    def test_create_task_missing_title_returns_422(self, client, auth_headers):
        response = client.post("/api/tasks", json={"description": "No title"}, headers=auth_headers)
        assert response.status_code == 422

    def test_create_task_blank_title_returns_422(self, client, auth_headers):
        response = client.post("/api/tasks", json={"title": "   "}, headers=auth_headers)
        assert response.status_code == 422

    def test_create_task_without_auth_returns_403_or_401(self, client):
        response = client.post("/api/tasks", json={"title": "Unauthorized"})
        assert response.status_code in (401, 403)


# ---------------------------------------------------------------------------
# List tasks
# ---------------------------------------------------------------------------

class TestListTasks:
    def test_list_tasks_returns_empty_list_initially(self, client, auth_headers):
        # Fresh DB per test — no tasks yet
        response = client.get("/api/tasks", headers=auth_headers)
        assert response.status_code == 200
        assert response.json() == []

    def test_list_tasks_returns_created_tasks(self, client, auth_headers):
        client.post("/api/tasks", json={"title": "Task A"}, headers=auth_headers)
        client.post("/api/tasks", json={"title": "Task B"}, headers=auth_headers)

        response = client.get("/api/tasks", headers=auth_headers)
        assert response.status_code == 200
        titles = [t["title"] for t in response.json()]
        assert "Task A" in titles
        assert "Task B" in titles

    def test_list_tasks_without_auth_returns_401_or_403(self, client):
        response = client.get("/api/tasks")
        assert response.status_code in (401, 403)


# ---------------------------------------------------------------------------
# Update task status
# ---------------------------------------------------------------------------

class TestUpdateTaskStatus:
    def _create_task(self, client, auth_headers, title="Status Test Task"):
        r = client.post("/api/tasks", json={"title": title}, headers=auth_headers)
        assert r.status_code == 201
        return r.json()["id"]

    def test_update_status_to_in_progress(self, client, auth_headers):
        task_id = self._create_task(client, auth_headers)
        response = client.patch(
            f"/api/tasks/{task_id}/status",
            json={"status": "In Progress"},
            headers=auth_headers,
        )
        assert response.status_code == 200
        assert response.json()["status"] == "In Progress"

    def test_update_status_to_complete(self, client, auth_headers):
        task_id = self._create_task(client, auth_headers)
        response = client.patch(
            f"/api/tasks/{task_id}/status",
            json={"status": "Complete"},
            headers=auth_headers,
        )
        assert response.status_code == 200
        assert response.json()["status"] == "Complete"

    def test_update_status_back_to_planned(self, client, auth_headers):
        task_id = self._create_task(client, auth_headers)
        client.patch(f"/api/tasks/{task_id}/status", json={"status": "Complete"}, headers=auth_headers)
        response = client.patch(
            f"/api/tasks/{task_id}/status",
            json={"status": "Planned"},
            headers=auth_headers,
        )
        assert response.status_code == 200
        assert response.json()["status"] == "Planned"

    def test_update_status_invalid_value_returns_422(self, client, auth_headers):
        task_id = self._create_task(client, auth_headers)
        response = client.patch(
            f"/api/tasks/{task_id}/status",
            json={"status": "NotAStatus"},
            headers=auth_headers,
        )
        assert response.status_code == 422

    def test_update_status_nonexistent_task_returns_404(self, client, auth_headers):
        response = client.patch(
            "/api/tasks/99999/status",
            json={"status": "Complete"},
            headers=auth_headers,
        )
        assert response.status_code == 404

    def test_update_status_without_auth_returns_401_or_403(self, client):
        response = client.patch("/api/tasks/1/status", json={"status": "Complete"})
        assert response.status_code in (401, 403)


# ---------------------------------------------------------------------------
# User task isolation
# ---------------------------------------------------------------------------

class TestTaskIsolation:
    def test_user_cannot_see_other_users_tasks(self, client, auth_headers, second_user_auth_headers):
        # User 1 creates a task
        client.post("/api/tasks", json={"title": "User 1 Private Task"}, headers=auth_headers)

        # User 2 lists tasks — should NOT see user 1's task
        response = client.get("/api/tasks", headers=second_user_auth_headers)
        assert response.status_code == 200
        titles = [t["title"] for t in response.json()]
        assert "User 1 Private Task" not in titles

    def test_user_cannot_update_other_users_task(self, client, auth_headers, second_user_auth_headers):
        # User 1 creates a task
        r = client.post("/api/tasks", json={"title": "User 1 Task"}, headers=auth_headers)
        task_id = r.json()["id"]

        # User 2 tries to update it — should get 403
        response = client.patch(
            f"/api/tasks/{task_id}/status",
            json={"status": "Complete"},
            headers=second_user_auth_headers,
        )
        assert response.status_code == 403

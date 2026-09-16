"""
Pytest fixtures shared across all backend tests.

Uses an in-memory SQLite database so tests are:
  - Fast (no disk I/O)
  - Isolated (fresh DB per test session)
  - Non-destructive (never touch the dev database)

Environment variables are patched before the app is imported so
pydantic-settings picks up the test values.
"""
import os

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Patch env vars BEFORE importing the app so Settings() sees them
os.environ.setdefault("GOOGLE_CLIENT_ID", "test-client-id")
os.environ.setdefault("GOOGLE_CLIENT_SECRET", "test-secret")
os.environ.setdefault("JWT_SECRET_KEY", "test-jwt-secret-key-for-testing-only")
os.environ.setdefault("DATABASE_URL", "sqlite:///:memory:")
os.environ.setdefault("FRONTEND_ORIGIN", "http://localhost:5173")

from app.database import Base, get_db  # noqa: E402
from app.main import app  # noqa: E402

# In-memory SQLite engine for tests
TEST_DATABASE_URL = "sqlite:///:memory:"
test_engine = create_engine(TEST_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)


def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


@pytest.fixture(scope="session", autouse=True)
def setup_test_db():
    """Create all tables once before the test session, drop after."""
    Base.metadata.create_all(bind=test_engine)
    yield
    Base.metadata.drop_all(bind=test_engine)


@pytest.fixture()
def db():
    """Provide a database session that rolls back after each test."""
    connection = test_engine.connect()
    transaction = connection.begin()
    session = TestingSessionLocal(bind=connection)
    yield session
    session.close()
    transaction.rollback()
    connection.close()


@pytest.fixture()
def client(db):
    """TestClient with the DB dependency overridden to use the test DB."""
    app.dependency_overrides[get_db] = lambda: db
    with TestClient(app, raise_server_exceptions=True) as c:
        yield c
    app.dependency_overrides.clear()


@pytest.fixture()
def auth_headers(client, db):
    """
    Create a test user directly in the DB and return JWT auth headers.
    Bypasses Google token verification entirely.
    """
    from app.auth import create_access_token
    from app.models.user import User

    user = User(
        google_id="test-google-id-123",
        email="testuser@example.com",
        name="Test User",
        picture=None,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_access_token(user.id)
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture()
def second_user_auth_headers(client, db):
    """Headers for a second user — used to test task isolation."""
    from app.auth import create_access_token
    from app.models.user import User

    user = User(
        google_id="test-google-id-456",
        email="otheruser@example.com",
        name="Other User",
        picture=None,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_access_token(user.id)
    return {"Authorization": f"Bearer {token}"}

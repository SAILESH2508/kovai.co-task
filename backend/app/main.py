"""
FastAPI application entry point.

Startup sequence:
  1. Create all database tables (idempotent — safe to run every start).
  2. Register CORS middleware with the configured frontend origin.
  3. Mount auth and task routers.
  4. Expose a /api/health endpoint for uptime checks.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database import Base, engine
from app.routes import auth_router, task_router

# Import models so SQLAlchemy registers them before create_all
import app.models  # noqa: F401

# Create tables on startup (no-op if they already exist)
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Task Management API",
    description="Simple task management backend for the Graduate Engineer Assessment",
    version="1.0.0",
)

# CORS — only the configured frontend origin is allowed in production
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_origin],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(auth_router)
app.include_router(task_router)


@app.get("/api/health", tags=["Health"])
def health_check():
    """Simple liveness probe used by deployment platforms."""
    return {"status": "ok"}

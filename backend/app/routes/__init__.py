from app.routes.auth_routes import router as auth_router
from app.routes.task_routes import router as task_router

__all__ = ["auth_router", "task_router"]

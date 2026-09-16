"""
Application configuration loaded from environment variables.
Uses pydantic-settings so every value is validated at startup.
"""
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # Google OAuth
    google_client_id: str
    google_client_secret: str = ""  # Not needed for token verification, kept for completeness

    # JWT
    jwt_secret_key: str
    jwt_algorithm: str = "HS256"
    jwt_expire_minutes: int = 60

    # Database
    database_url: str = "sqlite:///./tasks.db"

    # CORS
    frontend_origin: str = "http://localhost:5173"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
    )


# Single shared instance used across the application
settings = Settings()

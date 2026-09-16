"""Pydantic schemas for user-related request/response shapes."""
from pydantic import BaseModel


class GoogleTokenRequest(BaseModel):
    """Payload sent by the frontend after Google signs the user in."""
    token: str


class UserOut(BaseModel):
    """Public user information returned in API responses."""
    id: int
    email: str
    name: str
    picture: str | None = None

    model_config = {"from_attributes": True}


class AuthResponse(BaseModel):
    """Response returned after successful Google authentication."""
    access_token: str
    token_type: str = "bearer"
    user: UserOut

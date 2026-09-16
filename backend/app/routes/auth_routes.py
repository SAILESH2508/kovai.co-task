"""
Authentication routes.

POST /auth/google  — accepts a Google ID token, creates/updates the user
                     record, and returns our JWT along with public user info.
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.auth import create_access_token, verify_google_token
from app.database import get_db
from app.models.user import User
from app.schemas.user import AuthResponse, GoogleTokenRequest, UserOut

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/google", response_model=AuthResponse)
def google_auth(payload: GoogleTokenRequest, db: Session = Depends(get_db)):
    """
    Exchange a Google ID token for an application JWT.

    Flow:
      1. Verify the ID token against Google's public keys.
      2. Upsert the user record (create on first login, update picture/name on subsequent logins).
      3. Issue and return an application-level JWT.
    """
    id_info = verify_google_token(payload.token)

    google_id = id_info.get("sub")
    email = id_info.get("email")
    name = id_info.get("name", email)
    picture = id_info.get("picture")

    if not google_id or not email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Incomplete profile data returned from Google",
        )

    # Upsert: find existing user by google_id or create a new one
    user = db.query(User).filter(User.google_id == google_id).first()
    if user is None:
        user = User(google_id=google_id, email=email, name=name, picture=picture)
        db.add(user)
    else:
        # Keep name and picture fresh in case the user updated their Google profile
        user.name = name
        user.picture = picture

    db.commit()
    db.refresh(user)

    access_token = create_access_token(user.id)

    return AuthResponse(
        access_token=access_token,
        token_type="bearer",
        user=UserOut.model_validate(user),
    )

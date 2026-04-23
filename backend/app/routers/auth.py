from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.security import create_access_token, create_refresh_token, verify_password
from app.db.session import get_db
from app.deps import get_current_user
from app.models.entities import User
from app.schemas.auth import (
    LoginRequest,
    LoginResponse,
    MeResponse,
    RefreshTokenRequest,
    RefreshTokenResponse,
    TokenUser,
)

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/login", response_model=LoginResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)) -> LoginResponse:
    user = db.query(User).filter(User.username == payload.username).first()
    if not user or not verify_password(payload.password, user.password_hash) or not user.is_active:
        raise HTTPException(status_code=401, detail="AUTH_INVALID_CREDENTIALS")

    return LoginResponse(
        access_token=create_access_token(user.username, user.role),
        refresh_token=create_refresh_token(user.username),
        user=TokenUser(id=user.id, username=user.username, role=user.role),
    )


@router.post("/refresh", response_model=RefreshTokenResponse)
def refresh(_: RefreshTokenRequest) -> RefreshTokenResponse:
    # TODO: persist and verify refresh token in RefreshToken table.
    raise HTTPException(status_code=501, detail="NOT_IMPLEMENTED")


@router.get("/me", response_model=MeResponse)
def me(user: User = Depends(get_current_user)) -> MeResponse:
    return MeResponse(id=user.id, username=user.username, role=user.role, is_active=user.is_active)

from datetime import UTC, datetime

from fastapi import APIRouter, Depends, HTTPException
from jose import JWTError
from sqlalchemy.orm import Session

from app.core.security import create_access_token, create_refresh_token, decode_token, verify_password
from app.db.session import get_db
from app.deps import get_current_user
from app.models.entities import User
from app.repositories.auth import get_refresh_token, get_user_by_username, is_refresh_token_active, revoke_refresh_token, store_refresh_token
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
    user = get_user_by_username(db, payload.username)
    if not user or not verify_password(payload.password, user.password_hash) or not user.is_active:
        raise HTTPException(status_code=401, detail="AUTH_INVALID_CREDENTIALS")

    access_token = create_access_token(user.username, user.role)
    refresh_token = create_refresh_token(user.username)
    refresh_payload = decode_token(refresh_token)
    store_refresh_token(db, user.id, refresh_token, datetime.fromtimestamp(refresh_payload["exp"], UTC))
    return LoginResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        user=TokenUser(id=user.id, username=user.username, role=user.role),
    )


@router.post("/refresh", response_model=RefreshTokenResponse)
def refresh(payload: RefreshTokenRequest, db: Session = Depends(get_db)) -> RefreshTokenResponse:
    try:
        token_payload = decode_token(payload.refresh_token)
    except JWTError as exc:
        raise HTTPException(status_code=401, detail="AUTH_INVALID_REFRESH_TOKEN") from exc

    if token_payload.get("type") != "refresh" or not token_payload.get("sub"):
        raise HTTPException(status_code=401, detail="AUTH_INVALID_REFRESH_TOKEN")

    stored = get_refresh_token(db, payload.refresh_token)
    if not stored:
        raise HTTPException(status_code=401, detail="AUTH_INVALID_REFRESH_TOKEN")
    if not is_refresh_token_active(stored):
        raise HTTPException(status_code=401, detail="AUTH_REFRESH_TOKEN_EXPIRED")

    user = db.query(User).filter(User.id == stored.user_id, User.is_active.is_(True)).first()
    if not user:
        raise HTTPException(status_code=401, detail="AUTH_INVALID_REFRESH_TOKEN")

    revoke_refresh_token(db, stored)
    access_token = create_access_token(user.username, user.role)
    refresh_token = create_refresh_token(user.username)
    refresh_payload = decode_token(refresh_token)
    store_refresh_token(db, user.id, refresh_token, datetime.fromtimestamp(refresh_payload["exp"], UTC))
    return RefreshTokenResponse(access_token=access_token, refresh_token=refresh_token)


@router.get("/me", response_model=MeResponse)
def me(user: User = Depends(get_current_user)) -> MeResponse:
    return MeResponse(id=user.id, username=user.username, role=user.role, is_active=user.is_active)

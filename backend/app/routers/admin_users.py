from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.security import get_password_hash
from app.db.session import get_db
from app.deps import require_admin
from app.models.entities import User
from app.schemas.user import UserCreateRequest, UserItem, UserListResponse, UserPatchRequest

router = APIRouter(prefix="/admin/users", tags=["admin-users"])


@router.get("", response_model=UserListResponse)
def list_users(_: User = Depends(require_admin), db: Session = Depends(get_db)) -> UserListResponse:
    users = db.query(User).order_by(User.id.asc()).all()
    return UserListResponse(items=[UserItem(id=u.id, username=u.username, role=u.role, is_active=u.is_active) for u in users])


@router.post("", response_model=UserItem, status_code=201)
def create_user(payload: UserCreateRequest, _: User = Depends(require_admin), db: Session = Depends(get_db)) -> UserItem:
    exists = db.query(User).filter(User.username == payload.username).first()
    if exists:
        raise HTTPException(status_code=409, detail="USERNAME_ALREADY_EXISTS")

    user = User(username=payload.username, password_hash=get_password_hash(payload.password), role=payload.role, is_active=True)
    db.add(user)
    db.commit()
    db.refresh(user)
    return UserItem(id=user.id, username=user.username, role=user.role, is_active=user.is_active)


@router.patch("/{user_id}", response_model=UserItem)
def patch_user(user_id: int, payload: UserPatchRequest, _: User = Depends(require_admin), db: Session = Depends(get_db)) -> UserItem:
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="USER_NOT_FOUND")

    if payload.is_active is not None:
        user.is_active = payload.is_active
    if payload.password:
        user.password_hash = get_password_hash(payload.password)

    db.commit()
    db.refresh(user)
    return UserItem(id=user.id, username=user.username, role=user.role, is_active=user.is_active)

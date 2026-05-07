from datetime import UTC, datetime

from sqlalchemy.orm import Session

from app.core.security import hash_token
from app.models.entities import RefreshToken, User


def get_user_by_username(db: Session, username: str) -> User | None:
    return db.query(User).filter(User.username == username).first()


def get_refresh_token(db: Session, token: str) -> RefreshToken | None:
    return db.query(RefreshToken).filter(RefreshToken.token_hash == hash_token(token)).first()


def store_refresh_token(db: Session, user_id: int, token: str, expires_at: datetime) -> RefreshToken:
    item = RefreshToken(user_id=user_id, token_hash=hash_token(token), expires_at=expires_at.replace(tzinfo=None))
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


def revoke_refresh_token(db: Session, item: RefreshToken) -> None:
    item.revoked_at = datetime.now(UTC).replace(tzinfo=None)
    db.commit()


def is_refresh_token_active(item: RefreshToken) -> bool:
    now = datetime.now(UTC).replace(tzinfo=None)
    return item.revoked_at is None and item.expires_at > now

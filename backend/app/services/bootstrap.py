from sqlalchemy.orm import Session

from app.core.security import get_password_hash
from app.models.entities import User


DEFAULT_USERS = [
    {"username": "admin", "password": "admin", "role": "admin"},
    {"username": "czy", "password": "czy", "role": "operator"},
]


def seed_default_users(db: Session) -> None:
    for item in DEFAULT_USERS:
        exists = db.query(User).filter(User.username == item["username"]).first()
        if exists:
            continue
        db.add(
            User(
                username=item["username"],
                password_hash=get_password_hash(item["password"]),
                role=item["role"],
                is_active=True,
            )
        )
    db.commit()

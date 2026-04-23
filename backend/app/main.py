from fastapi import FastAPI

from app.core.config import settings
from app.db.base import Base
from app.db.session import SessionLocal, engine
from app.routers import admin_plans, admin_rules, admin_users, auth, operator_tasks
from app.services.bootstrap import seed_default_users

app = FastAPI(title=settings.app_name)


@app.on_event("startup")
def on_startup() -> None:
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        seed_default_users(db)
    finally:
        db.close()


@app.get(f"{settings.api_prefix}/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


app.include_router(auth.router, prefix=settings.api_prefix)
app.include_router(admin_plans.router, prefix=settings.api_prefix)
app.include_router(admin_users.router, prefix=settings.api_prefix)
app.include_router(admin_rules.router, prefix=settings.api_prefix)
app.include_router(operator_tasks.router, prefix=settings.api_prefix)

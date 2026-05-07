from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.db.base import Base
from app.db.session import SessionLocal, engine
from app.routers import admin_import, admin_plans, admin_reports, admin_rules, admin_users, auth, operator_tasks
from app.services.bootstrap import seed_default_users

app = FastAPI(title=settings.app_name)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup() -> None:
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        seed_default_users(db)
    finally:
        db.close()


@app.get("/")
def root() -> dict[str, str]:
    return {
        "status": "ok",
        "api": settings.api_prefix,
        "health": f"{settings.api_prefix}/health",
    }


@app.get(f"{settings.api_prefix}/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


app.include_router(auth.router, prefix=settings.api_prefix)
app.include_router(admin_plans.router, prefix=settings.api_prefix)
app.include_router(admin_import.router, prefix=settings.api_prefix)
app.include_router(admin_reports.router, prefix=settings.api_prefix)
app.include_router(admin_users.router, prefix=settings.api_prefix)
app.include_router(admin_rules.router, prefix=settings.api_prefix)
app.include_router(operator_tasks.router, prefix=settings.api_prefix)

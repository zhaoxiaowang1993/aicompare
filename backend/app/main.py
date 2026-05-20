from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text

from app.core.config import settings
from app.db.base import Base
from app.db.session import SessionLocal, engine
from app.routers import admin_import, admin_plans, admin_reports, admin_rules, admin_users, auth, operator_plans, operator_tasks
from app.services.bootstrap import seed_default_users
from app.services.rule_type_migration import migrate_admission_record_rule_types

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
    with engine.begin() as connection:
        connection.execute(text("DROP TABLE IF EXISTS rules"))
    ensure_sqlite_compat_schema()
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        migrate_admission_record_rule_types(db)
        seed_default_users(db)
    finally:
        db.close()


def ensure_sqlite_compat_schema() -> None:
    with engine.begin() as connection:
        plan_columns = {row[1] for row in connection.execute(text("PRAGMA table_info(plans)")).fetchall()}
        if plan_columns and "annotation_type" not in plan_columns:
            connection.execute(text("ALTER TABLE plans ADD COLUMN annotation_type VARCHAR(16) NOT NULL DEFAULT 'comparison'"))
        case_columns = {row[1]: row for row in connection.execute(text("PRAGMA table_info(case_records)")).fetchall()}
        nullable_case_fields = ("agent_a_output", "agent_b_output", "display_a_source", "display_b_source")
        if case_columns and any(case_columns[field][3] for field in nullable_case_fields if field in case_columns):
            connection.execute(text("PRAGMA foreign_keys=OFF"))
            connection.execute(text("DROP TABLE IF EXISTS case_records_new"))
            connection.execute(
                text(
                    """
                    CREATE TABLE case_records_new (
                        id INTEGER NOT NULL,
                        plan_id INTEGER NOT NULL,
                        hospitalization_no VARCHAR(128) NOT NULL,
                        record_text TEXT NOT NULL,
                        agent_a_output TEXT,
                        agent_b_output TEXT,
                        display_a_source VARCHAR(32),
                        display_b_source VARCHAR(32),
                        import_batch_id VARCHAR(64) NOT NULL,
                        created_at DATETIME NOT NULL,
                        PRIMARY KEY (id),
                        CONSTRAINT uq_case_plan_hos_no UNIQUE (plan_id, hospitalization_no),
                        FOREIGN KEY(plan_id) REFERENCES plans (id)
                    )
                    """
                )
            )
            connection.execute(
                text(
                    """
                    INSERT INTO case_records_new (
                        id, plan_id, hospitalization_no, record_text, agent_a_output, agent_b_output,
                        display_a_source, display_b_source, import_batch_id, created_at
                    )
                    SELECT
                        id, plan_id, hospitalization_no, record_text, agent_a_output, agent_b_output,
                        display_a_source, display_b_source, import_batch_id, created_at
                    FROM case_records
                    """
                )
            )
            connection.execute(text("DROP INDEX IF EXISTS ix_case_records_plan_id"))
            connection.execute(text("DROP TABLE case_records"))
            connection.execute(text("ALTER TABLE case_records_new RENAME TO case_records"))
            connection.execute(text("CREATE INDEX ix_case_records_plan_id ON case_records (plan_id)"))
            connection.execute(text("PRAGMA foreign_keys=ON"))

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
app.include_router(operator_plans.router, prefix=settings.api_prefix)
app.include_router(operator_tasks.router, prefix=settings.api_prefix)

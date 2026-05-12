from datetime import datetime
from enum import Enum

from sqlalchemy import Boolean, DateTime, ForeignKey, Index, Integer, String, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class UserRole(str, Enum):
    ADMIN = "admin"
    OPERATOR = "operator"


class PlanStatus(str, Enum):
    ACTIVE = "active"
    CLOSED = "closed"


class Decision(str, Enum):
    A_BETTER = "A_BETTER"
    B_BETTER = "B_BETTER"
    BOTH_BAD = "BOTH_BAD"
    BOTH_GOOD = "BOTH_GOOD"


class RuleCategory(str, Enum):
    ADMISSION_RECORD = "admission_record"
    FIRST_COURSE_RECORD = "first_course_record"
    SUPERIOR_PHYSICIAN_ROUND = "superior_physician_round"
    DAILY_COURSE_RECORD = "daily_course_record"
    DISCHARGE_RECORD = "discharge_record"


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    username: Mapped[str] = mapped_column(String(64), unique=True, nullable=False)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[str] = mapped_column(String(16), nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)


class Plan(Base):
    __tablename__ = "plans"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    owner_user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    status: Mapped[str] = mapped_column(String(16), default=PlanStatus.ACTIVE.value, nullable=False)
    created_by: Mapped[int | None] = mapped_column(ForeignKey("users.id"), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)


class CaseRecord(Base):
    __tablename__ = "case_records"
    __table_args__ = (
        UniqueConstraint("plan_id", "hospitalization_no", name="uq_case_plan_hos_no"),
        Index("ix_case_records_plan_id", "plan_id"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    plan_id: Mapped[int] = mapped_column(ForeignKey("plans.id"), nullable=False)
    hospitalization_no: Mapped[str] = mapped_column(String(128), nullable=False)
    record_text: Mapped[str] = mapped_column(Text, nullable=False)
    agent_a_output: Mapped[str] = mapped_column(Text, nullable=False)
    agent_b_output: Mapped[str] = mapped_column(Text, nullable=False)
    display_a_source: Mapped[str] = mapped_column(String(32), nullable=False)
    display_b_source: Mapped[str] = mapped_column(String(32), nullable=False)
    import_batch_id: Mapped[str] = mapped_column(String(64), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)


class Annotation(Base):
    __tablename__ = "annotations"
    __table_args__ = (
        UniqueConstraint("case_id", "operator_user_id", name="uq_annotation_case_operator"),
        Index("ix_annotations_plan_created", "plan_id", "created_at"),
        Index("ix_annotations_operator_decision", "operator_user_id", "decision"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    plan_id: Mapped[int] = mapped_column(ForeignKey("plans.id"), nullable=False)
    case_id: Mapped[int] = mapped_column(ForeignKey("case_records.id"), nullable=False)
    operator_user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    decision: Mapped[str] = mapped_column(String(16), nullable=False)
    reason_codes: Mapped[str] = mapped_column(Text, nullable=False)
    other_reason_text: Mapped[str | None] = mapped_column(Text, nullable=True)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)


class QualityRule(Base):
    __tablename__ = "quality_rules"
    __table_args__ = (
        Index("ix_quality_rules_category", "category"),
        Index("ix_quality_rules_deleted_at", "deleted_at"),
        Index("ix_quality_rules_updated_at", "updated_at"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    category: Mapped[str] = mapped_column(String(32), nullable=False)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    score: Mapped[str] = mapped_column(String(64), nullable=False)
    deleted_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    created_by: Mapped[int | None] = mapped_column(ForeignKey("users.id"), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)


class RefreshToken(Base):
    __tablename__ = "refresh_tokens"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    token_hash: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    expires_at: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    revoked_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)

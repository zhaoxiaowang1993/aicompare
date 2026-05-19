from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.entities import Annotation, CaseRecord, ManualCaseAnnotation, Plan, PlanAnnotationType, User


def get_active_operator(db: Session, user_id: int) -> User | None:
    return db.query(User).filter(User.id == user_id, User.role == "operator", User.is_active.is_(True)).first()


def get_plan(db: Session, plan_id: int) -> Plan | None:
    return db.query(Plan).filter(Plan.id == plan_id).first()


def list_plans(
    db: Session,
    status: str | None,
    owner_user_id: int | None,
    annotation_type: str | None,
    page: int,
    page_size: int,
) -> tuple[list[Plan], int]:
    query = db.query(Plan).filter(Plan.status.in_(("active", "closed")))
    if status:
        query = query.filter(Plan.status == status)
    if owner_user_id:
        query = query.filter(Plan.owner_user_id == owner_user_id)
    if annotation_type:
        query = query.filter(Plan.annotation_type == annotation_type)
    total = query.count()
    items = query.order_by(Plan.created_at.desc()).offset((page - 1) * page_size).limit(page_size).all()
    return items, total


def get_plan_progress(db: Session, plan_id: int) -> tuple[int, int]:
    plan = get_plan(db, plan_id)
    total_cases = db.query(func.count(CaseRecord.id)).filter(CaseRecord.plan_id == plan_id).scalar() or 0
    if plan and plan.annotation_type == PlanAnnotationType.MANUAL.value:
        annotated_cases = db.query(func.count(func.distinct(ManualCaseAnnotation.case_id))).filter(ManualCaseAnnotation.plan_id == plan_id).scalar() or 0
    else:
        annotated_cases = db.query(func.count(func.distinct(Annotation.case_id))).filter(Annotation.plan_id == plan_id).scalar() or 0
    return int(total_cases), int(annotated_cases)


def get_operator_options(db: Session) -> list[User]:
    return db.query(User).filter(User.role == "operator", User.is_active.is_(True)).order_by(User.username.asc()).all()

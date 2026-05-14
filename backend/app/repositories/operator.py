from sqlalchemy import exists, func
from sqlalchemy.orm import Session

from app.models.entities import Annotation, CaseRecord, Plan, QualityRule


def get_operator_plan(db: Session, plan_id: int) -> Plan | None:
    return db.query(Plan).filter(Plan.id == plan_id).first()


def list_operator_plans(db: Session, operator_user_id: int, page: int, page_size: int) -> tuple[list[Plan], int]:
    query = db.query(Plan).filter(
        Plan.owner_user_id == operator_user_id,
        Plan.status.in_(("active", "closed")),
    )
    total = query.count()
    plans = query.order_by(Plan.updated_at.desc(), Plan.id.desc()).offset((page - 1) * page_size).limit(page_size).all()
    return plans, total


def count_plan_cases(db: Session, plan_id: int) -> int:
    return int(db.query(func.count(CaseRecord.id)).filter(CaseRecord.plan_id == plan_id).scalar() or 0)


def count_operator_plan_annotations(db: Session, plan_id: int, operator_user_id: int) -> int:
    return int(
        db.query(func.count(func.distinct(Annotation.case_id)))
        .filter(Annotation.plan_id == plan_id, Annotation.operator_user_id == operator_user_id)
        .scalar()
        or 0
    )


def get_case(db: Session, case_id: int) -> CaseRecord | None:
    return db.query(CaseRecord).filter(CaseRecord.id == case_id).first()


def get_next_unannotated_case(db: Session, plan_id: int, operator_user_id: int) -> CaseRecord | None:
    already_annotated = exists().where(
        Annotation.case_id == CaseRecord.id,
        Annotation.operator_user_id == operator_user_id,
    )
    return (
        db.query(CaseRecord)
        .filter(CaseRecord.plan_id == plan_id)
        .filter(~already_annotated)
        .order_by(CaseRecord.id.asc())
        .first()
    )


def list_active_quality_rules(db: Session) -> list[QualityRule]:
    return (
        db.query(QualityRule)
        .filter(QualityRule.deleted_at.is_(None))
        .order_by(QualityRule.category.asc(), QualityRule.id.asc())
        .all()
    )


def create_annotation(
    db: Session,
    *,
    plan_id: int,
    case_id: int,
    operator_user_id: int,
    decision: str,
    reason_codes: str,
    other_reason_text: str | None,
    notes: str | None,
) -> Annotation:
    annotation = Annotation(
        plan_id=plan_id,
        case_id=case_id,
        operator_user_id=operator_user_id,
        decision=decision,
        reason_codes=reason_codes,
        other_reason_text=other_reason_text,
        notes=notes,
    )
    db.add(annotation)
    return annotation

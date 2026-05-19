from sqlalchemy import exists, func
from sqlalchemy.orm import Session

from app.models.entities import Annotation, CaseRecord, ManualAnnotationEntry, ManualCaseAnnotation, Plan, PlanAnnotationType, QualityRule


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
    plan = get_operator_plan(db, plan_id)
    if plan and plan.annotation_type == PlanAnnotationType.MANUAL.value:
        return int(
            db.query(func.count(func.distinct(ManualCaseAnnotation.case_id)))
            .filter(ManualCaseAnnotation.plan_id == plan_id, ManualCaseAnnotation.operator_user_id == operator_user_id)
            .scalar()
            or 0
        )
    return int(
        db.query(func.count(func.distinct(Annotation.case_id)))
        .filter(Annotation.plan_id == plan_id, Annotation.operator_user_id == operator_user_id)
        .scalar()
        or 0
    )


def get_case(db: Session, case_id: int) -> CaseRecord | None:
    return db.query(CaseRecord).filter(CaseRecord.id == case_id).first()


def get_next_unannotated_case(db: Session, plan_id: int, operator_user_id: int, annotation_type: str = PlanAnnotationType.COMPARISON.value) -> CaseRecord | None:
    if annotation_type == PlanAnnotationType.MANUAL.value:
        already_annotated = exists().where(
            ManualCaseAnnotation.case_id == CaseRecord.id,
            ManualCaseAnnotation.operator_user_id == operator_user_id,
        )
    else:
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


def get_active_quality_rule(db: Session, rule_id: int) -> QualityRule | None:
    return db.query(QualityRule).filter(QualityRule.id == rule_id, QualityRule.deleted_at.is_(None)).first()


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


def create_manual_case_annotation(
    db: Session,
    *,
    plan_id: int,
    case_id: int,
    operator_user_id: int,
    result: str,
) -> ManualCaseAnnotation:
    annotation = ManualCaseAnnotation(
        plan_id=plan_id,
        case_id=case_id,
        operator_user_id=operator_user_id,
        result=result,
    )
    db.add(annotation)
    db.flush()
    return annotation


def create_manual_annotation_entry(
    db: Session,
    *,
    manual_annotation_id: int,
    plan_id: int,
    case_id: int,
    operator_user_id: int,
    source_text: str,
    start_offset: int,
    end_offset: int,
    quality_rule_id: int,
    quality_rule_category_snapshot: str,
    quality_rule_content_snapshot: str,
    quality_rule_score_snapshot: str,
    suggestion: str,
    notes: str | None,
) -> ManualAnnotationEntry:
    entry = ManualAnnotationEntry(
        manual_annotation_id=manual_annotation_id,
        plan_id=plan_id,
        case_id=case_id,
        operator_user_id=operator_user_id,
        source_text=source_text,
        start_offset=start_offset,
        end_offset=end_offset,
        quality_rule_id=quality_rule_id,
        quality_rule_category_snapshot=quality_rule_category_snapshot,
        quality_rule_content_snapshot=quality_rule_content_snapshot,
        quality_rule_score_snapshot=quality_rule_score_snapshot,
        suggestion=suggestion,
        notes=notes,
    )
    db.add(entry)
    return entry

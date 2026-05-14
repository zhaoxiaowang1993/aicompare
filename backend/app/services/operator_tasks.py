import json

from fastapi import HTTPException
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.models.entities import Annotation, CaseRecord, Plan, User
from app.repositories import operator as operator_repo
from app.schemas.operator import (
    AnnotationCreatedResponse,
    AnnotationReason,
    AnnotationSubmitRequest,
    OperatorDisplayMapping,
    OperatorPlanSummary,
    OperatorQualityRule,
    OperatorTaskPayload,
)


def plan_summary(db: Session, plan: Plan, operator_user_id: int) -> OperatorPlanSummary:
    total_cases = operator_repo.count_plan_cases(db, plan.id)
    annotated_cases = operator_repo.count_operator_plan_annotations(db, plan.id, operator_user_id)
    pending_cases = max(total_cases - annotated_cases, 0)
    return OperatorPlanSummary(
        id=plan.id,
        name=plan.name,
        description=plan.description,
        status=plan.status,
        total_cases=total_cases,
        annotated_cases=annotated_cases,
        pending_cases=pending_cases,
        completion_rate=round(annotated_cases / total_cases, 4) if total_cases else 0,
        updated_at=plan.updated_at,
    )


def list_assigned_plans(db: Session, operator_user_id: int, page: int, page_size: int) -> tuple[list[OperatorPlanSummary], int]:
    plans, total = operator_repo.list_operator_plans(db, operator_user_id, page, page_size)
    return [plan_summary(db, plan, operator_user_id) for plan in plans], total


def require_assigned_plan(db: Session, plan_id: int, operator_user_id: int) -> Plan:
    plan = operator_repo.get_operator_plan(db, plan_id)
    if not plan:
        raise HTTPException(status_code=404, detail="PLAN_NOT_FOUND")
    if plan.owner_user_id != operator_user_id:
        raise HTTPException(status_code=403, detail="PLAN_NOT_ASSIGNED_TO_OPERATOR")
    return plan


def require_active_assigned_plan(db: Session, plan_id: int, operator_user_id: int) -> Plan:
    plan = require_assigned_plan(db, plan_id, operator_user_id)
    if plan.status == "closed":
        raise HTTPException(status_code=409, detail="PLAN_CLOSED")
    return plan


def source_label(source: str) -> str:
    if source == "agent_a_output":
        return "agent_a"
    if source == "agent_b_output":
        return "agent_b"
    return source


def case_output(case: CaseRecord, source: str) -> str:
    if source == "agent_a_output":
        return case.agent_a_output
    if source == "agent_b_output":
        return case.agent_b_output
    raise HTTPException(status_code=500, detail="DISPLAY_MAPPING_INVALID")


def task_payload(db: Session, case: CaseRecord) -> OperatorTaskPayload:
    rules = [
        OperatorQualityRule(id=rule.id, category=rule.category, content=rule.content, score=rule.score)
        for rule in operator_repo.list_active_quality_rules(db)
    ]
    return OperatorTaskPayload(
        case_id=case.id,
        plan_id=case.plan_id,
        hospitalization_no=case.hospitalization_no,
        record_text=case.record_text,
        output_a=case_output(case, case.display_a_source),
        output_b=case_output(case, case.display_b_source),
        display_mapping=OperatorDisplayMapping(A=source_label(case.display_a_source), B=source_label(case.display_b_source)),
        quality_rules=rules,
    )


def next_task(db: Session, plan_id: int, operator_user_id: int) -> OperatorTaskPayload | None:
    require_active_assigned_plan(db, plan_id, operator_user_id)
    case = operator_repo.get_next_unannotated_case(db, plan_id, operator_user_id)
    if not case:
        return None
    return task_payload(db, case)


def submit_annotation(
    db: Session,
    case_id: int,
    payload: AnnotationSubmitRequest,
    user: User,
    *,
    expected_plan_id: int | None = None,
) -> AnnotationCreatedResponse:
    if AnnotationReason.OTHER in payload.reason_codes and not payload.other_reason_text:
        raise HTTPException(status_code=400, detail="VALIDATION_ERROR")

    case = operator_repo.get_case(db, case_id)
    if not case:
        raise HTTPException(status_code=404, detail="CASE_NOT_FOUND")
    if expected_plan_id is not None and case.plan_id != expected_plan_id:
        raise HTTPException(status_code=404, detail="CASE_NOT_FOUND")

    require_active_assigned_plan(db, case.plan_id, user.id)
    reason_codes = [reason.value for reason in payload.reason_codes]
    annotation = operator_repo.create_annotation(
        db,
        plan_id=case.plan_id,
        case_id=case.id,
        operator_user_id=user.id,
        decision=payload.decision.value,
        reason_codes=json.dumps(reason_codes, ensure_ascii=False),
        other_reason_text=payload.other_reason_text if AnnotationReason.OTHER in payload.reason_codes else None,
        notes=payload.notes,
    )

    try:
        db.commit()
    except IntegrityError as exc:
        db.rollback()
        raise HTTPException(status_code=409, detail="ANNOTATION_ALREADY_EXISTS") from exc

    db.refresh(annotation)
    return annotation_response(annotation)


def annotation_response(annotation: Annotation) -> AnnotationCreatedResponse:
    return AnnotationCreatedResponse(
        annotation_id=annotation.id,
        case_id=annotation.case_id,
        plan_id=annotation.plan_id,
        operator_user_id=annotation.operator_user_id,
        decision=annotation.decision,
        reason_codes=json.loads(annotation.reason_codes),
        other_reason_text=annotation.other_reason_text,
        notes=annotation.notes,
        created_at=annotation.created_at,
    )

import json
import re

from fastapi import HTTPException
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.models.entities import Annotation, CaseRecord, ManualAnnotationResult, ManualCaseAnnotation, Plan, PlanAnnotationType, User
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
        annotation_type=plan.annotation_type,
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
        return case.agent_a_output or ""
    if source == "agent_b_output":
        return case.agent_b_output or ""
    raise HTTPException(status_code=500, detail="DISPLAY_MAPPING_INVALID")


def task_payload(db: Session, case: CaseRecord, annotation_type: str = PlanAnnotationType.COMPARISON.value) -> OperatorTaskPayload:
    rules = [
        OperatorQualityRule(id=rule.id, category=rule.category, content=rule.content, score=rule.score)
        for rule in operator_repo.list_active_quality_rules(db)
    ]
    if annotation_type == PlanAnnotationType.MANUAL.value:
        return OperatorTaskPayload(
            case_id=case.id,
            plan_id=case.plan_id,
            annotation_type=PlanAnnotationType.MANUAL,
            hospitalization_no=case.hospitalization_no,
            record_text=case.record_text,
            quality_rules=rules,
        )
    if not case.display_a_source or not case.display_b_source:
        raise HTTPException(status_code=500, detail="DISPLAY_MAPPING_INVALID")
    return OperatorTaskPayload(
        case_id=case.id,
        plan_id=case.plan_id,
        annotation_type=PlanAnnotationType.COMPARISON,
        hospitalization_no=case.hospitalization_no,
        record_text=case.record_text,
        output_a=case_output(case, case.display_a_source),
        output_b=case_output(case, case.display_b_source),
        display_mapping=OperatorDisplayMapping(A=source_label(case.display_a_source), B=source_label(case.display_b_source)),
        quality_rules=rules,
    )


def next_task(db: Session, plan_id: int, operator_user_id: int) -> OperatorTaskPayload | None:
    plan = require_active_assigned_plan(db, plan_id, operator_user_id)
    case = operator_repo.get_next_unannotated_case(db, plan_id, operator_user_id, plan.annotation_type)
    if not case:
        return None
    return task_payload(db, case, plan.annotation_type)


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
    plan = operator_repo.get_operator_plan(db, case.plan_id)
    if plan and plan.annotation_type != PlanAnnotationType.COMPARISON.value:
        raise HTTPException(status_code=400, detail="VALIDATION_ERROR")
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


def normalize_newlines(value: str) -> str:
    return value.replace("\r\n", "\n").replace("\r", "\n")


def normalize_record_markup(value: str) -> str:
    normalized = normalize_newlines(value)
    normalized = re.sub(r"\\r\\n|\\n|\\r", "\n", normalized)
    normalized = re.sub(r"<br\s*/?>", "\n", normalized, flags=re.IGNORECASE)
    normalized = re.sub(r"</p>", "\n", normalized, flags=re.IGNORECASE)
    normalized = normalized.replace("_x005f", "")
    return re.sub(r"<[^>]+>", "", normalized)


def validate_entry_offsets(record_text: str, source_text: str, start_offset: int, end_offset: int) -> None:
    if start_offset < 0 or end_offset <= start_offset or end_offset > len(record_text):
        raise HTTPException(status_code=400, detail="VALIDATION_ERROR")
    if normalize_record_markup(record_text[start_offset:end_offset]).strip() != normalize_record_markup(source_text).strip():
        raise HTTPException(status_code=400, detail="VALIDATION_ERROR")


def submit_manual_annotation(
    db: Session,
    case_id: int,
    payload,
    user: User,
) -> "ManualAnnotationCreatedResponse":
    from app.schemas.operator import ManualAnnotationCreatedResponse

    case = operator_repo.get_case(db, case_id)
    if not case:
        raise HTTPException(status_code=404, detail="CASE_NOT_FOUND")
    plan = require_active_assigned_plan(db, case.plan_id, user.id)
    if plan.annotation_type != PlanAnnotationType.MANUAL.value:
        raise HTTPException(status_code=400, detail="VALIDATION_ERROR")

    if payload.result == ManualAnnotationResult.HAS_ISSUES and not payload.entries:
        raise HTTPException(status_code=400, detail="VALIDATION_ERROR")
    if payload.result == ManualAnnotationResult.NO_ISSUE and payload.entries:
        raise HTTPException(status_code=400, detail="VALIDATION_ERROR")

    try:
        manual_annotation = operator_repo.create_manual_case_annotation(
            db,
            plan_id=case.plan_id,
            case_id=case.id,
            operator_user_id=user.id,
            result=payload.result.value,
        )
        for entry in payload.entries:
            if entry.source_text is None or entry.suggestion is None:
                raise HTTPException(status_code=400, detail="VALIDATION_ERROR")
            validate_entry_offsets(case.record_text, entry.source_text, entry.start_offset, entry.end_offset)
            rule = operator_repo.get_active_quality_rule(db, entry.quality_rule_id)
            if not rule:
                raise HTTPException(status_code=400, detail="VALIDATION_ERROR")
            operator_repo.create_manual_annotation_entry(
                db,
                manual_annotation_id=manual_annotation.id,
                plan_id=case.plan_id,
                case_id=case.id,
                operator_user_id=user.id,
                source_text=normalize_newlines(entry.source_text),
                start_offset=entry.start_offset,
                end_offset=entry.end_offset,
                quality_rule_id=rule.id,
                quality_rule_category_snapshot=rule.category,
                quality_rule_content_snapshot=rule.content,
                quality_rule_score_snapshot=rule.score,
                suggestion=entry.suggestion,
                notes=entry.notes,
            )
        db.commit()
    except IntegrityError as exc:
        db.rollback()
        raise HTTPException(status_code=409, detail="ANNOTATION_ALREADY_EXISTS") from exc

    db.refresh(manual_annotation)
    return ManualAnnotationCreatedResponse(
        manual_annotation_id=manual_annotation.id,
        case_id=manual_annotation.case_id,
        plan_id=manual_annotation.plan_id,
        operator_user_id=manual_annotation.operator_user_id,
        result=manual_annotation.result,
        entry_count=len(payload.entries),
        created_at=manual_annotation.created_at,
    )

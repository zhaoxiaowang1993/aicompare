import json
from datetime import date

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.deps import require_admin
from app.models.entities import Annotation, Decision, ManualAnnotationEntry, ManualCaseAnnotation, PlanAnnotationType, User
from app.repositories.plans import get_plan_progress
from app.repositories.reports import annotation_query, get_case, get_plan, get_user, local_date_to_utc_naive, plan_total_cases
from app.schemas.report import (
    AnnotationDetailItem,
    AnnotationListResponse,
    DistributionItem,
    ManualAnnotationDetailResponse,
    ManualAnnotationEntryDetail,
    ManualAnnotationListResponse,
    ManualAnnotationSummaryItem,
    PlanStatsResponse,
)

router = APIRouter(prefix="/admin/plans", tags=["admin-reports"])

REASON_KEYS = ["NO_HIT_ERROR_RULE", "NO_MISSING_RULE", "NO_OVER_QC", "OTHER"]


def source_to_original_decision(source: str, fallback: str) -> str:
    if source == "agent_a_output":
        return Decision.A_BETTER.value
    if source == "agent_b_output":
        return Decision.B_BETTER.value
    return fallback


def original_agent_decision(decision: str, display_a_source: str, display_b_source: str) -> str:
    if decision == Decision.A_BETTER.value:
        return source_to_original_decision(display_a_source, decision)
    if decision == Decision.B_BETTER.value:
        return source_to_original_decision(display_b_source, decision)
    return decision


def parse_reason_codes(raw: str) -> list[str]:
    try:
        value = json.loads(raw)
        if isinstance(value, list):
            return [str(item) for item in value]
    except json.JSONDecodeError:
        pass
    return [item.strip() for item in raw.split(",") if item.strip()]


def manual_completion_query(
    db: Session,
    *,
    plan_id: int,
    operator_user_id: int | None = None,
    result: str | None = None,
    start_date: date | None = None,
    end_date: date | None = None,
):
    query = db.query(ManualCaseAnnotation).filter(ManualCaseAnnotation.plan_id == plan_id)
    if operator_user_id:
        query = query.filter(ManualCaseAnnotation.operator_user_id == operator_user_id)
    if result:
        query = query.filter(ManualCaseAnnotation.result == result)
    if start_date:
        query = query.filter(ManualCaseAnnotation.submitted_at >= local_date_to_utc_naive(start_date))
    if end_date:
        query = query.filter(ManualCaseAnnotation.submitted_at <= local_date_to_utc_naive(end_date, end_of_day=True))
    return query


def manual_entry_count(db: Session, manual_annotation_id: int) -> int:
    return int(
        db.query(ManualAnnotationEntry)
        .filter(ManualAnnotationEntry.manual_annotation_id == manual_annotation_id)
        .count()
    )


@router.get("/{plan_id}/stats", response_model=PlanStatsResponse)
def plan_stats(
    plan_id: int,
    operator_user_id: int | None = None,
    decision: str | None = None,
    start_date: date | None = None,
    end_date: date | None = None,
    _: User = Depends(require_admin),
    db: Session = Depends(get_db),
) -> PlanStatsResponse:
    plan = get_plan(db, plan_id)
    if not plan:
        raise HTTPException(status_code=404, detail="PLAN_NOT_FOUND")

    if plan.annotation_type == PlanAnnotationType.MANUAL.value:
        total_cases = plan_total_cases(db, plan_id)
        completions = manual_completion_query(
            db,
            plan_id=plan_id,
            operator_user_id=operator_user_id,
            start_date=start_date,
            end_date=end_date,
        ).all()
        annotated_cases = len({item.case_id for item in completions})
        pending_cases = max(total_cases - annotated_cases, 0)
        has_issues_cases = sum(1 for item in completions if item.result == "has_issues")
        no_issue_cases = sum(1 for item in completions if item.result == "no_issue")
        return PlanStatsResponse(
            plan_id=plan_id,
            annotation_type=PlanAnnotationType.MANUAL,
            total_cases=total_cases,
            annotated_cases=annotated_cases,
            pending_cases=pending_cases,
            completion_rate=round(annotated_cases / total_cases, 4) if total_cases else 0,
            has_issues_cases=has_issues_cases,
            no_issue_cases=no_issue_cases,
        )

    scoped_query = annotation_query(
        db,
        plan_id=plan_id,
        operator_user_id=operator_user_id,
        start_date=start_date,
        end_date=end_date,
    )
    annotations = scoped_query.all()
    total_cases = plan_total_cases(db, plan_id)
    decision_distribution = {item.value: 0 for item in Decision}
    reason_counts = {key: 0 for key in REASON_KEYS}
    included_case_ids: set[int] = set()
    for item in annotations:
        case = get_case(db, item.case_id)
        if not case:
            continue
        normalized_decision = original_agent_decision(item.decision, case.display_a_source, case.display_b_source)
        if decision and normalized_decision != decision:
            continue
        included_case_ids.add(item.case_id)
        if normalized_decision in decision_distribution:
            decision_distribution[normalized_decision] += 1
        for reason in parse_reason_codes(item.reason_codes):
            reason_counts[reason if reason in reason_counts else "OTHER"] += 1
    annotated_cases = (
        len(included_case_ids)
        if any([operator_user_id, decision, start_date, end_date])
        else get_plan_progress(db, plan_id)[1]
    )
    pending_cases = max(total_cases - annotated_cases, 0)

    return PlanStatsResponse(
        plan_id=plan_id,
        annotation_type=PlanAnnotationType.COMPARISON,
        total_cases=total_cases,
        annotated_cases=annotated_cases,
        pending_cases=pending_cases,
        completion_rate=round(annotated_cases / total_cases, 4) if total_cases else 0,
        decision_distribution=decision_distribution,
        reason_distribution=[DistributionItem(key=key, count=count) for key, count in reason_counts.items()],
    )


@router.get("/{plan_id}/annotations/{manual_annotation_id}", response_model=ManualAnnotationDetailResponse)
def manual_annotation_detail(
    plan_id: int,
    manual_annotation_id: int,
    _: User = Depends(require_admin),
    db: Session = Depends(get_db),
) -> ManualAnnotationDetailResponse:
    plan = get_plan(db, plan_id)
    if not plan:
        raise HTTPException(status_code=404, detail="PLAN_NOT_FOUND")
    if plan.annotation_type != PlanAnnotationType.MANUAL.value:
        raise HTTPException(status_code=404, detail="MANUAL_ANNOTATION_NOT_FOUND")

    annotation = (
        db.query(ManualCaseAnnotation)
        .filter(ManualCaseAnnotation.id == manual_annotation_id, ManualCaseAnnotation.plan_id == plan_id)
        .first()
    )
    if not annotation:
        raise HTTPException(status_code=404, detail="MANUAL_ANNOTATION_NOT_FOUND")
    case = get_case(db, annotation.case_id)
    operator = get_user(db, annotation.operator_user_id)
    if not case:
        raise HTTPException(status_code=404, detail="CASE_NOT_FOUND")

    entries = (
        db.query(ManualAnnotationEntry)
        .filter(ManualAnnotationEntry.manual_annotation_id == annotation.id)
        .order_by(ManualAnnotationEntry.start_offset.asc(), ManualAnnotationEntry.id.asc())
        .all()
    )
    return ManualAnnotationDetailResponse(
        manual_annotation_id=annotation.id,
        case_id=annotation.case_id,
        hospitalization_no=case.hospitalization_no,
        operator=operator.username if operator else "-",
        result=annotation.result,
        record_text=case.record_text,
        submitted_at=annotation.submitted_at,
        entries=[
            ManualAnnotationEntryDetail(
                entry_id=entry.id,
                source_text=entry.source_text,
                start_offset=entry.start_offset,
                end_offset=entry.end_offset,
                quality_rule={
                    "id": entry.quality_rule_id,
                    "category": entry.quality_rule_category_snapshot,
                    "content": entry.quality_rule_content_snapshot,
                    "score": entry.quality_rule_score_snapshot,
                },
                suggestion=entry.suggestion,
                notes=entry.notes,
                created_at=entry.created_at,
            )
            for entry in entries
        ],
    )


@router.get("/{plan_id}/annotations", response_model=AnnotationListResponse | ManualAnnotationListResponse)
def plan_annotations(
    plan_id: int,
    operator_user_id: int | None = None,
    decision: str | None = None,
    start_date: date | None = None,
    end_date: date | None = None,
    result: str | None = None,
    page: int = 1,
    page_size: int = 20,
    _: User = Depends(require_admin),
    db: Session = Depends(get_db),
) -> AnnotationListResponse | ManualAnnotationListResponse:
    plan = get_plan(db, plan_id)
    if not plan:
        raise HTTPException(status_code=404, detail="PLAN_NOT_FOUND")

    page = max(page, 1)
    page_size = min(max(page_size, 1), 100)

    if plan.annotation_type == PlanAnnotationType.MANUAL.value:
        query = manual_completion_query(
            db,
            plan_id=plan_id,
            operator_user_id=operator_user_id,
            result=result,
            start_date=start_date,
            end_date=end_date,
        )
        total = query.count()
        completions = query.order_by(ManualCaseAnnotation.submitted_at.desc()).offset((page - 1) * page_size).limit(page_size).all()
        items: list[ManualAnnotationSummaryItem] = []
        for completion in completions:
            case = get_case(db, completion.case_id)
            operator = get_user(db, completion.operator_user_id)
            if not case:
                continue
            items.append(
                ManualAnnotationSummaryItem(
                    manual_annotation_id=completion.id,
                    case_id=completion.case_id,
                    hospitalization_no=case.hospitalization_no,
                    operator_user_id=completion.operator_user_id,
                    operator_username=operator.username if operator else None,
                    result=completion.result,
                    problem_count=manual_entry_count(db, completion.id),
                    submitted_at=completion.submitted_at,
                )
            )
        return ManualAnnotationListResponse(items=items, total=total, page=page, page_size=page_size)

    query = annotation_query(
        db,
        plan_id=plan_id,
        operator_user_id=operator_user_id,
        start_date=start_date,
        end_date=end_date,
    )
    normalized_rows = []
    for annotation in query.order_by(Annotation.created_at.desc()).all():
        case = get_case(db, annotation.case_id)
        operator = get_user(db, annotation.operator_user_id)
        if not case:
            continue
        normalized_decision = original_agent_decision(annotation.decision, case.display_a_source, case.display_b_source)
        if decision and normalized_decision != decision:
            continue
        normalized_rows.append((annotation, case, operator, normalized_decision))

    total = len(normalized_rows)
    items: list[AnnotationDetailItem] = []
    for annotation, case, operator, normalized_decision in normalized_rows[(page - 1) * page_size : page * page_size]:
        items.append(
            AnnotationDetailItem(
                id=annotation.id,
                case_id=annotation.case_id,
                hospitalization_no=case.hospitalization_no,
                operator_user_id=annotation.operator_user_id,
                operator_username=operator.username if operator else None,
                decision=normalized_decision,
                reason_codes=parse_reason_codes(annotation.reason_codes),
                other_reason_text=annotation.other_reason_text,
                notes=annotation.notes,
                record_text=case.record_text,
                agent_a_output=case.agent_a_output,
                agent_b_output=case.agent_b_output,
                display_a_source=case.display_a_source,
                display_b_source=case.display_b_source,
                created_at=annotation.created_at,
            )
        )
    return AnnotationListResponse(items=items, total=total, page=page, page_size=page_size)

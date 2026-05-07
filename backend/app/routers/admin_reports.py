import json
from datetime import date

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.deps import require_admin
from app.models.entities import Decision, User
from app.repositories.plans import get_plan_progress
from app.repositories.reports import annotation_detail_rows, annotation_query, get_case, get_plan, get_user, plan_total_cases
from app.schemas.report import AnnotationDetailItem, AnnotationListResponse, DistributionItem, PlanStatsResponse

router = APIRouter(prefix="/admin/plans", tags=["admin-reports"])

REASON_KEYS = ["NO_HIT_ERROR_RULE", "NO_MISSING_RULE", "NO_OVER_QC", "OTHER"]


def parse_reason_codes(raw: str) -> list[str]:
    try:
        value = json.loads(raw)
        if isinstance(value, list):
            return [str(item) for item in value]
    except json.JSONDecodeError:
        pass
    return [item.strip() for item in raw.split(",") if item.strip()]


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
    if not get_plan(db, plan_id):
        raise HTTPException(status_code=404, detail="PLAN_NOT_FOUND")

    scoped_query = annotation_query(
        db,
        plan_id=plan_id,
        operator_user_id=operator_user_id,
        decision=decision,
        start_date=start_date,
        end_date=end_date,
    )
    annotations = scoped_query.all()
    total_cases = plan_total_cases(db, plan_id)
    annotated_cases = len({item.case_id for item in annotations}) if any([operator_user_id, decision, start_date, end_date]) else get_plan_progress(db, plan_id)[1]
    pending_cases = max(total_cases - annotated_cases, 0)
    decision_distribution = {item.value: 0 for item in Decision}
    reason_counts = {key: 0 for key in REASON_KEYS}
    for item in annotations:
        if item.decision in decision_distribution:
            decision_distribution[item.decision] += 1
        for reason in parse_reason_codes(item.reason_codes):
            reason_counts[reason if reason in reason_counts else "OTHER"] += 1

    return PlanStatsResponse(
        plan_id=plan_id,
        total_cases=total_cases,
        annotated_cases=annotated_cases,
        pending_cases=pending_cases,
        completion_rate=round(annotated_cases / total_cases, 4) if total_cases else 0,
        decision_distribution=decision_distribution,
        reason_distribution=[DistributionItem(key=key, count=count) for key, count in reason_counts.items()],
    )


@router.get("/{plan_id}/annotations", response_model=AnnotationListResponse)
def plan_annotations(
    plan_id: int,
    operator_user_id: int | None = None,
    decision: str | None = None,
    start_date: date | None = None,
    end_date: date | None = None,
    page: int = 1,
    page_size: int = 20,
    _: User = Depends(require_admin),
    db: Session = Depends(get_db),
) -> AnnotationListResponse:
    if not get_plan(db, plan_id):
        raise HTTPException(status_code=404, detail="PLAN_NOT_FOUND")

    page = max(page, 1)
    page_size = min(max(page_size, 1), 100)
    query = annotation_query(
        db,
        plan_id=plan_id,
        operator_user_id=operator_user_id,
        decision=decision,
        start_date=start_date,
        end_date=end_date,
    )
    total = query.count()
    items: list[AnnotationDetailItem] = []
    for annotation in annotation_detail_rows(query, page, page_size):
        case = get_case(db, annotation.case_id)
        operator = get_user(db, annotation.operator_user_id)
        if not case:
            continue
        items.append(
            AnnotationDetailItem(
                id=annotation.id,
                case_id=annotation.case_id,
                hospitalization_no=case.hospitalization_no,
                operator_user_id=annotation.operator_user_id,
                operator_username=operator.username if operator else None,
                decision=annotation.decision,
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

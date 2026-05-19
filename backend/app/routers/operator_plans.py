from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.deps import require_operator
from app.models.entities import User
from app.schemas.operator import (
    AnnotationCreatedResponse,
    AnnotationSubmitRequest,
    OperatorPlanListResponse,
    OperatorTaskPayload,
)
from app.services.operator_tasks import list_assigned_plans, next_task as get_next_task, submit_annotation

router = APIRouter(prefix="/operator/plans", tags=["operator-plans"])


@router.get("", response_model=OperatorPlanListResponse)
def list_plans(
    page: int = 1,
    page_size: int = 20,
    user: User = Depends(require_operator),
    db: Session = Depends(get_db),
) -> OperatorPlanListResponse:
    page = max(page, 1)
    page_size = min(max(page_size, 1), 100)
    items, total = list_assigned_plans(db, user.id, page, page_size)
    return OperatorPlanListResponse(items=items, total=total, page=page, page_size=page_size)


@router.get("/{plan_id}/tasks/next", response_model=OperatorTaskPayload | None, response_model_exclude_none=True)
def next_task(plan_id: int, user: User = Depends(require_operator), db: Session = Depends(get_db)) -> OperatorTaskPayload | None:
    return get_next_task(db, plan_id, user.id)


@router.post("/{plan_id}/tasks/{case_id}/annotation", response_model=AnnotationCreatedResponse, status_code=201)
def annotate_plan_task(
    plan_id: int,
    case_id: int,
    payload: AnnotationSubmitRequest,
    user: User = Depends(require_operator),
    db: Session = Depends(get_db),
) -> AnnotationCreatedResponse:
    return submit_annotation(db, case_id, payload, user, expected_plan_id=plan_id)

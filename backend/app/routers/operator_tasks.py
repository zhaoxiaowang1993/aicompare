from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.deps import require_operator
from app.models.entities import User
from app.schemas.task import AnnotationCreatedResponse, SubmitAnnotationRequest

router = APIRouter(prefix="/operator/tasks", tags=["operator-tasks"])


@router.get("/next")
def next_task(plan_id: int, _: User = Depends(require_operator), db: Session = Depends(get_db)) -> dict | None:
    # TODO: implement assignment check + persistent A/B mapping lookup.
    _ = db
    _ = plan_id
    return None


@router.post("/{case_id}/annotate", response_model=AnnotationCreatedResponse, status_code=201)
def annotate(case_id: int, payload: SubmitAnnotationRequest, user: User = Depends(require_operator), db: Session = Depends(get_db)) -> AnnotationCreatedResponse:
    # TODO: enforce one-submit constraint and plan ownership with DB checks.
    _ = db
    if "OTHER" in payload.reason_codes and not payload.other_reason_text:
        raise HTTPException(status_code=400, detail="VALIDATION_ERROR")

    return AnnotationCreatedResponse(
        annotation_id=0,
        case_id=case_id,
        operator_user_id=user.id,
        decision=payload.decision,
        reason_codes=payload.reason_codes,
        other_reason_text=payload.other_reason_text,
        notes=payload.notes,
        created_at=datetime.utcnow(),
    )

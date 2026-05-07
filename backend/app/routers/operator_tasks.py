import json

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.deps import require_operator
from app.models.entities import Annotation, CaseRecord, Plan, User
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
    if "OTHER" in payload.reason_codes and not payload.other_reason_text:
        raise HTTPException(status_code=400, detail="VALIDATION_ERROR")

    case = db.query(CaseRecord).filter(CaseRecord.id == case_id).first()
    if not case:
        raise HTTPException(status_code=404, detail="CASE_NOT_FOUND")
    plan = db.query(Plan).filter(Plan.id == case.plan_id).first()
    if not plan:
        raise HTTPException(status_code=404, detail="PLAN_NOT_FOUND")
    if plan.status == "closed":
        raise HTTPException(status_code=409, detail="PLAN_CLOSED")
    if plan.owner_user_id != user.id:
        raise HTTPException(status_code=403, detail="FORBIDDEN")

    annotation = Annotation(
        plan_id=case.plan_id,
        case_id=case.id,
        operator_user_id=user.id,
        decision=payload.decision,
        reason_codes=json.dumps(payload.reason_codes, ensure_ascii=False),
        other_reason_text=payload.other_reason_text,
        notes=payload.notes,
    )
    db.add(annotation)
    try:
        db.commit()
    except IntegrityError as exc:
        db.rollback()
        raise HTTPException(status_code=409, detail="ANNOTATION_CONFLICT") from exc
    db.refresh(annotation)
    return AnnotationCreatedResponse(
        annotation_id=annotation.id,
        case_id=case_id,
        operator_user_id=user.id,
        decision=payload.decision,
        reason_codes=payload.reason_codes,
        other_reason_text=payload.other_reason_text,
        notes=payload.notes,
        created_at=annotation.created_at,
    )

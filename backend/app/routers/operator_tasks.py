from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.deps import require_operator
from app.models.entities import User
from app.schemas.operator import AnnotationCreatedResponse, AnnotationSubmitRequest, ManualAnnotationCreatedResponse, ManualAnnotationSubmitRequest
from app.services.operator_tasks import submit_annotation, submit_manual_annotation

router = APIRouter(prefix="/operator/tasks", tags=["operator-tasks"])


@router.post("/{case_id}/annotate", response_model=AnnotationCreatedResponse, status_code=201)
def annotate(
    case_id: int,
    payload: AnnotationSubmitRequest,
    user: User = Depends(require_operator),
    db: Session = Depends(get_db),
) -> AnnotationCreatedResponse:
    return submit_annotation(db, case_id, payload, user)


@router.post("/{case_id}/manual-annotate", response_model=ManualAnnotationCreatedResponse, status_code=201)
def manual_annotate(
    case_id: int,
    payload: ManualAnnotationSubmitRequest,
    user: User = Depends(require_operator),
    db: Session = Depends(get_db),
) -> ManualAnnotationCreatedResponse:
    return submit_manual_annotation(db, case_id, payload, user)

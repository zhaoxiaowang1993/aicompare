from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.deps import require_admin
from app.models.entities import Plan, User
from app.repositories.plans import get_active_operator, get_operator_options, get_plan, get_plan_progress, list_plans as query_plans
from app.schemas.plan import OperatorOption, PlanCreateRequest, PlanDetail, PlanItem, PlanListResponse, PlanPatchRequest

router = APIRouter(prefix="/admin/plans", tags=["admin-plans"])


VALID_TRANSITIONS = {
    "active": {"closed"},
    "closed": {"active"},
}


def serialize_plan(db: Session, plan: Plan) -> PlanDetail:
    total_cases, annotated_cases = get_plan_progress(db, plan.id)
    owner = db.query(User).filter(User.id == plan.owner_user_id).first()
    pending_cases = max(total_cases - annotated_cases, 0)
    return PlanDetail(
        id=plan.id,
        name=plan.name,
        description=plan.description,
        owner_user_id=plan.owner_user_id,
        owner_username=owner.username if owner else None,
        status=plan.status,
        total_cases=total_cases,
        annotated_cases=annotated_cases,
        pending_cases=pending_cases,
        completion_rate=round(annotated_cases / total_cases, 4) if total_cases else 0,
        created_at=plan.created_at,
        updated_at=plan.updated_at,
    )


@router.post("", response_model=PlanDetail, status_code=201)
def create_plan(_: PlanCreateRequest, __: User = Depends(require_admin)) -> PlanDetail:
    raise HTTPException(status_code=400, detail="PLAN_IMPORT_REQUIRED")


@router.get("", response_model=PlanListResponse)
def list_plans(
    status: str | None = None,
    owner_user_id: int | None = None,
    page: int = 1,
    page_size: int = 20,
    _: User = Depends(require_admin),
    db: Session = Depends(get_db),
) -> PlanListResponse:
    page = max(page, 1)
    page_size = min(max(page_size, 1), 100)
    plans, total = query_plans(db, status, owner_user_id, page, page_size)
    items = []
    for plan in plans:
        total_cases, annotated_cases = get_plan_progress(db, plan.id)
        owner = db.query(User).filter(User.id == plan.owner_user_id).first()
        items.append(
            PlanItem(
                id=plan.id,
                name=plan.name,
                description=plan.description,
                status=plan.status,
                owner_user_id=plan.owner_user_id,
                owner_username=owner.username if owner else None,
                total_cases=total_cases,
                annotated_cases=annotated_cases,
            )
        )
    return PlanListResponse(items=items, total=total, page=page, page_size=page_size)


@router.get("/owners", response_model=list[OperatorOption])
def list_operator_owners(_: User = Depends(require_admin), db: Session = Depends(get_db)) -> list[OperatorOption]:
    return [OperatorOption(id=user.id, username=user.username) for user in get_operator_options(db)]


@router.get("/{plan_id}", response_model=PlanDetail)
def get_plan_detail(plan_id: int, _: User = Depends(require_admin), db: Session = Depends(get_db)) -> PlanDetail:
    plan = get_plan(db, plan_id)
    if not plan:
        raise HTTPException(status_code=404, detail="PLAN_NOT_FOUND")
    return serialize_plan(db, plan)


@router.patch("/{plan_id}", response_model=PlanDetail)
def patch_plan(plan_id: int, payload: PlanPatchRequest, _: User = Depends(require_admin), db: Session = Depends(get_db)) -> PlanDetail:
    plan = get_plan(db, plan_id)
    if not plan:
        raise HTTPException(status_code=404, detail="PLAN_NOT_FOUND")

    patch_keys = payload.model_fields_set
    if plan.status == "closed" and patch_keys - {"name", "description", "status"}:
        raise HTTPException(status_code=409, detail="PLAN_STATUS_CONFLICT")

    if payload.name is not None:
        plan.name = payload.name
    if "description" in patch_keys:
        plan.description = payload.description
    if payload.owner_user_id is not None:
        if not get_active_operator(db, payload.owner_user_id):
            raise HTTPException(status_code=400, detail="VALIDATION_ERROR")
        plan.owner_user_id = payload.owner_user_id
    if payload.status is not None:
        if payload.status not in {"active", "closed"}:
            raise HTTPException(status_code=400, detail="VALIDATION_ERROR")
        if payload.status != plan.status and payload.status not in VALID_TRANSITIONS.get(plan.status, set()):
            raise HTTPException(status_code=409, detail="PLAN_STATUS_CONFLICT")
        plan.status = payload.status

    plan.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(plan)
    return serialize_plan(db, plan)

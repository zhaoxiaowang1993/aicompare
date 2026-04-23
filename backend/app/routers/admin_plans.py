from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, UploadFile
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.deps import require_admin
from app.models.entities import Plan, User
from app.schemas.plan import PlanCreateRequest, PlanDetail, PlanItem, PlanListResponse, PlanPatchRequest

router = APIRouter(prefix="/admin/plans", tags=["admin-plans"])


@router.post("", response_model=PlanDetail, status_code=201)
def create_plan(payload: PlanCreateRequest, user: User = Depends(require_admin), db: Session = Depends(get_db)) -> PlanDetail:
    owner = db.query(User).filter(User.id == payload.owner_user_id, User.role == "operator", User.is_active.is_(True)).first()
    if not owner:
        raise HTTPException(status_code=400, detail="VALIDATION_ERROR")

    plan = Plan(
        name=payload.name,
        description=payload.description,
        owner_user_id=payload.owner_user_id,
        status="draft",
        created_by=user.id,
    )
    db.add(plan)
    db.commit()
    db.refresh(plan)
    return PlanDetail(
        id=plan.id,
        name=plan.name,
        description=plan.description,
        owner_user_id=plan.owner_user_id,
        status=plan.status,
        created_at=plan.created_at,
    )


@router.get("", response_model=PlanListResponse)
def list_plans(
    status: str | None = None,
    owner_user_id: int | None = None,
    page: int = 1,
    page_size: int = 20,
    _: User = Depends(require_admin),
    db: Session = Depends(get_db),
) -> PlanListResponse:
    query = db.query(Plan)
    if status:
        query = query.filter(Plan.status == status)
    if owner_user_id:
        query = query.filter(Plan.owner_user_id == owner_user_id)

    total = query.count()
    plans = query.order_by(Plan.created_at.desc()).offset((page - 1) * page_size).limit(page_size).all()
    items = [
        PlanItem(
            id=plan.id,
            name=plan.name,
            status=plan.status,
            owner_user_id=plan.owner_user_id,
            total_cases=0,
            annotated_cases=0,
        )
        for plan in plans
    ]
    return PlanListResponse(items=items, total=total, page=page, page_size=page_size)


@router.patch("/{plan_id}", response_model=PlanDetail)
def patch_plan(plan_id: int, payload: PlanPatchRequest, _: User = Depends(require_admin), db: Session = Depends(get_db)) -> PlanDetail:
    plan = db.query(Plan).filter(Plan.id == plan_id).first()
    if not plan:
        raise HTTPException(status_code=404, detail="PLAN_NOT_FOUND")

    if payload.name is not None:
        plan.name = payload.name
    if payload.description is not None:
        plan.description = payload.description
    if payload.owner_user_id is not None:
        plan.owner_user_id = payload.owner_user_id
    if payload.status is not None:
        plan.status = payload.status

    plan.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(plan)
    return PlanDetail(
        id=plan.id,
        name=plan.name,
        description=plan.description,
        owner_user_id=plan.owner_user_id,
        status=plan.status,
        created_at=plan.created_at,
    )


@router.post("/{plan_id}/import-csv")
def import_csv(plan_id: int, file: UploadFile, _: User = Depends(require_admin), db: Session = Depends(get_db)) -> dict:
    plan = db.query(Plan).filter(Plan.id == plan_id).first()
    if not plan:
        raise HTTPException(status_code=404, detail="PLAN_NOT_FOUND")
    if plan.status == "closed":
        raise HTTPException(status_code=409, detail="PLAN_CLOSED")
    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="CSV_INVALID_TEMPLATE")

    # TODO: implement parser + clean + import summary + persistent A/B mapping.
    return {
        "plan_id": plan_id,
        "import_batch_id": datetime.utcnow().strftime("%Y%m%d_%H%M%S_stub"),
        "total_rows": 0,
        "success_rows": 0,
        "skipped_rows": 0,
        "failed_rows": 0,
        "errors": [],
    }


@router.get("/{plan_id}/stats")
def plan_stats(plan_id: int, _: User = Depends(require_admin), db: Session = Depends(get_db)) -> dict:
    if not db.query(Plan).filter(Plan.id == plan_id).first():
        raise HTTPException(status_code=404, detail="PLAN_NOT_FOUND")

    return {
        "plan_id": plan_id,
        "total_cases": 0,
        "annotated_cases": 0,
        "pending_cases": 0,
        "completion_rate": 0.0,
        "decision_distribution": {"A_BETTER": 0, "B_BETTER": 0, "BOTH_BAD": 0, "BOTH_GOOD": 0},
        "reason_distribution": [],
    }


@router.get("/{plan_id}/annotations")
def plan_annotations(plan_id: int, _: User = Depends(require_admin), db: Session = Depends(get_db)) -> dict:
    if not db.query(Plan).filter(Plan.id == plan_id).first():
        raise HTTPException(status_code=404, detail="PLAN_NOT_FOUND")
    return {"items": [], "total": 0, "page": 1, "page_size": 20}

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.deps import require_admin
from app.models.entities import Plan, PlanAnnotationType, User
from app.repositories.imports import add_case_record, find_case_by_hospitalization_no
from app.repositories.plans import get_active_operator, get_plan, get_plan_progress
from app.schemas.imports import ImportErrorItem, ImportSummary, PlanCreateWithImportResponse
from app.schemas.plan import PlanDetail
from app.services.csv_import import commit_import, new_import_batch_id, parse_csv, stable_display_mapping

router = APIRouter(prefix="/admin/plans", tags=["admin-import"])


def serialize_plan(db: Session, plan: Plan) -> PlanDetail:
    total_cases, annotated_cases = get_plan_progress(db, plan.id)
    owner = db.query(User).filter(User.id == plan.owner_user_id).first()
    pending_cases = max(total_cases - annotated_cases, 0)
    return PlanDetail(
        id=plan.id,
        name=plan.name,
        description=plan.description,
        annotation_type=plan.annotation_type,
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


def build_import_summary(db: Session, plan: Plan | None, rows, parse_errors, annotation_type: str | None = None, persist: bool = True) -> ImportSummary:
    import_batch_id = new_import_batch_id()
    errors = [
        ImportErrorItem(row_number=item.row_number, hospitalization_no=item.hospitalization_no, reason=item.reason)
        for item in parse_errors
    ]
    success_rows = 0
    skipped_rows = 0
    seen_in_upload: set[str] = set()
    effective_annotation_type = annotation_type or (plan.annotation_type if plan else PlanAnnotationType.COMPARISON.value)

    for row in rows:
        exists_in_plan = bool(plan and find_case_by_hospitalization_no(db, plan.id, row.hospitalization_no))
        if row.hospitalization_no in seen_in_upload or exists_in_plan:
            skipped_rows += 1
            errors.append(
                ImportErrorItem(row_number=row.row_number, hospitalization_no=row.hospitalization_no, reason="同计划住院号重复，已跳过")
            )
            continue
        seen_in_upload.add(row.hospitalization_no)
        display_a_source, display_b_source = (
            stable_display_mapping(row.hospitalization_no)
            if effective_annotation_type == PlanAnnotationType.COMPARISON.value
            else (None, None)
        )
        if persist:
            if not plan:
                raise HTTPException(status_code=400, detail="PLAN_IMPORT_REQUIRED")
            add_case_record(
                db,
                plan_id=plan.id,
                hospitalization_no=row.hospitalization_no,
                record_text=row.record_text,
                agent_a_output=row.agent_a_output,
                agent_b_output=row.agent_b_output,
                display_a_source=display_a_source,
                display_b_source=display_b_source,
                import_batch_id=import_batch_id,
            )
        success_rows += 1

    total_rows = len(rows) + len(parse_errors)
    return ImportSummary(
        plan_id=plan.id if plan else None,
        import_batch_id=import_batch_id,
        total_rows=total_rows,
        success_rows=success_rows,
        skipped_rows=skipped_rows,
        failed_rows=len(parse_errors),
        errors=errors,
    )


def validate_create_import_inputs(owner_user_id: int, annotation_type: str, file: UploadFile, db: Session) -> None:
    owner = get_active_operator(db, owner_user_id)
    if not owner:
        raise HTTPException(status_code=400, detail="VALIDATION_ERROR")
    if not file.filename or not file.filename.lower().endswith(".csv"):
        raise HTTPException(status_code=400, detail="CSV_INVALID_TEMPLATE")
    if annotation_type not in {PlanAnnotationType.COMPARISON.value, PlanAnnotationType.MANUAL.value}:
        raise HTTPException(status_code=400, detail="VALIDATION_ERROR")


def raise_create_import_error(summary: ImportSummary) -> None:
    raise HTTPException(status_code=400, detail={"code": "CSV_ROW_ERRORS", "import_summary": summary.model_dump()})


@router.post("/import-csv/validate", response_model=ImportSummary)
def validate_plan_import_csv(
    name: str = Form(...),
    owner_user_id: int = Form(...),
    annotation_type: str = Form(PlanAnnotationType.COMPARISON.value),
    description: str | None = Form(None),
    file: UploadFile = File(...),
    _: User = Depends(require_admin),
    db: Session = Depends(get_db),
) -> ImportSummary:
    del name, description
    validate_create_import_inputs(owner_user_id, annotation_type, file, db)
    rows, parse_errors = parse_csv(file.file.read(), annotation_type)
    return build_import_summary(db, None, rows, parse_errors, annotation_type=annotation_type, persist=False)


@router.post("/import-csv", response_model=PlanCreateWithImportResponse, status_code=201)
def create_plan_with_import(
    name: str = Form(...),
    owner_user_id: int = Form(...),
    annotation_type: str = Form(PlanAnnotationType.COMPARISON.value),
    description: str | None = Form(None),
    file: UploadFile = File(...),
    user: User = Depends(require_admin),
    db: Session = Depends(get_db),
) -> PlanCreateWithImportResponse:
    validate_create_import_inputs(owner_user_id, annotation_type, file, db)
    rows, parse_errors = parse_csv(file.file.read(), annotation_type)
    validation_summary = build_import_summary(db, None, rows, parse_errors, annotation_type=annotation_type, persist=False)
    if validation_summary.failed_rows > 0:
        raise_create_import_error(validation_summary)

    plan = Plan(
        name=name,
        description=description,
        owner_user_id=owner_user_id,
        annotation_type=annotation_type,
        status="active",
        created_by=user.id,
    )
    db.add(plan)
    db.flush()

    import_summary = build_import_summary(db, plan, rows, parse_errors)
    if import_summary.success_rows == 0:
        db.rollback()
        raise HTTPException(status_code=400, detail="CSV_NO_VALID_ROWS")

    commit_import(db)
    db.refresh(plan)
    return PlanCreateWithImportResponse(plan=serialize_plan(db, plan), import_summary=import_summary)


@router.post("/{plan_id}/import-csv", response_model=ImportSummary)
def import_csv(plan_id: int, file: UploadFile, _: User = Depends(require_admin), db: Session = Depends(get_db)) -> ImportSummary:
    plan = get_plan(db, plan_id)
    if not plan:
        raise HTTPException(status_code=404, detail="PLAN_NOT_FOUND")
    if plan.status == "closed":
        raise HTTPException(status_code=409, detail="PLAN_CLOSED")
    if not file.filename or not file.filename.lower().endswith(".csv"):
        raise HTTPException(status_code=400, detail="CSV_INVALID_TEMPLATE")

    rows, parse_errors = parse_csv(file.file.read(), plan.annotation_type)
    summary = build_import_summary(db, plan, rows, parse_errors)
    commit_import(db)
    return summary

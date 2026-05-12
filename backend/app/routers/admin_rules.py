from datetime import datetime

from fastapi import APIRouter, Depends, File, HTTPException, Query, Response, UploadFile
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.deps import require_admin
from app.models.entities import QualityRule, RuleCategory, User
from app.schemas.rule import RuleCreateRequest, RuleImportSummary, RuleItem, RuleListResponse, RulePatchRequest
from app.services.rule_import import parse_rule_csv

router = APIRouter(prefix="/admin/rules", tags=["admin-rules"])


def active_rules_query(db: Session):
    return db.query(QualityRule).filter(QualityRule.deleted_at.is_(None))


def serialize_rule(rule: QualityRule) -> RuleItem:
    return RuleItem.model_validate(rule)


@router.get("", response_model=RuleListResponse)
def list_rules(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    keyword: str | None = Query(None),
    category: RuleCategory | None = Query(None),
    _: User = Depends(require_admin),
    db: Session = Depends(get_db),
) -> RuleListResponse:
    query = active_rules_query(db)
    cleaned_keyword = keyword.strip() if keyword else None
    if cleaned_keyword:
        query = query.filter(QualityRule.content.contains(cleaned_keyword))
    if category:
        query = query.filter(QualityRule.category == category.value)

    total = query.count()
    rows = (
        query.order_by(QualityRule.updated_at.desc(), QualityRule.id.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
        .all()
    )
    return RuleListResponse(items=[serialize_rule(row) for row in rows], total=total, page=page, page_size=page_size)


@router.post("", response_model=RuleItem, status_code=201)
def create_rule(payload: RuleCreateRequest, user: User = Depends(require_admin), db: Session = Depends(get_db)) -> RuleItem:
    rule = QualityRule(
        category=payload.category.value,
        content=payload.content,
        score=payload.score,
        created_by=user.id,
    )
    db.add(rule)
    db.commit()
    db.refresh(rule)
    return serialize_rule(rule)


@router.get("/template.csv")
def download_template(_: User = Depends(require_admin)) -> Response:
    content = "规则分类,规则内容,分值\n入院病历,入院记录示例规则,2\n"
    return Response(
        content=content.encode("utf-8-sig"),
        media_type="text/csv; charset=utf-8",
        headers={"Content-Disposition": 'attachment; filename="quality-rules-template.csv"'},
    )


def failed_row_count(errors) -> int:
    return len({error.row_number for error in errors})


def build_import_summary(success_rows: int, failed_rows: int, total_rows: int, errors) -> RuleImportSummary:
    return RuleImportSummary(total_rows=total_rows, success_rows=success_rows, failed_rows=failed_rows, errors=errors)


@router.post("/validate-csv", response_model=RuleImportSummary)
def validate_rules_csv(file: UploadFile = File(...), _: User = Depends(require_admin)) -> RuleImportSummary:
    if not file.filename or not file.filename.lower().endswith(".csv"):
        raise HTTPException(status_code=400, detail="CSV_INVALID_TEMPLATE")

    rows, errors, total_rows = parse_rule_csv(file.file.read())
    return build_import_summary(success_rows=len(rows), failed_rows=failed_row_count(errors), total_rows=total_rows, errors=errors)


@router.post("/import-csv", response_model=RuleImportSummary)
def import_rules_csv(file: UploadFile = File(...), user: User = Depends(require_admin), db: Session = Depends(get_db)) -> RuleImportSummary:
    if not file.filename or not file.filename.lower().endswith(".csv"):
        raise HTTPException(status_code=400, detail="CSV_INVALID_TEMPLATE")

    rows, errors, total_rows = parse_rule_csv(file.file.read())
    if errors:
        return build_import_summary(success_rows=0, failed_rows=total_rows, total_rows=total_rows, errors=errors)

    for row in rows:
        db.add(
            QualityRule(
                category=row.category.value,
                content=row.content,
                score=row.score,
                created_by=user.id,
            )
        )
    db.commit()
    return build_import_summary(success_rows=len(rows), failed_rows=0, total_rows=total_rows, errors=[])


@router.patch("/{rule_id}", response_model=RuleItem)
def patch_rule(rule_id: int, payload: RulePatchRequest, _: User = Depends(require_admin), db: Session = Depends(get_db)) -> RuleItem:
    rule = active_rules_query(db).filter(QualityRule.id == rule_id).first()
    if not rule:
        raise HTTPException(status_code=404, detail="RULE_NOT_FOUND")

    if payload.category is not None:
        rule.category = payload.category.value
    if payload.content is not None:
        rule.content = payload.content
    if payload.score is not None:
        rule.score = payload.score

    db.commit()
    db.refresh(rule)
    return serialize_rule(rule)


@router.delete("/{rule_id}", status_code=204)
def delete_rule(rule_id: int, _: User = Depends(require_admin), db: Session = Depends(get_db)) -> Response:
    rule = active_rules_query(db).filter(QualityRule.id == rule_id).first()
    if not rule:
        raise HTTPException(status_code=404, detail="RULE_NOT_FOUND")

    rule.deleted_at = datetime.utcnow()
    db.commit()
    return Response(status_code=204)

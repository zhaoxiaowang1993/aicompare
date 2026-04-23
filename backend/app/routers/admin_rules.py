from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.deps import require_admin
from app.models.entities import Rule, User
from app.schemas.rule import RuleCreateRequest, RuleItem, RuleListResponse, RulePatchRequest

router = APIRouter(prefix="/admin/rules", tags=["admin-rules"])


@router.get("", response_model=RuleListResponse)
def list_rules(page: int = 1, page_size: int = 20, keyword: str | None = None, _: User = Depends(require_admin), db: Session = Depends(get_db)) -> RuleListResponse:
    query = db.query(Rule)
    if keyword:
        query = query.filter(Rule.name.contains(keyword))

    total = query.count()
    rows = query.order_by(Rule.id.desc()).offset((page - 1) * page_size).limit(page_size).all()
    items = [RuleItem(id=r.id, code=r.code, name=r.name, description=r.description, score=r.score, is_active=r.is_active) for r in rows]
    return RuleListResponse(items=items, total=total, page=page, page_size=page_size)


@router.post("", response_model=RuleItem, status_code=201)
def create_rule(payload: RuleCreateRequest, user: User = Depends(require_admin), db: Session = Depends(get_db)) -> RuleItem:
    exists = db.query(Rule).filter(Rule.code == payload.code).first()
    if exists:
        raise HTTPException(status_code=409, detail="RULE_CODE_ALREADY_EXISTS")

    rule = Rule(
        code=payload.code,
        name=payload.name,
        description=payload.description,
        score=payload.score,
        is_active=payload.is_active,
        created_by=user.id,
    )
    db.add(rule)
    db.commit()
    db.refresh(rule)
    return RuleItem(id=rule.id, code=rule.code, name=rule.name, description=rule.description, score=rule.score, is_active=rule.is_active)


@router.patch("/{rule_id}", response_model=RuleItem)
def patch_rule(rule_id: int, payload: RulePatchRequest, _: User = Depends(require_admin), db: Session = Depends(get_db)) -> RuleItem:
    rule = db.query(Rule).filter(Rule.id == rule_id).first()
    if not rule:
        raise HTTPException(status_code=404, detail="RULE_NOT_FOUND")

    if payload.name is not None:
        rule.name = payload.name
    if payload.description is not None:
        rule.description = payload.description
    if payload.score is not None:
        rule.score = payload.score
    if payload.is_active is not None:
        rule.is_active = payload.is_active

    db.commit()
    db.refresh(rule)
    return RuleItem(id=rule.id, code=rule.code, name=rule.name, description=rule.description, score=rule.score, is_active=rule.is_active)

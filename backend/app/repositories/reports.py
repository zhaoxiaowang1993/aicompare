from datetime import date, datetime, time
from zoneinfo import ZoneInfo

from sqlalchemy import func
from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.entities import Annotation, CaseRecord, Plan, User

LOCAL_TZ = ZoneInfo(settings.app_timezone)


def local_date_to_utc_naive(value: date, end_of_day: bool = False) -> datetime:
    local_time = time.max if end_of_day else time.min
    local_dt = datetime.combine(value, local_time, LOCAL_TZ)
    return local_dt.astimezone(ZoneInfo("UTC")).replace(tzinfo=None)


def annotation_query(
    db: Session,
    *,
    plan_id: int,
    operator_user_id: int | None = None,
    decision: str | None = None,
    start_date: date | None = None,
    end_date: date | None = None,
):
    query = db.query(Annotation).filter(Annotation.plan_id == plan_id)
    if operator_user_id:
        query = query.filter(Annotation.operator_user_id == operator_user_id)
    if decision:
        query = query.filter(Annotation.decision == decision)
    if start_date:
        query = query.filter(Annotation.created_at >= local_date_to_utc_naive(start_date))
    if end_date:
        query = query.filter(Annotation.created_at <= local_date_to_utc_naive(end_date, end_of_day=True))
    return query


def plan_total_cases(db: Session, plan_id: int) -> int:
    return int(db.query(func.count(CaseRecord.id)).filter(CaseRecord.plan_id == plan_id).scalar() or 0)


def annotation_detail_rows(query, page: int, page_size: int):
    return query.order_by(Annotation.created_at.desc()).offset((page - 1) * page_size).limit(page_size).all()


def get_case(db: Session, case_id: int) -> CaseRecord | None:
    return db.query(CaseRecord).filter(CaseRecord.id == case_id).first()


def get_user(db: Session, user_id: int) -> User | None:
    return db.query(User).filter(User.id == user_id).first()


def get_plan(db: Session, plan_id: int) -> Plan | None:
    return db.query(Plan).filter(Plan.id == plan_id).first()

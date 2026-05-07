from sqlalchemy.orm import Session

from app.models.entities import CaseRecord


def find_case_by_hospitalization_no(db: Session, plan_id: int, hospitalization_no: str) -> CaseRecord | None:
    return (
        db.query(CaseRecord)
        .filter(CaseRecord.plan_id == plan_id, CaseRecord.hospitalization_no == hospitalization_no)
        .first()
    )


def add_case_record(
    db: Session,
    *,
    plan_id: int,
    hospitalization_no: str,
    record_text: str,
    agent_a_output: str,
    agent_b_output: str,
    display_a_source: str,
    display_b_source: str,
    import_batch_id: str,
) -> CaseRecord:
    item = CaseRecord(
        plan_id=plan_id,
        hospitalization_no=hospitalization_no,
        record_text=record_text,
        agent_a_output=agent_a_output,
        agent_b_output=agent_b_output,
        display_a_source=display_a_source,
        display_b_source=display_b_source,
        import_batch_id=import_batch_id,
    )
    db.add(item)
    return item

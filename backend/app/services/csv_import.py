import csv
import io
from dataclasses import dataclass
from datetime import datetime
from uuid import uuid4

from fastapi import HTTPException
from sqlalchemy.orm import Session

REQUIRED_COLUMNS = ["住院号", "病历内容", "智能体A输出", "智能体B输出"]


@dataclass
class RowImportError:
    row_number: int
    hospitalization_no: str | None
    reason: str


@dataclass
class CleanRow:
    row_number: int
    hospitalization_no: str
    record_text: str
    agent_a_output: str
    agent_b_output: str


def clean_text(value: str | None) -> str:
    return " ".join((value or "").replace("\ufeff", "").split())


def parse_csv(content: bytes) -> tuple[list[CleanRow], list[RowImportError]]:
    if not content:
        raise HTTPException(status_code=400, detail="CSV_PARSE_ERROR")

    try:
        text = content.decode("utf-8-sig")
    except UnicodeDecodeError as exc:
        raise HTTPException(status_code=400, detail="CSV_PARSE_ERROR") from exc

    try:
        reader = csv.DictReader(io.StringIO(text))
    except csv.Error as exc:
        raise HTTPException(status_code=400, detail="CSV_PARSE_ERROR") from exc

    if reader.fieldnames != REQUIRED_COLUMNS:
        raise HTTPException(status_code=400, detail="CSV_INVALID_TEMPLATE")

    rows: list[CleanRow] = []
    errors: list[RowImportError] = []
    for row_number, row in enumerate(reader, start=2):
        hospitalization_no = clean_text(row.get("住院号"))
        record_text = clean_text(row.get("病历内容"))
        agent_a_output = clean_text(row.get("智能体A输出"))
        agent_b_output = clean_text(row.get("智能体B输出"))
        missing = [
            label
            for label, value in (
                ("住院号", hospitalization_no),
                ("病历内容", record_text),
                ("智能体A输出", agent_a_output),
                ("智能体B输出", agent_b_output),
            )
            if not value
        ]
        if missing:
            errors.append(RowImportError(row_number=row_number, hospitalization_no=hospitalization_no or None, reason=f"缺少字段: {','.join(missing)}"))
            continue
        rows.append(
            CleanRow(
                row_number=row_number,
                hospitalization_no=hospitalization_no,
                record_text=record_text,
                agent_a_output=agent_a_output,
                agent_b_output=agent_b_output,
            )
        )
    return rows, errors


def new_import_batch_id() -> str:
    return f"{datetime.utcnow().strftime('%Y%m%d%H%M%S')}_{uuid4().hex[:8]}"


def stable_display_mapping(hospitalization_no: str) -> tuple[str, str]:
    if sum(hospitalization_no.encode("utf-8")) % 2 == 0:
        return "agent_a_output", "agent_b_output"
    return "agent_b_output", "agent_a_output"


def commit_import(db: Session) -> None:
    db.commit()

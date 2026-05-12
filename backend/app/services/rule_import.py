import csv
import io
from dataclasses import dataclass

from fastapi import HTTPException

from app.models.entities import RuleCategory
from app.schemas.rule import RuleImportRowError

ENGLISH_COLUMNS = ["category", "content", "score"]
CHINESE_COLUMNS = ["规则分类", "规则内容", "分值"]
COLUMN_ALIASES = {
    "规则分类": "category",
    "规则内容": "content",
    "分值": "score",
}
CATEGORY_ALIASES = {
    "入院病历": RuleCategory.ADMISSION_RECORD,
    "首次病程记录": RuleCategory.FIRST_COURSE_RECORD,
    "上级医师查房记录": RuleCategory.SUPERIOR_PHYSICIAN_ROUND,
    "日常病程": RuleCategory.DAILY_COURSE_RECORD,
    "出院记录": RuleCategory.DISCHARGE_RECORD,
}


@dataclass
class CleanRuleRow:
    row_number: int
    category: RuleCategory
    content: str
    score: str


def clean_text(value: str | None) -> str:
    return (value or "").replace("\ufeff", "").strip()


def canonical_field(field: str) -> str:
    return COLUMN_ALIASES.get(field, field)


def canonical_category(value: str) -> RuleCategory | None:
    if value in CATEGORY_ALIASES:
        return CATEGORY_ALIASES[value]
    try:
        return RuleCategory(value)
    except ValueError:
        return None


def parse_rule_csv(content: bytes) -> tuple[list[CleanRuleRow], list[RuleImportRowError], int]:
    if not content:
        raise HTTPException(status_code=400, detail="CSV_PARSE_ERROR")

    try:
        text = content.decode("utf-8-sig")
    except UnicodeDecodeError as exc:
        raise HTTPException(status_code=400, detail="CSV_PARSE_ERROR") from exc

    reader = csv.DictReader(io.StringIO(text))
    if reader.fieldnames not in (ENGLISH_COLUMNS, CHINESE_COLUMNS):
        raise HTTPException(status_code=400, detail="CSV_INVALID_TEMPLATE")

    rows: list[CleanRuleRow] = []
    errors: list[RuleImportRowError] = []
    total_rows = 0

    for row_number, row in enumerate(reader, start=2):
        total_rows += 1
        normalized = {canonical_field(field): clean_text(value) for field, value in row.items()}
        category = normalized.get("category", "")
        content_value = normalized.get("content", "")
        score = normalized.get("score", "")
        row_errors: list[RuleImportRowError] = []

        for field, value in (("category", category), ("content", content_value), ("score", score)):
            if not value:
                row_errors.append(RuleImportRowError(row_number=row_number, field=field, reason="缺少必填项", raw_value=value or None))

        parsed_category = canonical_category(category) if category else None
        if category and not parsed_category:
            row_errors.append(RuleImportRowError(row_number=row_number, field="category", reason="规则分类不在枚举范围内", raw_value=category))

        if row_errors:
            errors.extend(row_errors)
            continue

        rows.append(CleanRuleRow(row_number=row_number, category=parsed_category, content=content_value, score=score))

    return rows, errors, total_rows

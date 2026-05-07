from pydantic import BaseModel

from app.schemas.plan import PlanDetail


class ImportErrorItem(BaseModel):
    row_number: int
    hospitalization_no: str | None = None
    reason: str


class ImportSummary(BaseModel):
    plan_id: int
    import_batch_id: str
    total_rows: int
    success_rows: int
    skipped_rows: int
    failed_rows: int
    errors: list[ImportErrorItem]


class PlanCreateWithImportResponse(BaseModel):
    plan: PlanDetail
    import_summary: ImportSummary

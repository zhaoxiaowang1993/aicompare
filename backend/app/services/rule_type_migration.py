from dataclasses import dataclass

from sqlalchemy import text
from sqlalchemy.orm import Session


@dataclass(frozen=True)
class AdmissionRecordMigrationResult:
    child_rules: int
    female_rules: int
    male_rules: int
    legacy_in_known_range: int
    legacy_outside_known_range: int
    manual_child_snapshots: int
    manual_female_snapshots: int
    manual_male_snapshots: int


def _table_exists(db: Session, table_name: str) -> bool:
    return (
        db.execute(
            text("SELECT name FROM sqlite_master WHERE type='table' AND name = :table_name"),
            {"table_name": table_name},
        ).scalar()
        is not None
    )


def _scalar_int(db: Session, statement: str, params: dict[str, object] | None = None) -> int:
    return int(db.execute(text(statement), params or {}).scalar() or 0)


def migrate_admission_record_rule_types(db: Session) -> AdmissionRecordMigrationResult:
    if not _table_exists(db, "quality_rules"):
        return AdmissionRecordMigrationResult(0, 0, 0, 0, 0, 0, 0, 0)

    db.execute(
        text(
            """
            UPDATE quality_rules
            SET category = 'admission_record_child'
            WHERE category = 'admission_record' AND id BETWEEN 1 AND 42
            """
        )
    )
    db.execute(
        text(
            """
            UPDATE quality_rules
            SET category = 'admission_record_female'
            WHERE category = 'admission_record' AND id BETWEEN 43 AND 95
            """
        )
    )
    db.execute(
        text(
            """
            UPDATE quality_rules
            SET category = 'admission_record_male'
            WHERE category = 'admission_record' AND id BETWEEN 96 AND 140
            """
        )
    )

    if _table_exists(db, "manual_annotation_entries"):
        db.execute(
            text(
                """
                UPDATE manual_annotation_entries
                SET quality_rule_category_snapshot = 'admission_record_child'
                WHERE quality_rule_category_snapshot = 'admission_record'
                  AND quality_rule_id BETWEEN 1 AND 42
                """
            )
        )
        db.execute(
            text(
                """
                UPDATE manual_annotation_entries
                SET quality_rule_category_snapshot = 'admission_record_female'
                WHERE quality_rule_category_snapshot = 'admission_record'
                  AND quality_rule_id BETWEEN 43 AND 95
                """
            )
        )
        db.execute(
            text(
                """
                UPDATE manual_annotation_entries
                SET quality_rule_category_snapshot = 'admission_record_male'
                WHERE quality_rule_category_snapshot = 'admission_record'
                  AND quality_rule_id BETWEEN 96 AND 140
                """
            )
        )

    db.commit()
    return validate_admission_record_rule_type_migration(db)


def validate_admission_record_rule_type_migration(db: Session) -> AdmissionRecordMigrationResult:
    if not _table_exists(db, "quality_rules"):
        return AdmissionRecordMigrationResult(0, 0, 0, 0, 0, 0, 0, 0)

    child_rules = _scalar_int(db, "SELECT COUNT(*) FROM quality_rules WHERE category = 'admission_record_child' AND id BETWEEN 1 AND 42")
    female_rules = _scalar_int(db, "SELECT COUNT(*) FROM quality_rules WHERE category = 'admission_record_female' AND id BETWEEN 43 AND 95")
    male_rules = _scalar_int(db, "SELECT COUNT(*) FROM quality_rules WHERE category = 'admission_record_male' AND id BETWEEN 96 AND 140")
    legacy_in_known_range = _scalar_int(
        db,
        "SELECT COUNT(*) FROM quality_rules WHERE category = 'admission_record' AND id BETWEEN 1 AND 140",
    )
    legacy_outside_known_range = _scalar_int(
        db,
        "SELECT COUNT(*) FROM quality_rules WHERE category = 'admission_record' AND (id < 1 OR id > 140)",
    )

    manual_child_snapshots = manual_female_snapshots = manual_male_snapshots = 0
    if _table_exists(db, "manual_annotation_entries"):
        manual_child_snapshots = _scalar_int(
            db,
            """
            SELECT COUNT(*) FROM manual_annotation_entries
            WHERE quality_rule_category_snapshot = 'admission_record_child'
              AND quality_rule_id BETWEEN 1 AND 42
            """,
        )
        manual_female_snapshots = _scalar_int(
            db,
            """
            SELECT COUNT(*) FROM manual_annotation_entries
            WHERE quality_rule_category_snapshot = 'admission_record_female'
              AND quality_rule_id BETWEEN 43 AND 95
            """,
        )
        manual_male_snapshots = _scalar_int(
            db,
            """
            SELECT COUNT(*) FROM manual_annotation_entries
            WHERE quality_rule_category_snapshot = 'admission_record_male'
              AND quality_rule_id BETWEEN 96 AND 140
            """,
        )

    return AdmissionRecordMigrationResult(
        child_rules=child_rules,
        female_rules=female_rules,
        male_rules=male_rules,
        legacy_in_known_range=legacy_in_known_range,
        legacy_outside_known_range=legacy_outside_known_range,
        manual_child_snapshots=manual_child_snapshots,
        manual_female_snapshots=manual_female_snapshots,
        manual_male_snapshots=manual_male_snapshots,
    )

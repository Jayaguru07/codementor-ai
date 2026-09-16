from typing import List
from sqlalchemy.orm import Session
from app.models.database_models import AnalysisRecord
from app.models.schemas import AnalyzeResponse

def create_analysis_record(
    db: Session,
    language: str,
    code: str,
    response: AnalyzeResponse
) -> AnalysisRecord:
    record = AnalysisRecord(
        language=language,
        code=code,
        success=response.success,
        error_type=response.error_type,
        error_message=response.error_message,
        line=response.line,
        explanation=response.explanation,
        concept=response.concept,
        corrected_code=response.corrected_code,
        learning_tip=response.learning_tip
    )
    db.add(record)
    db.commit()
    db.refresh(record)
    return record

def get_analysis_history(db: Session, limit: int = 50) -> List[AnalysisRecord]:
    return (
        db.query(AnalysisRecord)
        .order_by(AnalysisRecord.timestamp.desc())
        .limit(limit)
        .all()
    )

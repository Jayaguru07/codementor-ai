from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database.database import get_db
from app.database.crud import get_analysis_history
from app.models.schemas import HistoryResponse, HistoryItem

router = APIRouter(prefix="/api", tags=["History"])

@router.get("/history", response_model=HistoryResponse)
def read_history(limit: int = 50, db: Session = Depends(get_db)):
    """
    Retrieves previous student code analysis records from SQLite database.
    """
    records = get_analysis_history(db=db, limit=limit)
    items = []
    for r in records:
        items.append(
            HistoryItem(
                id=r.id,
                timestamp=r.timestamp.isoformat(),
                language=r.language,
                code=r.code,
                success=r.success,
                error_type=r.error_type,
                error_message=r.error_message,
                line=r.line,
                explanation=r.explanation,
                concept=r.concept,
                corrected_code=r.corrected_code,
                learning_tip=r.learning_tip
            )
        )
    return HistoryResponse(total=len(items), items=items)

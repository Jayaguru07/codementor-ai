from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.database import get_db
from app.database.crud import create_analysis_record
from app.models.schemas import AnalyzeRequest, AnalyzeResponse
from app.services.analyzer import analyzer_service

router = APIRouter(prefix="/api", tags=["Analysis"])

@router.post("/analyze", response_model=AnalyzeResponse)
async def analyze_code(payload: AnalyzeRequest, db: Session = Depends(get_db)):
    """
    Analyzes code snippet, executes Python in a subprocess sandbox,
    detects syntax or runtime errors, retrieves RAG concept, calls LLM explanation service,
    and logs analysis result into SQLite history database.
    """
    try:
        response = await analyzer_service.analyze(
            language=payload.language,
            code=payload.code
        )
        
        # Save record to SQLite DB
        try:
            create_analysis_record(
                db=db,
                language=payload.language,
                code=payload.code,
                response=response
            )
        except Exception:
            pass  # DB error should not crash API response to student

        return response
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"An unexpected internal error occurred during analysis: {str(e)}"
        )

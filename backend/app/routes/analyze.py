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
    Analyzes code snippet as text, checks syntax statically via AST,
    retrieves relevant knowledge concepts from FAISS vector store,
    calls Cloud LLM service, and logs analysis result into SQLite database.
    Student code is NEVER executed.
    """
    try:
        response = await analyzer_service.analyze(
            language=payload.language,
            code=payload.code,
            error_message=payload.error_message
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

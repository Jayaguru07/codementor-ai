from typing import Optional, List
from pydantic import BaseModel, Field

class SourceItemSchema(BaseModel):
    source: str = Field(..., description="File path of the knowledge document")
    score: float = Field(..., description="Cosine similarity score")

class AnalyzeRequest(BaseModel):
    language: str = Field(..., example="python", description="Programming language of the code snippet")
    code: str = Field(..., example="print(x)", description="Source code to analyze")
    error_message: Optional[str] = Field(None, example="IndexError: list index out of range", description="Optional error message or description")

class AnalyzeResponse(BaseModel):
    success: bool = Field(..., description="True if code executed cleanly, False if an error occurred")
    error_type: Optional[str] = Field(None, example="NameError", description="Name of detected runtime or syntax error")
    error_message: Optional[str] = Field(None, example="name 'x' is not defined", description="Detailed error description")
    line: Optional[int] = Field(None, example=1, description="Line number where the error occurred")
    explanation: str = Field(..., description="Student-friendly explanation of the issue or code behavior")
    cause: Optional[str] = Field(None, description="The root cause of the error in the student's specific code")
    concept: Optional[str] = Field(None, example="Variables", description="Primary programming concept related to the error")
    corrected_code: Optional[str] = Field(None, description="Suggested bug-free version of the student code")
    learning_tip: Optional[str] = Field(None, description="Actionable tip to reinforce understanding")
    practice_question: Optional[str] = Field(None, description="Targeted practice question to reinforce understanding")
    sources: List[SourceItemSchema] = Field(default_factory=list, description="Knowledge base sources retrieved by RAG")
    stdout: Optional[str] = Field(None, description="Captured standard output if code executed")
    stderr: Optional[str] = Field(None, description="Captured standard error output")

class HistoryItem(BaseModel):
    id: int
    timestamp: str
    language: str
    code: str
    success: bool
    error_type: Optional[str] = None
    error_message: Optional[str] = None
    line: Optional[int] = None
    explanation: str
    concept: Optional[str] = None
    corrected_code: Optional[str] = None
    learning_tip: Optional[str] = None

    class Config:
        from_attributes = True

class HistoryResponse(BaseModel):
    total: int
    items: List[HistoryItem]

class HealthResponse(BaseModel):
    status: str = Field(..., example="healthy")

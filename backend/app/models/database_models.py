import datetime
from sqlalchemy import Column, Integer, String, Boolean, Text, DateTime
from app.database.database import Base

class AnalysisRecord(Base):
    __tablename__ = "analysis_history"

    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow, index=True)
    language = Column(String(50), nullable=False)
    code = Column(Text, nullable=False)
    success = Column(Boolean, nullable=False)
    error_type = Column(String(100), nullable=True)
    error_message = Column(Text, nullable=True)
    line = Column(Integer, nullable=True)
    explanation = Column(Text, nullable=False)
    concept = Column(String(100), nullable=True)
    corrected_code = Column(Text, nullable=True)
    learning_tip = Column(Text, nullable=True)

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database.database import engine, Base
from app.routes import health, analyze, history

# Initialize SQLite Database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.APP_NAME,
    description="AI-powered programming learning and debugging assistant backend.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS Configuration for Frontend (e.g. Next.js / React on http://localhost:3000)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Router Modules
app.include_router(health.router)
app.include_router(analyze.router)
app.include_router(history.router)

@app.get("/", tags=["Root"])
def read_root():
    """Root endpoint for basic backend connectivity check."""
    return {"message": "CodeMentor AI Backend is running"}

"""
FastAPI Server for DarGlobal & Wasalt AI Real Estate Advisory System.
"""

import json
import logging
import os
import sys
from pathlib import Path
from typing import Any, Dict, List, Optional

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field

# Ensure root directory is on python path
BASE_DIR = Path(__file__).resolve().parent.parent.parent
sys.path.insert(0, str(BASE_DIR))

from src.config import PORT, PROCESSED_DATA_PATH
from src.llm.chain import ask_real_estate_advisor, reset_session_history
from src.llm.openrouter import FREE_MODELS
from src.rag.retriever import get_vector_store

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("api_server")

app = FastAPI(
    title="DarGlobal & Wasalt Real Estate AI Advisor API",
    description="Intelligent RAG advisory service grounded on verified real estate datasets.",
    version="1.0.0",
)

# Enable CORS for development & cross-origin frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class ChatRequest(BaseModel):
    query: str = Field(..., description="User query or message")
    session_id: str = Field(default="default_session", description="Session identifier for memory")
    api_key: Optional[str] = Field(default=None, description="Optional OpenRouter API key override")
    model_name: Optional[str] = Field(default=None, description="Optional OpenRouter model override")


class ChatResponse(BaseModel):
    query: str
    answer: str
    citations: List[Dict[str, Any]]
    suggested_followups: List[str]
    model_used: str
    session_id: str


class ResetSessionRequest(BaseModel):
    session_id: str


@app.on_event("startup")
async def startup_event():
    """Preheats vector store on startup."""
    try:
        logger.info("Preheating vector store on server startup...")
        get_vector_store()
        logger.info("Server startup initialization completed.")
    except Exception as e:
        logger.warning("Vector store startup check: %s", e)


@app.get("/api/health")
async def health_check():
    """Health status and catalog readiness endpoint."""
    total_properties = 0
    if os.path.exists(PROCESSED_DATA_PATH):
        try:
            with open(PROCESSED_DATA_PATH, "r", encoding="utf-8") as f:
                data = json.load(f)
                total_properties = len(data)
        except Exception:
            pass

    return {
        "status": "online",
        "service": "DarGlobal & Wasalt AI Real Estate Advisor",
        "total_properties": total_properties,
        "vector_store_ready": True,
        "supported_models": FREE_MODELS,
    }


@app.get("/api/models")
async def get_models():
    """Returns available free LLM models for selection in the UI."""
    return {
        "default": "meta-llama/llama-3.1-8b-instruct",
        "models": FREE_MODELS,
    }


@app.get("/api/properties")
async def get_properties(
    platform: Optional[str] = None,
    country: Optional[str] = None,
    search: Optional[str] = None,
):
    """Returns list of scraped real estate properties with optional filtering."""
    if not os.path.exists(PROCESSED_DATA_PATH):
        raise HTTPException(status_code=404, detail="Properties dataset not found.")

    with open(PROCESSED_DATA_PATH, "r", encoding="utf-8") as f:
        records = json.load(f)

    filtered = records
    if platform:
        filtered = [r for r in filtered if r.get("source_platform", "").lower() == platform.lower()]
    if country:
        filtered = [r for r in filtered if country.lower() in r.get("country", "").lower()]
    if search:
        s = search.lower()
        filtered = [
            r for r in filtered
            if s in r.get("title", "").lower()
            or s in r.get("location", "").lower()
            or s in r.get("description", "").lower()
        ]

    return {
        "total": len(filtered),
        "properties": filtered,
    }


@app.post("/api/chat", response_model=ChatResponse)
async def chat_endpoint(payload: ChatRequest):
    """Processes chat queries against the RAG pipeline."""
    if not payload.query.strip():
        raise HTTPException(status_code=400, detail="Query cannot be empty.")

    try:
        response = ask_real_estate_advisor(
            query=payload.query,
            session_id=payload.session_id,
            api_key=payload.api_key,
            model_name=payload.model_name,
        )
        return response
    except Exception as e:
        logger.error("Chat endpoint error: %s", e)
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/reset-session")
async def reset_session(payload: ResetSessionRequest):
    """Resets conversational memory for a given session."""
    reset_session_history(payload.session_id)
    return {"status": "success", "message": f"Session {payload.session_id} reset."}


# Mount static React frontend build if present
DIST_DIR = BASE_DIR / "frontend" / "dist"
if DIST_DIR.exists():
    app.mount("/", StaticFiles(directory=str(DIST_DIR), html=True), name="static")
else:
    @app.get("/")
    async def index_fallback():
        return {
            "message": "DarGlobal & Wasalt Real Estate AI API is running.",
            "docs": "/docs",
            "health": "/api/health",
            "properties": "/api/properties",
        }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("src.api.app:app", host="0.0.0.0", port=PORT, reload=False)

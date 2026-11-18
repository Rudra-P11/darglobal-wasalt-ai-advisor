"""
Application Configuration and Constants.
"""

import os
from pathlib import Path
from dotenv import load_dotenv

# Load local .env if present
load_dotenv()

BASE_DIR = Path(__file__).resolve().parent.parent

# Data Paths
DATA_DIR = BASE_DIR / "data"
PROCESSED_DATA_PATH = DATA_DIR / "processed" / "properties.json"
CSV_DATA_PATH = DATA_DIR / "processed" / "properties.csv"
FAISS_INDEX_DIR = DATA_DIR / "faiss_index"

# Embedding Model
EMBEDDING_MODEL_NAME = "sentence-transformers/all-MiniLM-L6-v2"

# OpenRouter & LLM
OPENROUTER_BASE_URL = os.getenv("OPENROUTER_BASE_URL", "https://openrouter.ai/api/v1")
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY", "")

# Recommended Free Models on OpenRouter
DEFAULT_MODEL = os.getenv("DEFAULT_MODEL", "meta-llama/llama-3.1-8b-instruct")
FALLBACK_MODELS = [
    "meta-llama/llama-3.1-8b-instruct",
    "meta-llama/llama-3.2-3b-instruct",
    "meta-llama/llama-3.2-1b-instruct",
    "openrouter/free",
    "nvidia/nemotron-3.5-lightning:free",
    "nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free",
    "cohere/north-mini-code:free",
    "google/gemma-4-31b-it:free",
]

# Server Port (Hugging Face Spaces expects 7860)
PORT = int(os.getenv("PORT", 7860))
HOST = os.getenv("HOST", "0.0.0.0")

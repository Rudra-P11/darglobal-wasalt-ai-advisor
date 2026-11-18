# ==========================================
# Multi-Stage Dockerfile for DarGlobal & Wasalt Real Estate AI Advisor
# Optimized for Hugging Face Spaces (Docker Space) & Cloud Containers
# ==========================================

# ------------------------------------------
# Stage 1: Build Modern React Frontend
# ------------------------------------------
FROM node:20-slim AS frontend-builder
WORKDIR /build

COPY frontend/package*.json ./
RUN npm install

COPY frontend/ ./
RUN npm run build

# ------------------------------------------
# Stage 2: Production Python Runtime
# ------------------------------------------
FROM python:3.11-slim

# Create standard non-root user (UID 1000 for Hugging Face Spaces compatibility)
RUN useradd -m -u 1000 user
ENV HOME=/home/user \
    PATH=/home/user/.local/bin:$PATH \
    PYTHONUNBUFFERED=1 \
    PORT=7860

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    curl \
    git \
    && rm -rf /var/lib/apt/lists/*

# Install Python requirements
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Pre-download HuggingFace embedding weights to avoid runtime cold starts
RUN python -c "from sentence_transformers import SentenceTransformer; SentenceTransformer('sentence-transformers/all-MiniLM-L6-v2')"

# Copy application backend and datasets
COPY src/ ./src/
COPY scraper/ ./scraper/
COPY data/ ./data/

# Copy compiled React frontend distribution from Stage 1
COPY --from=frontend-builder /build/dist ./frontend/dist

# Ensure proper permissions for non-root user
RUN chown -R user:user /app /home/user

USER user

# Hugging Face Spaces default port
EXPOSE 7860

# Launch FastAPI ASGI server
CMD ["python", "-m", "uvicorn", "src.api.app:app", "--host", "0.0.0.0", "--port", "7860"]

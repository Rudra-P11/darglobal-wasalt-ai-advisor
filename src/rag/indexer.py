"""
Vector Index Construction Pipeline.
Loads scraped property records, formats them with full contextual headers,
chunks the content, embeds with HuggingFace all-MiniLM-L6-v2, and builds a FAISS index.
"""

import json
import logging
import os
import sys
from pathlib import Path
from typing import List

from langchain_core.documents import Document
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import FAISS
from langchain_community.embeddings import HuggingFaceEmbeddings

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent.parent))
from src.config import EMBEDDING_MODEL_NAME, FAISS_INDEX_DIR, PROCESSED_DATA_PATH

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("rag_indexer")


def get_embedding_model() -> HuggingFaceEmbeddings:
    """Returns the HuggingFace sentence-transformers embedding instance."""
    logger.info("Initializing HuggingFace embedding model: %s", EMBEDDING_MODEL_NAME)
    return HuggingFaceEmbeddings(
        model_name=EMBEDDING_MODEL_NAME,
        model_kwargs={"device": "cpu"},
        encode_kwargs={"normalize_embeddings": True},
    )


def load_property_documents() -> List[Document]:
    """Loads processed real estate records and transforms them into rich Documents."""
    if not os.path.exists(PROCESSED_DATA_PATH):
        raise FileNotFoundError(f"Processed dataset not found at {PROCESSED_DATA_PATH}. Please run scrapers first.")

    with open(PROCESSED_DATA_PATH, "r", encoding="utf-8") as f:
        records = json.load(f)

    docs = []
    for item in records:
        content = (
            f"Property / Project: {item.get('title', '')}\n"
            f"Platform / Source: {item.get('source_platform', '')}\n"
            f"Developer / Partner: {item.get('developer', '')} | Brand: {item.get('brand_partner', '')}\n"
            f"Property Type: {item.get('property_type', '')}\n"
            f"Country: {item.get('country', '')} | City: {item.get('city', '')} | Location: {item.get('location', '')}\n"
            f"Price: {item.get('price', '')} ({item.get('currency', '')})\n"
            f"Bedrooms: {item.get('bedrooms', 'N/A')} | Area: {item.get('area', 'N/A')}\n"
            f"Key Features & Amenities: {item.get('key_features', '')}\n"
            f"Official Source URL: {item.get('source_url', '')}\n\n"
            f"Detailed Overview:\n{item.get('description', '')}"
        )

        metadata = {
            "id": item.get("id", ""),
            "title": item.get("title", ""),
            "source_platform": item.get("source_platform", ""),
            "developer": item.get("developer", ""),
            "brand_partner": item.get("brand_partner", ""),
            "property_type": item.get("property_type", ""),
            "location": item.get("location", ""),
            "country": item.get("country", ""),
            "city": item.get("city", ""),
            "price": item.get("price", ""),
            "source_url": item.get("source_url", ""),
            "bedrooms": item.get("bedrooms", ""),
            "area": item.get("area", ""),
            "image_url": item.get("image_url", ""),
            "images": json.dumps(item.get("images", [])),
            "investment_highlights": json.dumps(item.get("investment_highlights", {})),
        }
        docs.append(Document(page_content=content, metadata=metadata))

    logger.info("Loaded %d property documents from %s", len(docs), PROCESSED_DATA_PATH)
    return docs


def build_and_save_index() -> FAISS:
    """Chunks documents, computes embeddings, and persists FAISS index to disk."""
    docs = load_property_documents()

    splitter = RecursiveCharacterTextSplitter(
        chunk_size=600,
        chunk_overlap=80,
        separators=["\n\n", "\n", ". ", " "],
    )
    chunked_docs = splitter.split_documents(docs)
    logger.info("Created %d text chunks from %d original documents", len(chunked_docs), len(docs))

    embeddings = get_embedding_model()
    logger.info("Embedding chunks and building FAISS vector store...")
    vector_store = FAISS.from_documents(chunked_docs, embeddings)

    os.makedirs(FAISS_INDEX_DIR, exist_ok=True)
    vector_store.save_local(str(FAISS_INDEX_DIR))
    logger.info("FAISS vector store successfully saved to %s", FAISS_INDEX_DIR)
    return vector_store


if __name__ == "__main__":
    build_and_save_index()
    print("FAISS Index construction complete!")

"""
Smart Hybrid Vector Store Retriever with Location-Aware Filtering & Reranking.
"""

import logging
import os
import sys
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

from langchain_core.documents import Document
from langchain_community.vectorstores import FAISS

sys.path.insert(0, str(Path(__file__).resolve().parent.parent.parent))
from src.config import FAISS_INDEX_DIR
from src.rag.indexer import get_embedding_model

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("rag_retriever")

_VECTOR_STORE = None

LOCATION_KEYWORDS = {
    "dubai": ["dubai", "uae", "united arab emirates", "business bay", "downtown dubai"],
    "oman": ["oman", "muscat", "yiti", "aida"],
    "riyadh": ["riyadh", "al-mahdiyah", "al-malqa", "al-narjis", "al-yasmin", "tuwaiq", "saudi"],
    "jeddah": ["jeddah", "corniche", "red sea", "obhur"],
    "spain": ["spain", "benahavís", "marbella", "costa del sol"],
    "london": ["london", "uk", "brompton", "kensington"],
    "qatar": ["qatar", "doha", "qetaifan", "lusail"],
    "saudi": ["saudi", "saudi arabia", "riyadh", "jeddah", "wasalt"],
}


def get_vector_store() -> FAISS:
    """Returns the singleton instance of the FAISS vector store."""
    global _VECTOR_STORE
    if _VECTOR_STORE is None:
        index_dir = str(FAISS_INDEX_DIR)
        if not os.path.exists(index_dir):
            raise FileNotFoundError(f"FAISS index directory {index_dir} not found. Build the index first.")

        embeddings = get_embedding_model()
        logger.info("Loading FAISS vector store from %s...", index_dir)
        _VECTOR_STORE = FAISS.load_local(
            index_dir,
            embeddings,
            allow_dangerous_deserialization=True,
        )
        logger.info("FAISS vector store loaded successfully.")
    return _VECTOR_STORE


def detect_target_locations(query: str) -> List[str]:
    """Detects target locations mentioned in user query."""
    q = query.lower()
    matched = []
    for loc_key, terms in LOCATION_KEYWORDS.items():
        if any(term in q for term in terms):
            matched.append(loc_key)
    return matched


def retrieve_context(query: str, top_k: int = 6) -> Tuple[str, List[Dict[str, Any]], List[Document]]:
    """
    Retrieves relevant documents with hybrid semantic search and location prioritization.
    Prevents geographic mismatch (e.g. returning Riyadh properties when the user asks for Dubai).
    """
    store = get_vector_store()
    target_locations = detect_target_locations(query)

    # Fetch larger pool of candidate chunks
    candidates = store.similarity_search(query, k=12)

    # Reranking heuristic: if specific locations are mentioned in the query,
    # strongly prioritize chunks belonging to those locations.
    scored_docs = []
    for doc in candidates:
        meta = doc.metadata
        doc_loc = f"{meta.get('city', '')} {meta.get('country', '')} {meta.get('location', '')}".lower()
        score = 0

        if target_locations:
            for loc in target_locations:
                for term in LOCATION_KEYWORDS.get(loc, []):
                    if term in doc_loc:
                        score += 10
                        break

        scored_docs.append((score, doc))

    # Sort by score descending (location matched first, then original similarity order)
    scored_docs.sort(key=lambda x: x[0], reverse=True)
    selected_docs = [doc for _, doc in scored_docs[:top_k]]

    context_blocks = []
    seen_urls = set()
    citations = []

    for i, doc in enumerate(selected_docs, 1):
        meta = doc.metadata
        url = meta.get("source_url", "")
        title = meta.get("title", f"Listing #{i}")

        context_blocks.append(
            f"--- Source [{i}]: {title} ({meta.get('source_platform', 'Unknown')}) ---\n"
            f"Location: {meta.get('location', 'N/A')}\n"
            f"Developer / Brand: {meta.get('developer', '')} | {meta.get('brand_partner', '')}\n"
            f"Type: {meta.get('property_type', '')} | Price: {meta.get('price', '')}\n"
            f"URL: {url}\n"
            f"{doc.page_content}\n"
        )

        if url and url not in seen_urls:
            seen_urls.add(url)
            raw_images = meta.get("images", "[]")
            raw_highlights = meta.get("investment_highlights", "{}")
            try:
                images_list = json.loads(raw_images) if isinstance(raw_images, str) else (raw_images or [])
            except Exception:
                images_list = []
            try:
                highlights_dict = json.loads(raw_highlights) if isinstance(raw_highlights, str) else (raw_highlights or {})
            except Exception:
                highlights_dict = {}

            citations.append({
                "id": meta.get("id", f"src_{i}"),
                "title": title,
                "platform": meta.get("source_platform", "Real Estate"),
                "developer": meta.get("developer", "DarGlobal / Wasalt"),
                "brand_partner": meta.get("brand_partner", ""),
                "property_type": meta.get("property_type", ""),
                "location": meta.get("location", ""),
                "price": meta.get("price", "Inquire for price"),
                "url": url,
                "bedrooms": meta.get("bedrooms", ""),
                "area": meta.get("area", ""),
                "image_url": meta.get("image_url", ""),
                "images": images_list,
                "investment_highlights": highlights_dict,
            })

    formatted_context = "\n\n".join(context_blocks)
    return formatted_context, citations, selected_docs

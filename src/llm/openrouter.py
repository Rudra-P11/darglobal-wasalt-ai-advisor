"""
OpenRouter Client and LLM Factory.
Supports Meta Llama 3 (via OpenRouter free tier) and graceful fallback synthesis.
"""

import logging
import os
from typing import Any, Dict, List, Optional
from langchain_openai import ChatOpenAI

logger = logging.getLogger("openrouter_client")

FREE_MODELS = [
    "meta-llama/llama-3.1-8b-instruct",
    "meta-llama/llama-3.2-3b-instruct",
    "meta-llama/llama-3.2-1b-instruct",
    "openrouter/free",
    "nvidia/nemotron-3.5-lightning:free",
    "nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free",
    "cohere/north-mini-code:free",
    "google/gemma-4-31b-it:free",
]


def create_openrouter_llm(
    api_key: Optional[str] = None,
    model_name: Optional[str] = None,
    temperature: float = 0.2,
    max_tokens: int = 1000,
) -> Optional[ChatOpenAI]:
    """
    Creates a LangChain ChatOpenAI instance configured for OpenRouter.
    Returns None if no API key is provided.
    """
    effective_key = api_key or os.getenv("OPENROUTER_API_KEY", "").strip()
    if not effective_key:
        logger.warning("No OPENROUTER_API_KEY configured.")
        return None

    selected_model = model_name or os.getenv("DEFAULT_MODEL", "meta-llama/llama-3.1-8b-instruct")
    logger.info("Initializing OpenRouter LLM with model: %s", selected_model)

    return ChatOpenAI(
        api_key=effective_key,
        base_url="https://openrouter.ai/api/v1",
        model=selected_model,
        temperature=temperature,
        max_tokens=max_tokens,
        default_headers={
            "HTTP-Referer": "https://huggingface.co/spaces",
            "X-Title": "DarGlobal & Wasalt Real Estate AI Advisor",
        },
    )


def synthesize_local_fallback(query: str, context: str, citations: List[Dict[str, Any]]) -> str:
    """
    High-quality context synthesizer used when an OpenRouter API key is not yet set.
    Provides direct, grounded answers from the retrieved RAG records with exact citations.
    """
    if not citations:
        return (
            "I could not locate matching listings in the current DarGlobal and Wasalt portfolios. "
            "Please try inquiring about our luxury projects in Dubai, Oman, Spain, Jeddah, or residential listings in Riyadh."
        )

    summary_lines = [
        "### Verified Real Estate Information\n",
        f"Based on the official data retrieved from **DarGlobal** and **Wasalt**, here is what is currently available for your inquiry:\n",
    ]

    for i, c in enumerate(citations[:3], 1):
        summary_lines.append(
            f"**{i}. [{c['title']}]({c['url']})**\n"
            f"- **Platform / Developer:** {c['platform']} ({c.get('developer', 'Official')})\n"
            f"- **Location:** {c['location']}\n"
            f"- **Price Guide:** {c['price']}\n"
            f"- **Property Type:** {c.get('property_type', 'Residential')}\n"
            f"- **Official Link:** [View on {c['platform']}]({c['url']})\n"
        )

    summary_lines.append(
        "\n> *Tip: To enable live conversational AI generation with Meta Llama 3 on OpenRouter, "
        "add your free `OPENROUTER_API_KEY` in the Settings modal or set it in your environment variables.*"
    )

    return "\n".join(summary_lines)

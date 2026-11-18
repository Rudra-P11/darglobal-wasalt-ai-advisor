"""
LangChain RAG Pipeline with Conversational Memory & Geographic Intelligence.
"""

import logging
import os
import sys
from pathlib import Path
from typing import Any, Dict, List, Optional
from dotenv import load_dotenv

load_dotenv()

from langchain_core.messages import AIMessage, HumanMessage, SystemMessage

sys.path.insert(0, str(Path(__file__).resolve().parent.parent.parent))
from src.llm.openrouter import create_openrouter_llm, synthesize_local_fallback
from src.rag.retriever import retrieve_context

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("rag_chain")

# In-memory session history store: session_id -> List[BaseMessage]
SESSION_HISTORIES: Dict[str, List[Any]] = {}

SYSTEM_PROMPT = """You are the Senior Real Estate Investment Advisor for DarGlobal and Wasalt.
You speak with elegance, authority, precision, and genuine advisory insight.

CRITICAL OPERATIONAL & INTEGRITY GUARDRAILS (STRICT COMPLIANCE MANDATORY):

1. STRICT DOMAIN BOUNDARY (NO NON-REAL-ESTATE TOPICS):
   - You are exclusively a luxury real estate and property investment advisor for DarGlobal and Wasalt.
   - Do NOT write software code (C++, Python, JS, etc.), do NOT write poems, songs, stories, recipes, or general school homework.
   - For any non-real-estate request, decline politely, stating that your expertise is strictly dedicated to luxury real estate advisory for DarGlobal and Wasalt.
   - NEVER preface legitimate real estate or budget answers with this disclaimer; only invoke it when a query is genuinely off-topic.

2. BUDGET & PRICE REALITY (STRICTLY NO HALLUCINATED PRICES):
   - DarGlobal developments (The Astera by Aston Martin, Tierra Viva by Lamborghini, AIDA Trump Villas, W Residences, Trump Tower) are ultra-luxury high-end properties ranging from several hundred thousand to several million dollars/AED/EUR.
   - Wasalt verified purchase properties (villas, residential floors, lands in Riyadh) range from 1,000,000 SAR to 4,000,000+ SAR (~$270,000 - $1,100,000+ USD).
   - Wasalt daily vacation chalets range around 1,000 - 3,000 SAR per night (~$270 - $800 USD/night).
   - If a user inquires about a budget under $100,000 USD (or under 350,000 SAR) for purchasing property (e.g. "budget under 10,000 USD" or "under 5,000"):
     * NEVER invent fictional properties or claim that DarGlobal, Dubai residences, AIDA Oman, or Tierra Viva Spain can be purchased for $5,000 - $10,000 USD! (That is completely hallucinated and false).
     * Inform the client professionally that property acquisitions across both DarGlobal's international portfolio and Wasalt's residential sales require a significantly higher capital threshold (starting from ~$260,000+ USD / 1M+ SAR for regional residences, and multi-million USD for branded villas).
     * Clarify that within a sub-$10,000 USD budget, only short-term daily vacation rentals (such as Wasalt chalets) are feasible within the portfolio, rather than property acquisitions.

3. STRICT GROUNDING ON RETRIEVED CONTEXT:
   - Ground all statements, specs, locations, and amenities strictly on the provided verified context.
   - If a requested property or feature is not in the context, do NOT invent fictional listings or secondary market estimates. Clarify what IS officially available in our portfolio.
   - Always cite official project titles as direct Markdown links using the canonical URLs from the context.
   - Address the user's specific location and property type directly. If a user asks for "Dubai villas", explain that DarGlobal's Dubai portfolio consists of waterfront residences ([Urban Oasis by Missoni], [W Residences]), and direct them to Oman ([AIDA Trump Villas]) or Spain ([Tierra Viva]) for signature villas.

PORTFOLIO KNOWLEDGE:
- **DarGlobal**: Premier international developer listed on the London Stock Exchange (LSE: DAR). Focuses on ultra-luxury branded residences:
  * Dubai & UAE: Branded residences & towers: W Residences Downtown Dubai, Urban Oasis by Missoni (Dubai Canal), The Astera by Aston Martin (Ras Al Khaimah), Trump International Hotel & Tower Dubai.
  * Oman (Muscat / AIDA): Oceanfront cliffside villas, Trump International Golf Villas, and 5-star hotel suites.
  * Spain (Benahavís, Costa Del Sol): Tierra Viva by Automobili Lamborghini (ultra-luxury hillside villas with panoramic sea views).
  * Saudi Arabia (Jeddah): Trump Tower Jeddah & Trump Plaza Jeddah.
- **Wasalt**: Saudi Arabia's leading property marketplace, licensed by REGA (General Real Estate Authority). Offers verified residential villas (Al-Mahdiyah, West Riyadh), apartments (Al-Malqa, Al-Yasmin), residential lands (Al-Narjis), commercial solutions, and daily chalets.
"""


def check_domain_guardrail(query: str) -> Optional[str]:
    """
    Detects blatant non-real-estate queries like coding, math, or creative writing
    and enforces strict domain boundary guardrails.
    """
    q = query.lower().strip()
    
    # Coding & programming triggers
    code_triggers = [
        "c++", "cpp", "hello world", "python script", "write code", "write a code",
        "javascript", "typescript", "write a function", "write a program",
        "binary search", "bubble sort", "fibonacci", "compile this", "debug this",
        "sql query", "html code", "css style", "leetcode", "print hello", "include <iostream>",
        "def main", "for loop", "while loop"
    ]
    re_exceptions = [
        "real estate", "property", "darglobal", "wasalt", "villa", "apartment",
        "housing", "developer", "realtor", "broker", "plot", "land", "dubai", "riyadh"
    ]
    
    if any(trigger in q for trigger in code_triggers):
        if not any(exc in q for exc in re_exceptions):
            return (
                "I am specifically dedicated to providing real estate advisory for **DarGlobal** luxury international developments and **Wasalt's** verified Saudi real estate marketplace.\n\n"
                "I cannot assist with programming, software code generation, or technical computer science inquiries.\n\n"
                "Please feel free to ask about our portfolio, including:\n"
                "- Luxury branded residences in **Dubai**, **Oman**, **Spain**, or **London**\n"
                "- Verified family villas and land plots across **Riyadh** and **Jeddah** on Wasalt\n"
                "- Investment yields, 0% tax frameworks, or UAE Golden Visa eligibility"
            )

    # Generic non-domain generation triggers
    creative_triggers = [
        "write a poem", "write a song", "write an essay on", "recipe for",
        "who is the president", "solve equation", "solve 2+", "tell me a joke",
        "write a story about"
    ]
    if any(trigger in q for trigger in creative_triggers):
        if not any(exc in q for exc in re_exceptions):
            return (
                "I am an AI real estate advisor focused exclusively on **DarGlobal** and **Wasalt** property portfolios.\n\n"
                "I am unable to assist with creative writing, recipes, or general knowledge topics outside of real estate investment.\n\n"
                "How may I assist you with luxury developments and verified property investments in the Middle East and Europe?"
            )

    return None


def get_session_history(session_id: str) -> List[Any]:
    """Retrieves or creates conversation history for a given session."""
    if session_id not in SESSION_HISTORIES:
        SESSION_HISTORIES[session_id] = []
    return SESSION_HISTORIES[session_id][-8:]


def reset_session_history(session_id: str) -> None:
    """Clears history for a given session."""
    if session_id in SESSION_HISTORIES:
        SESSION_HISTORIES[session_id] = []


def generate_suggested_followups(query: str, citations: List[Dict[str, Any]]) -> List[str]:
    """Generates dynamic, relevant follow-up suggestions based on retrieved topics."""
    query_lower = query.lower()

    if any(k in query_lower for k in ["dubai", "uae", "ras al khaimah", "astera", "w residences"]):
        return [
            "Tell me about The Astera by Aston Martin on Al Marjan Island.",
            "What branded interior amenities are at Urban Oasis by Missoni?",
            "What luxury villas does DarGlobal offer in nearby Oman?",
        ]
    elif any(k in query_lower for k in ["oman", "aida"]):
        return [
            "What golf and clifftop amenities are at AIDA Trump Villas?",
            "What starting prices and payment terms are available for AIDA Oman?",
            "How do DarGlobal's Oman properties compare to Spain's Tierra Viva?",
        ]
    elif any(k in query_lower for k in ["saudi", "riyadh", "wasalt", "villa"]):
        return [
            "What is the price range of 4 and 5 bedroom villas in Riyadh on Wasalt?",
            "Tell me about DarGlobal's Trump Tower project in Jeddah.",
            "Are Wasalt listings certified by REGA for mortgage financing?",
        ]
    elif any(k in query_lower for k in ["spain", "lamborghini", "tierra viva"]):
        return [
            "What makes the Lamborghini design at Tierra Viva Spain unique?",
            "Does buying at Tierra Viva qualify for Spain's Golden Visa?",
            "What are the nearest golf clubs and beaches to Benahavís?",
        ]
    else:
        return [
            "What flagship luxury developments does DarGlobal offer in Dubai and Oman?",
            "Show me top family villas for sale in Riyadh on Wasalt.",
            "How do DarGlobal and Wasalt collaborate on Saudi real estate?",
        ]


def ask_real_estate_advisor(
    query: str,
    session_id: str = "default_session",
    api_key: Optional[str] = None,
    model_name: Optional[str] = None,
) -> Dict[str, Any]:
    """
    Main RAG execution pipeline with strict domain guardrails.
    """
    logger.info("Processing query for session '%s': %s", session_id, query)

    # 0. Enforce domain boundary guardrails (reject coding, math, off-topic requests)
    declined_response = check_domain_guardrail(query)
    if declined_response:
        return {
            "query": query,
            "answer": declined_response,
            "citations": [],
            "suggested_followups": [
                "What luxury developments does DarGlobal offer in Dubai and Oman?",
                "What verified family villas are available in Riyadh on Wasalt?",
                "Tell me about The Astera by Aston Martin and Tierra Viva by Lamborghini.",
            ],
            "model_used": "Domain Guardrail",
            "session_id": session_id,
        }

    # 1. Retrieve RAG context & citations with location-aware reranking
    context_str, citations, _ = retrieve_context(query, top_k=6)

    # 2. Determine model and API key
    selected_model = model_name or os.getenv("DEFAULT_MODEL", "meta-llama/llama-3.1-8b-instruct")
    llm = create_openrouter_llm(api_key=api_key, model_name=selected_model)

    if llm is None:
        logger.info("Using local synthesis fallback (no API key configured).")
        answer = synthesize_local_fallback(query, context_str, citations)
        model_used = "Local Context Synthesizer"
    else:
        history = get_session_history(session_id)
        messages = [
            SystemMessage(content=f"{SYSTEM_PROMPT}\n\n=== VERIFIED REAL ESTATE CONTEXT ===\n{context_str}"),
        ]
        for msg in history:
            messages.append(msg)
        messages.append(HumanMessage(content=query))

        try:
            logger.info("Invoking OpenRouter LLM: %s", selected_model)
            response = llm.invoke(messages)
            answer = response.content
            model_used = selected_model

            # Update session history
            history.append(HumanMessage(content=query))
            history.append(AIMessage(content=answer))
            SESSION_HISTORIES[session_id] = history

        except Exception as e:
            logger.warning("Model %s failed with: %s. Attempting fallback to meta-llama/llama-3.1-8b-instruct...", selected_model, e)
            try:
                fallback_llm = create_openrouter_llm(api_key=api_key, model_name="meta-llama/llama-3.1-8b-instruct")
                if fallback_llm and selected_model != "meta-llama/llama-3.1-8b-instruct":
                    response = fallback_llm.invoke(messages)
                    answer = response.content
                    model_used = "meta-llama/llama-3.1-8b-instruct"
                    history.append(HumanMessage(content=query))
                    history.append(AIMessage(content=answer))
                    SESSION_HISTORIES[session_id] = history
                else:
                    raise e
            except Exception as e2:
                logger.error("All LLM attempts failed: %s. Using local synthesis.", e2)
                answer = (
                    f"{synthesize_local_fallback(query, context_str, citations)}\n\n"
                    f"> *(Notice: OpenRouter returned an error: `{str(e2)}`).* "
                )
                model_used = "Local Fallback (API Error)"

    followups = generate_suggested_followups(query, citations)

    return {
        "query": query,
        "answer": answer,
        "citations": citations,
        "suggested_followups": followups,
        "model_used": model_used,
        "session_id": session_id,
    }


if __name__ == "__main__":
    res = ask_real_estate_advisor("Tell me about Dubai villas")
    print("\nANSWER:\n", res["answer"])
    print("\nCITATIONS:", [c["title"] for c in res["citations"]])

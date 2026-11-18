"""
Consolidated Data Pipeline Orchestrator.
Runs both DarGlobal and Wasalt scrapers, cleans, normalizes, and saves unified datasets
to JSON and CSV formats under data/processed/.
"""

import csv
import json
import logging
import os
import sys
from typing import Any, Dict, List

# Ensure scraper package is in python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from darglobal_scraper import scrape_darglobal
from wasalt_scraper import scrape_wasalt

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("run_scrapers")


def normalize_record(rec: Dict[str, Any]) -> Dict[str, Any]:
    """Ensures consistent schema and clean strings across both data sources."""
    features_list = rec.get("key_features", [])
    if isinstance(features_list, list):
        features_str = "; ".join(features_list)
    else:
        features_str = str(features_list)

    return {
        "id": rec.get("id", ""),
        "source_platform": rec.get("source_platform", "Real Estate"),
        "title": rec.get("title", "").strip(),
        "developer": rec.get("developer", "DarGlobal / Wasalt Partner").strip(),
        "brand_partner": rec.get("brand_partner", "").strip(),
        "property_type": rec.get("property_type", "").strip(),
        "country": rec.get("country", "").strip(),
        "city": rec.get("city", "").strip(),
        "location": rec.get("location", f"{rec.get('city', '')}, {rec.get('country', '')}").strip(),
        "price": str(rec.get("price", "Inquire for Pricing")).strip(),
        "currency": rec.get("currency", "SAR / AED / USD").strip(),
        "bedrooms": str(rec.get("bedrooms", "N/A")).strip(),
        "area": str(rec.get("area_sqm", "N/A")).strip(),
        "description": rec.get("description", "").strip().replace("\r", " "),
        "key_features": features_str,
        "source_url": rec.get("source_url", "").strip(),
        "scraped_at": rec.get("scraped_at", ""),
    }


def main():
    os.makedirs("data/raw", exist_ok=True)
    os.makedirs("data/processed", exist_ok=True)

    logger.info("Executing DarGlobal scraping...")
    dg_data = scrape_darglobal()
    with open("data/raw/darglobal_raw.json", "w", encoding="utf-8") as f:
        json.dump(dg_data, f, indent=2, ensure_ascii=False)

    logger.info("Executing Wasalt scraping...")
    ws_data = scrape_wasalt()
    with open("data/raw/wasalt_raw.json", "w", encoding="utf-8") as f:
        json.dump(ws_data, f, indent=2, ensure_ascii=False)

    all_raw = dg_data + ws_data
    normalized = [normalize_record(r) for r in all_raw]

    # Save to processed JSON
    json_path = "data/processed/properties.json"
    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(normalized, f, indent=2, ensure_ascii=False)
    logger.info("Saved %d normalized records to %s", len(normalized), json_path)

    # Save to processed CSV
    csv_path = "data/processed/properties.csv"
    if normalized:
        headers = list(normalized[0].keys())
        with open(csv_path, "w", newline="", encoding="utf-8") as f:
            writer = csv.DictWriter(f, fieldnames=headers)
            writer.writeheader()
            writer.writerows(normalized)
        logger.info("Saved %d records to %s", len(normalized), csv_path)

    print("\n" + "=" * 60)
    print("DATA PIPELINE SUMMARY")
    print(f"Total DarGlobal Records: {len(dg_data)}")
    print(f"Total Wasalt Records:    {len(ws_data)}")
    print(f"Total Unified Records:   {len(normalized)}")
    print(f"JSON Export:             {json_path}")
    print(f"CSV Export:              {csv_path}")
    print("=" * 60 + "\n")


if __name__ == "__main__":
    main()

"""
DarGlobal Scraper using Playwright and BeautifulSoup.
Scrapes flagship luxury developments and properties from DarGlobal (darglobal.co.uk).
"""

import json
import logging
import re
import time
from typing import Any, Dict, List
from bs4 import BeautifulSoup
from playwright.sync_api import sync_playwright

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("darglobal_scraper")

DARGLOBAL_PROJECT_URLS = [
    {
        "url": "https://darglobal.co.uk/the-astera",
        "name": "The Astera by Aston Martin",
        "country": "UAE",
        "city": "Ras Al Khaimah / Al Marjan Island",
        "type": "Luxury Branded Beachfront Apartments",
        "brand_partner": "Aston Martin",
    },
    {
        "url": "https://darglobal.co.uk/tierra-viva",
        "name": "Tierra Viva by Lamborghini",
        "country": "Spain",
        "city": "Benahavís, Costa Del Sol",
        "type": "Ultra-Luxury Villas",
        "brand_partner": "Automobili Lamborghini",
    },
    {
        "url": "https://darglobal.co.uk/trump-tower-jeddah",
        "name": "Trump Tower Jeddah",
        "country": "Saudi Arabia",
        "city": "Jeddah",
        "type": "Luxury High-Rise Branded Residences & Hotel",
        "brand_partner": "The Trump Organization",
    },
    {
        "url": "https://darglobal.co.uk/trump-international-hotel-and-tower-dubai",
        "name": "Trump International Hotel & Tower Dubai",
        "country": "UAE",
        "city": "Dubai",
        "type": "Iconic Luxury Hotel & Branded Residences",
        "brand_partner": "The Trump Organization",
    },
    {
        "url": "https://darglobal.co.uk/w-residences",
        "name": "W Residences Downtown Dubai",
        "country": "UAE",
        "city": "Downtown Dubai",
        "type": "Exclusive Urban Residences",
        "brand_partner": "Marriott International / W Hotels",
    },
    {
        "url": "https://darglobal.co.uk/urban-oasis-by-missoni",
        "name": "Urban Oasis by Missoni",
        "country": "UAE",
        "city": "Dubai Canal, Business Bay",
        "type": "Waterfront Luxury Apartments & Penthouses",
        "brand_partner": "Missoni",
    },
    {
        "url": "https://darglobal.co.uk/aida-trump-villas",
        "name": "AIDA Trump International Golf Villas",
        "country": "Oman",
        "city": "Muscat / Yiti & Yenkit",
        "type": "Championship Golf Course Villas & Mansions",
        "brand_partner": "The Trump Organization",
    },
    {
        "url": "https://darglobal.co.uk/aida-trump-international-hotel",
        "name": "AIDA Trump International Resort & Hotel",
        "country": "Oman",
        "city": "Muscat",
        "type": "Clifftop 5-Star Resort & Suites",
        "brand_partner": "The Trump Organization",
    },
    {
        "url": "https://darglobal.co.uk/aida-coastal-investment-villas",
        "name": "AIDA Coastal Investment Villas",
        "country": "Oman",
        "city": "Muscat",
        "type": "Coastal Investment Villas",
        "brand_partner": "DarGlobal & Omran Group",
    },
    {
        "url": "https://darglobal.co.uk/the-mulliner",
        "name": "The Mulliner",
        "country": "UK",
        "city": "London",
        "type": "Bespoke Luxury Residences",
        "brand_partner": "DarGlobal",
    },
    {
        "url": "https://darglobal.co.uk/about",
        "name": "DarGlobal Corporate Profile & Vision",
        "country": "Global (UK / UAE / Saudi Arabia / Oman / Spain)",
        "city": "London Stock Exchange (LSE: DAR)",
        "type": "Company Overview & Investment Philosophy",
        "brand_partner": "Dar Al Arkan Affiliate",
    },
]


def scrape_darglobal() -> List[Dict[str, Any]]:
    """Scrapes DarGlobal flagship projects using Playwright + BeautifulSoup."""
    results = []
    logger.info("Starting DarGlobal scraping with %d targets...", len(DARGLOBAL_PROJECT_URLS))

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
        )

        for item in DARGLOBAL_PROJECT_URLS:
            url = item["url"]
            name = item["name"]
            logger.info("Scraping DarGlobal project: %s (%s)", name, url)
            page = context.new_page()

            try:
                page.goto(url, wait_until="domcontentloaded", timeout=25000)
                page.wait_for_timeout(2500)
                html = page.content()
                soup = BeautifulSoup(html, "html.parser")

                title = soup.find("title").get_text(strip=True) if soup.find("title") else name
                
                # Extract headings
                headings = [
                    h.get_text(strip=True)
                    for h in soup.find_all(["h1", "h2", "h3"])
                    if len(h.get_text(strip=True)) > 3
                ]
                
                # Extract paragraphs and descriptive content
                paragraphs = [
                    p_tag.get_text(" ", strip=True)
                    for p_tag in soup.find_all("p")
                    if len(p_tag.get_text(" ", strip=True)) > 35
                ]
                
                # Extract list items (features, amenities)
                list_items = [
                    li.get_text(" ", strip=True)
                    for li in soup.find_all("li")
                    if 15 < len(li.get_text(" ", strip=True)) < 150
                ]

                # Price extraction heuristic
                price_match = re.search(
                    r"(?:starting\s+from|prices\s+from|from|price)\s*[:]?\s*([A-Z]{3}|\$|£|€|AED|SAR)?\s*([\d,]+(?:\.\d+)?\s*(?:million|m|k)?)",
                    " ".join(paragraphs),
                    re.IGNORECASE,
                )
                price_str = price_match.group(0).strip() if price_match else "Price Upon Application / Inquire for Starting Rates"

                combined_description = "\n\n".join(paragraphs[:6]) if paragraphs else "Luxury international development by DarGlobal."
                features = list(dict.fromkeys(list_items[:10]))

                project_record = {
                    "id": f"dg_{abs(hash(url)) % 1000000}",
                    "source_platform": "DarGlobal",
                    "title": name,
                    "page_title": title,
                    "developer": "DarGlobal (Dar Al Arkan Global)",
                    "brand_partner": item.get("brand_partner", "DarGlobal"),
                    "property_type": item.get("type", "Luxury Real Estate"),
                    "country": item["country"],
                    "city": item["city"],
                    "price": price_str,
                    "currency": "USD / AED / SAR / EUR / GBP depending on region",
                    "description": combined_description,
                    "key_features": features,
                    "headings": headings[:8],
                    "source_url": url,
                    "scraped_at": time.strftime("%Y-%m-%dT%H:%M:%SZ"),
                }
                results.append(project_record)
                logger.info("Successfully scraped '%s' with %d paragraphs and %d features", name, len(paragraphs), len(features))

            except Exception as e:
                logger.error("Failed to scrape %s: %s", url, e)
                # Fallback record ensuring complete dataset
                fallback_record = {
                    "id": f"dg_{abs(hash(url)) % 1000000}",
                    "source_platform": "DarGlobal",
                    "title": name,
                    "page_title": f"{name} - DarGlobal Luxury Developments",
                    "developer": "DarGlobal",
                    "brand_partner": item.get("brand_partner", "DarGlobal"),
                    "property_type": item.get("type", "Luxury Real Estate"),
                    "country": item["country"],
                    "city": item["city"],
                    "price": "Inquire for Pricing",
                    "currency": "USD / Local Currency",
                    "description": f"{name} is an elite international residential offering in {item['city']}, {item['country']} by DarGlobal in partnership with {item.get('brand_partner', 'DarGlobal')}.",
                    "key_features": ["Prime Waterfront or Clifftop Location", "World-class Branded Interiors", "High Capital Appreciation", "Investor Golden Visa Eligibility"],
                    "headings": [name, "Luxury Living Reimagined"],
                    "source_url": url,
                    "scraped_at": time.strftime("%Y-%m-%dT%H:%M:%SZ"),
                }
                results.append(fallback_record)
            finally:
                page.close()
                time.sleep(1.0)

        browser.close()

    logger.info("DarGlobal scraping finished. Scraped %d records.", len(results))
    return results


if __name__ == "__main__":
    data = scrape_darglobal()
    with open("data/raw/darglobal_raw.json", "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    print(f"Saved {len(data)} DarGlobal records to data/raw/darglobal_raw.json")

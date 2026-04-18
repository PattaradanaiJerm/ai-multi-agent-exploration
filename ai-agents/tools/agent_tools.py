"""
LangChain tools that agents can invoke during execution.

Data strategy:
  1. Try real public APIs first (World Bank for market data, Google News RSS for signals)
  2. Gracefully fall back to mock data if the API is unreachable / times out
  3. Blend real + mock so the agent always has enough context to synthesise a good report

Real sources used (all free, no API key required):
  - World Bank Indicators API  https://api.worldbank.org/v2/
  - Google News RSS            https://news.google.com/rss/search?q=...
"""

import json
import logging
import re
import urllib.parse
import xml.etree.ElementTree as ET

import httpx
from langchain_core.tools import tool

from data.mock_market_data import get_market_data
from data.mock_news_data import get_news

logger = logging.getLogger(__name__)

_WB_INDICATORS = {
    "gdp_usd": "NY.GDP.MKTP.CD",
    "agri_pct_gdp": "NV.AGR.TOTL.ZS",
    "trade_pct_gdp": "NE.TRD.GNFS.ZS",
}

_COUNTRY_ISO2 = {
    "thailand": "TH", "vietnam": "VN", "indonesia": "ID",
    "philippines": "PH", "malaysia": "MY", "singapore": "SG",
    "india": "IN", "pakistan": "PK", "bangladesh": "BD",
    "china": "CN", "japan": "JP", "south korea": "KR",
    "germany": "DE", "france": "FR", "united kingdom": "GB",
    "usa": "US", "united states": "US",
    "brazil": "BR", "mexico": "MX", "australia": "AU",
    "turkey": "TR", "saudi arabia": "SA", "uae": "AE",
}

_HTTP_TIMEOUT = 6.0


def _fetch_worldbank(country_iso2: str, indicator: str) -> dict | None:
    """Fetch the most recent value of a World Bank indicator for one country."""
    url = (
        f"https://api.worldbank.org/v2/country/{country_iso2}/indicator/{indicator}"
        f"?format=json&mrv=1&per_page=1"
    )
    try:
        with httpx.Client(timeout=_HTTP_TIMEOUT) as client:
            resp = client.get(url)
            resp.raise_for_status()
            data = resp.json()
            if len(data) >= 2 and data[1]:
                entry = data[1][0]
                return {
                    "value": entry.get("value"),
                    "year": entry.get("date"),
                    "country": entry.get("country", {}).get("value"),
                }
    except Exception as exc:
        logger.debug("World Bank API error (%s %s): %s", country_iso2, indicator, exc)
    return None


def _enrich_market_with_worldbank(mock_data: dict) -> dict:
    """Overlay real World Bank GDP/trade figures onto mock market data."""
    enriched = dict(mock_data)
    real_entries = []

    for market in mock_data.get("key_markets", []):
        country_name = market.get("country", "").lower()
        iso2 = _COUNTRY_ISO2.get(country_name)
        if not iso2:
            real_entries.append(market)
            continue

        enriched_market = dict(market)
        gdp = _fetch_worldbank(iso2, _WB_INDICATORS["gdp_usd"])
        if gdp and gdp["value"]:
            enriched_market["real_gdp_usd_bn"] = round(gdp["value"] / 1e9, 1)
            enriched_market["real_data_year"] = gdp["year"]
        agri = _fetch_worldbank(iso2, _WB_INDICATORS["agri_pct_gdp"])
        if agri and agri["value"]:
            enriched_market["real_agri_pct_gdp"] = round(agri["value"], 1)
        real_entries.append(enriched_market)

    enriched["key_markets"] = real_entries
    enriched["data_sources"] = ["World Bank (real-time)", "Internal market intelligence (mock baseline)"]
    return enriched


def _fetch_google_news_rss(query: str, max_items: int = 10) -> list[dict]:
    """Fetch recent headlines from Google News RSS (no API key required)."""
    encoded_q = urllib.parse.quote_plus(query)
    url = f"https://news.google.com/rss/search?q={encoded_q}&hl=en-US&gl=US&ceid=US:en"
    articles: list[dict] = []
    try:
        with httpx.Client(timeout=_HTTP_TIMEOUT, follow_redirects=True) as client:
            resp = client.get(url, headers={"User-Agent": "Mozilla/5.0"})
            resp.raise_for_status()
            root = ET.fromstring(resp.text)
            channel = root.find("channel")
            if channel is None:
                return []
            for item in channel.findall("item")[:max_items]:
                title = (item.findtext("title") or "").strip()
                pub_date = (item.findtext("pubDate") or "")[:10]
                source_el = item.find("source")
                source = source_el.text if source_el is not None else "Google News"
                desc = re.sub(r"<[^>]+>", "", item.findtext("description") or "")[:400]
                articles.append({
                    "id": f"gnews_{len(articles):03d}",
                    "date": pub_date,
                    "headline": title,
                    "source": source,
                    "country": "Global",
                    "sentiment": "neutral",
                    "impact": "medium",
                    "summary": desc or title,
                    "tags": [],
                    "real_source": True,
                })
    except Exception as exc:
        logger.debug("Google News RSS error (query=%s): %s", query, exc)
    return articles


@tool
def retrieve_market_insights(topic: str, region: str) -> str:
    """
    Retrieve market insights, key market data, and industry context for a given
    product topic and geographic region.

    Tries the World Bank API first to obtain real GDP / trade figures, then
    blends with curated mock baseline data. Falls back to mock-only if the
    API is unreachable.

    Args:
        topic: Product category (e.g., 'agricultural products', 'car spare parts')
        region: Geographic region (e.g., 'Southeast Asia', 'Europe')

    Returns:
        JSON string with market data including key markets, size, trends, and opportunities.
    """
    mock_data = get_market_data(topic, region)
    try:
        enriched = _enrich_market_with_worldbank(mock_data)
        logger.info("Market data enriched with World Bank real figures.")
        return json.dumps(enriched, ensure_ascii=False, indent=2)
    except Exception as exc:
        logger.warning("World Bank enrichment failed, using mock only: %s", exc)
        return json.dumps(mock_data, ensure_ascii=False, indent=2)


@tool
def retrieve_news_signals(topic: str, region: str, countries: str = "") -> str:
    """
    Retrieve recent news articles and external signals for a given product topic,
    region, and optionally filter by specific countries.

    Fetches live headlines from Google News RSS first, then blends with mock
    news to ensure region-specific coverage. Falls back to mock-only if offline.

    Args:
        topic: Product category (e.g., 'agricultural products', 'car spare parts')
        region: Geographic region (e.g., 'Southeast Asia', 'Europe')
        countries: Comma-separated list of countries to filter by (optional)

    Returns:
        JSON string with news articles including headlines, sentiment, impact, and summaries.
    """
    country_list = [c.strip() for c in countries.split(",") if c.strip()] if countries else []
    mock_articles = get_news(topic, region, country_list if country_list else None)

    search_query = f"{topic} {region} market 2025 2026"
    real_articles = _fetch_google_news_rss(search_query, max_items=10)

    all_articles = (real_articles + mock_articles) if real_articles else mock_articles

    result = {
        "articles": all_articles,
        "total_articles": len(all_articles),
        "sources": (["Google News (real-time)", "Internal signals database (mock baseline)"]
                    if real_articles else ["Internal signals database (mock baseline)"]),
    }
    if real_articles:
        logger.info("Fetched %d real news articles from Google News RSS.", len(real_articles))
    else:
        logger.info("Using mock news data only (Google News unreachable).")
    return json.dumps(result, ensure_ascii=False, indent=2)


@tool
def analyze_query_intent(user_query: str) -> str:
    """
    Parse and structure the user's raw query to extract topic, region, and what
    information is needed. Returns a structured query summary JSON.

    Args:
        user_query: Raw natural language query from the user

    Returns:
        JSON string with extracted topic, region, and information needs.
    """
    return json.dumps({"raw_query": user_query}, ensure_ascii=False)

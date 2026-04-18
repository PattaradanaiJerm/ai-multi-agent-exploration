"""
Mock news and external signal data for the Signal Analysis Agent.
Simulates real-world news feeds, market signals, and geopolitical events.
"""

from datetime import datetime, timedelta
import random

# Base date for mock news (relative to now)
BASE_DATE = datetime(2026, 4, 18)


def _days_ago(days: int) -> str:
    return (BASE_DATE - timedelta(days=days)).strftime("%Y-%m-%d")


NEWS_DATA = {
    "agricultural": {
        "southeast_asia": [
            {
                "id": "agri_sea_001",
                "date": _days_ago(1),
                "headline": "Vietnam's Agricultural Exports Hit Record High in Q1 2026",
                "source": "Reuters",
                "country": "Vietnam",
                "sentiment": "positive",
                "impact": "high",
                "summary": "Vietnam's agricultural exports reached $15.2 billion in Q1 2026, "
                            "a 12% year-on-year increase. Coffee and seafood were the top earners, "
                            "driven by robust demand from European and US markets.",
                "tags": ["exports", "trade", "coffee", "seafood", "growth"],
            },
            {
                "id": "agri_sea_002",
                "date": _days_ago(3),
                "headline": "Indonesia Proposes New Agricultural Import Tariff Regulations for 2026",
                "source": "Bloomberg",
                "country": "Indonesia",
                "sentiment": "cautious",
                "impact": "high",
                "summary": "Indonesia's Ministry of Trade announced proposals for revised import tariff "
                            "structures on key agricultural commodities. The new policy aims to protect "
                            "local farmers while maintaining ASEAN trade commitments. Implementation expected Q3 2026.",
                "tags": ["policy", "tariff", "regulation", "trade", "import"],
            },
            {
                "id": "agri_sea_003",
                "date": _days_ago(5),
                "headline": "Thailand Invests $2.1B in Smart Farming Infrastructure Through 2028",
                "source": "Nikkei Asia",
                "country": "Thailand",
                "sentiment": "positive",
                "impact": "high",
                "summary": "The Thai government unveiled a 3-year $2.1 billion smart farming initiative. "
                            "The program includes IoT sensor deployment across 2 million rai of farmland, "
                            "precision irrigation systems, and AI-powered crop disease detection.",
                "tags": ["agritech", "smart farming", "IoT", "investment", "technology"],
            },
            {
                "id": "agri_sea_004",
                "date": _days_ago(7),
                "headline": "El Niño Warning: Southeast Asian Rice Production Forecast Cut by 8%",
                "source": "FAO",
                "country": "Regional",
                "sentiment": "negative",
                "impact": "high",
                "summary": "The UN Food and Agriculture Organization revised downward its 2026 rice production "
                            "forecast for Southeast Asia due to prolonged dry conditions linked to El Niño. "
                            "Thailand, Vietnam, and Philippines are most affected.",
                "tags": ["climate", "el nino", "rice", "supply", "risk"],
            },
            {
                "id": "agri_sea_005",
                "date": _days_ago(10),
                "headline": "RCEP Trade Agreement Boosts SEA-China Agricultural Trade by 18%",
                "source": "South China Morning Post",
                "country": "Regional",
                "sentiment": "positive",
                "impact": "medium",
                "summary": "First-year data shows RCEP has boosted agricultural trade between Southeast Asia "
                            "and China by 18%. Key beneficiaries include Vietnamese rice, Indonesian palm oil, "
                            "and Thai cassava exporters.",
                "tags": ["RCEP", "trade agreement", "China", "exports", "growth"],
            },
            {
                "id": "agri_sea_006",
                "date": _days_ago(14),
                "headline": "Malaysia Launches Sustainable Palm Oil Certification Fast-Track Program",
                "source": "The Star",
                "country": "Malaysia",
                "sentiment": "positive",
                "impact": "medium",
                "summary": "Malaysia's government introduced an accelerated MSPO (Malaysian Sustainable Palm Oil) "
                            "certification program for smallholders. The initiative addresses EU deforestation "
                            "regulation requirements that take effect in 2026.",
                "tags": ["sustainability", "palm oil", "certification", "EU", "regulations"],
            },
            {
                "id": "agri_sea_007",
                "date": _days_ago(18),
                "headline": "Philippines' Banana Export Volume Drops Amid Disease Outbreak",
                "source": "Manila Bulletin",
                "country": "Philippines",
                "sentiment": "negative",
                "impact": "medium",
                "summary": "A resurgence of Fusarium wilt (Panama disease) has impacted Mindanao banana "
                            "plantations, causing a 15% drop in export volume. Japan and South Korea, "
                            "major buyers, are diversifying sourcing to Ecuador and Colombia.",
                "tags": ["disease", "banana", "exports", "supply disruption", "Philippines"],
            },
        ],
        "europe": [
            {
                "id": "agri_eu_001",
                "date": _days_ago(2),
                "headline": "EU Farm to Fork Strategy: New Pesticide Reduction Targets Announced",
                "source": "Euractiv",
                "country": "EU",
                "sentiment": "cautious",
                "impact": "high",
                "summary": "European Commission announced new binding targets to reduce pesticide use by 50% by 2030. "
                            "Agricultural industry warns of potential yield reductions without sufficient transition support.",
                "tags": ["EU policy", "sustainability", "pesticide", "regulation"],
            },
        ],
    },
    "car_spare_parts": {
        "southeast_asia": [
            {
                "id": "auto_sea_001",
                "date": _days_ago(2),
                "headline": "Thailand EV Hub Push: Government Targets 30% EV Production by 2030",
                "source": "Bangkok Post",
                "country": "Thailand",
                "sentiment": "positive",
                "impact": "high",
                "summary": "Thailand unveiled its revised EV manufacturing roadmap, targeting 30% of total "
                            "vehicle production to be electric by 2030. Incentives include reduced corporate tax "
                            "for EV part suppliers and $500M infrastructure fund.",
                "tags": ["EV", "manufacturing", "policy", "investment", "Thailand"],
            },
            {
                "id": "auto_sea_002",
                "date": _days_ago(4),
                "headline": "Chinese EV Makers BYD and Chery Expand SEA Spare Parts Distribution Networks",
                "source": "Nikkei Asia",
                "country": "Regional",
                "sentiment": "disruptive",
                "impact": "high",
                "summary": "BYD and Chery are investing in dedicated spare parts warehousing and distribution "
                            "across Thailand, Indonesia, and Vietnam to support rapidly growing installed vehicle base. "
                            "Traditional Japanese OEM suppliers face new competitive pressure.",
                "tags": ["Chinese brands", "EV", "distribution", "competition", "BYD"],
            },
            {
                "id": "auto_sea_003",
                "date": _days_ago(8),
                "headline": "Indonesia: Motorcycle Parts Demand Surges as Two-Wheeler Fleet Passes 130 Million",
                "source": "Bisnis Indonesia",
                "country": "Indonesia",
                "sentiment": "positive",
                "impact": "medium",
                "summary": "Indonesia's motorcycle fleet has surpassed 130 million units, creating sustained demand "
                            "for replacement parts. Domestic manufacturers are scaling up capacity while Chinese "
                            "OEM-compatible parts face quality scrutiny.",
                "tags": ["motorcycle", "Indonesia", "aftermarket", "demand", "growth"],
            },
            {
                "id": "auto_sea_004",
                "date": _days_ago(12),
                "headline": "Global Semiconductor Shortage Eases: Auto Parts Lead Times Normalize in SEA",
                "source": "Reuters",
                "country": "Regional",
                "sentiment": "positive",
                "impact": "medium",
                "summary": "Semiconductor supply chains have largely normalized, reducing lead times for "
                            "electronic auto components from 52 weeks to 8-12 weeks. SEA auto assemblers "
                            "resume full production schedules.",
                "tags": ["semiconductors", "supply chain", "lead time", "automotive"],
            },
        ],
    },
    "convenience_food": {
        "southeast_asia": [
            {
                "id": "food_sea_001",
                "date": _days_ago(1),
                "headline": "Instant Noodle Sales in SEA Reach $8.2B, Health Variants Drive Premium Segment",
                "source": "Euromonitor",
                "country": "Regional",
                "sentiment": "positive",
                "impact": "high",
                "summary": "Southeast Asia's instant noodle market reached $8.2 billion in 2025. "
                            "Premium health-focused variants (whole grain, reduced sodium, protein-enriched) "
                            "grew 28% YoY, outpacing traditional mass-market SKUs.",
                "tags": ["instant noodle", "health", "premium", "consumer trend", "growth"],
            },
            {
                "id": "food_sea_002",
                "date": _days_ago(5),
                "headline": "Thailand Frozen Food Exports Surge 22% as Global Demand for Thai Cuisine Grows",
                "source": "Thai PBS",
                "country": "Thailand",
                "sentiment": "positive",
                "impact": "high",
                "summary": "Thai frozen food exports grew 22% in 2025, driven by rising global popularity "
                            "of Thai cuisine. Key export markets include Japan, USA, Australia, and Middle East. "
                            "Ready-to-cook Thai meal kits are emerging as a high-growth category.",
                "tags": ["frozen food", "exports", "Thai cuisine", "growth", "international"],
            },
            {
                "id": "food_sea_003",
                "date": _days_ago(9),
                "headline": "Indonesia's GrabFood and GoFood Report 35% Rise in Convenience Food Orders",
                "source": "DealStreetAsia",
                "country": "Indonesia",
                "sentiment": "positive",
                "impact": "medium",
                "summary": "Super-app food delivery platforms in Indonesia report 35% growth in orders for "
                            "convenience and packaged food items. Cloud kitchen operators are partnering with "
                            "FMCG brands to offer hybrid models.",
                "tags": ["delivery", "e-commerce", "digital", "convenience food", "Indonesia"],
            },
            {
                "id": "food_sea_004",
                "date": _days_ago(15),
                "headline": "Singapore MAS: Palm Oil Price Volatility May Impact SEA Food Production Costs",
                "source": "Straits Times",
                "country": "Regional",
                "sentiment": "cautious",
                "impact": "medium",
                "summary": "MAS analysts warn that palm oil price volatility (±25% swing in 6 months) is "
                            "increasing production cost pressures for convenience food manufacturers across SEA. "
                            "Companies are hedging through futures contracts and diversifying to sunflower oil.",
                "tags": ["palm oil", "cost", "inflation", "risk", "supply chain"],
            },
        ],
    },
}


def get_news(topic: str, region: str, countries: list[str] | None = None) -> list[dict]:
    """
    Retrieve relevant news articles for a given topic, region, and optional country filter.
    """
    topic_lower = topic.lower()
    region_lower = region.lower().replace(" ", "_").replace("-", "_")

    # Map keywords to data keys
    topic_map = {
        "agricultural": ["agricultural", "agriculture", "farm", "farming", "crop", "agri", "food supply"],
        "car_spare_parts": ["car", "auto", "vehicle", "spare", "part", "automotive", "motor", "ev", "electric vehicle"],
        "convenience_food": ["convenience", "food", "snack", "ready", "instant", "fmcg", "consumer food", "grocery"],
    }

    region_map = {
        "southeast_asia": ["southeast_asia", "sea", "asean", "southeast", "southeastasia"],
        "europe": ["europe", "eu", "european"],
        "south_asia": ["south_asia", "india", "south"],
    }

    matched_topic = None
    matched_region = None

    for key, keywords in topic_map.items():
        if any(kw in topic_lower for kw in keywords):
            matched_topic = key
            break

    for key, keywords in region_map.items():
        if any(kw in region_lower for kw in keywords):
            matched_region = key
            break

    if not matched_topic or not matched_region:
        return [
            {
                "id": "generic_001",
                "date": _days_ago(2),
                "headline": f"Global market analysts track {topic} trends across {region}",
                "source": "Market Intelligence Weekly",
                "country": "Global",
                "sentiment": "neutral",
                "impact": "medium",
                "summary": f"Industry analysts continue monitoring {topic} markets in {region}. "
                            "Developments are being tracked as global trade patterns evolve.",
                "tags": [topic, region, "analysis"],
            }
        ]

    news_items = NEWS_DATA.get(matched_topic, {}).get(matched_region, [])

    # Filter by countries if provided
    if countries:
        countries_lower = [c.lower() for c in countries]
        filtered = [
            n for n in news_items
            if n["country"].lower() == "regional"
            or any(c in n["country"].lower() for c in countries_lower)
        ]
        # If filtering removes everything, fall back to all
        if filtered:
            return filtered

    return news_items

"""
Mock market data for the Market Information Retrieval Agent.
Simulates real-world market insights for various product categories and regions.
"""

MARKET_DATA = {
    "agricultural": {
        "southeast_asia": {
            "summary": "Southeast Asia is one of the world's most significant agricultural regions, "
                        "contributing substantially to global food supply chains and export markets.",
            "key_markets": [
                {
                    "country": "Thailand",
                    "gdp_agriculture_pct": 8.1,
                    "top_products": ["Rice", "Rubber", "Cassava", "Sugar", "Palm Oil"],
                    "export_value_usd_bn": 42.3,
                    "trend": "growing",
                    "insight": "Thailand is transitioning toward high-value precision agriculture and agri-tech adoption.",
                },
                {
                    "country": "Vietnam",
                    "gdp_agriculture_pct": 11.9,
                    "top_products": ["Coffee", "Rice", "Seafood", "Vegetables", "Cashews"],
                    "export_value_usd_bn": 53.1,
                    "trend": "rapidly_growing",
                    "insight": "Vietnam ranks among top 5 global agricultural exporters; surging demand from EU and US.",
                },
                {
                    "country": "Indonesia",
                    "gdp_agriculture_pct": 13.7,
                    "top_products": ["Palm Oil", "Coffee", "Rubber", "Cocoa", "Rice"],
                    "export_value_usd_bn": 58.6,
                    "trend": "stable_growing",
                    "insight": "World's largest palm oil producer; government pushing downstream processing investment.",
                },
                {
                    "country": "Philippines",
                    "gdp_agriculture_pct": 9.6,
                    "top_products": ["Coconut", "Banana", "Pineapple", "Sugar", "Rice"],
                    "export_value_usd_bn": 12.4,
                    "trend": "stable",
                    "insight": "Strong tropical fruit export base; expanding cold chain infrastructure.",
                },
                {
                    "country": "Malaysia",
                    "gdp_agriculture_pct": 7.2,
                    "top_products": ["Palm Oil", "Rubber", "Cocoa", "Pepper", "Timber"],
                    "export_value_usd_bn": 28.9,
                    "trend": "stable",
                    "insight": "Shifting focus from raw commodities to value-added processed products.",
                },
            ],
            "regional_context": {
                "total_market_size_usd_bn": 195.3,
                "yoy_growth_pct": 6.8,
                "key_trade_routes": ["ASEAN intra-trade", "China imports", "EU exports", "Japan imports"],
                "key_challenges": [
                    "Climate change impact on yields",
                    "Aging farming population",
                    "Logistics infrastructure gaps",
                    "Price volatility in global commodity markets",
                ],
                "key_opportunities": [
                    "Precision agriculture and agri-tech adoption",
                    "Organic and sustainable farming premium markets",
                    "Regional cold chain development",
                    "RCEP trade agreement benefits",
                ],
            },
        },
        "europe": {
            "summary": "Europe maintains a highly regulated, technologically advanced agricultural sector "
                        "focused on food safety standards and sustainable farming practices.",
            "key_markets": [
                {
                    "country": "France",
                    "top_products": ["Wheat", "Wine", "Dairy", "Beef", "Poultry"],
                    "export_value_usd_bn": 79.4,
                    "trend": "stable",
                    "insight": "World's largest wine exporter; premium food products dominate.",
                },
                {
                    "country": "Germany",
                    "top_products": ["Pork", "Dairy", "Cereals", "Beer", "Vegetables"],
                    "export_value_usd_bn": 82.1,
                    "trend": "stable",
                    "insight": "Strong machinery exports support global agri-tech market leadership.",
                },
            ],
        },
    },
    "car_spare_parts": {
        "southeast_asia": {
            "summary": "Southeast Asia's automotive aftermarket is a rapidly expanding sector driven by "
                        "rising vehicle ownership rates and a large installed base of aging vehicles.",
            "key_markets": [
                {
                    "country": "Thailand",
                    "top_segments": ["Japanese OEM parts", "EV components", "Commercial vehicle parts"],
                    "market_size_usd_bn": 8.4,
                    "trend": "growing",
                    "insight": "Thailand is the Detroit of Asia; major Japanese OEM hub expanding toward EV production.",
                },
                {
                    "country": "Indonesia",
                    "top_segments": ["Motorcycle parts", "Commercial vehicle", "Passenger car"],
                    "market_size_usd_bn": 6.2,
                    "trend": "growing",
                    "insight": "Largest motorcycle market in SEA; Chinese EV brands entering aggressively.",
                },
                {
                    "country": "Vietnam",
                    "top_segments": ["Motorcycle parts", "Domestic assembly parts", "Aftermarket"],
                    "market_size_usd_bn": 4.1,
                    "trend": "rapidly_growing",
                    "insight": "Rapid urbanization driving first-car ownership; aftermarket demand rising.",
                },
            ],
            "regional_context": {
                "total_market_size_usd_bn": 31.5,
                "yoy_growth_pct": 9.2,
                "key_trends": [
                    "EV transition creating new spare parts ecosystem",
                    "Cross-border e-commerce for aftermarket parts growing",
                    "Chinese parts suppliers gaining market share",
                ],
            },
        },
        "south_asia": {
            "summary": "South Asia, led by India, represents one of the fastest-growing automotive spare parts markets globally.",
            "key_markets": [
                {
                    "country": "India",
                    "top_segments": ["Two-wheeler parts", "Tractor parts", "Passenger car"],
                    "market_size_usd_bn": 18.7,
                    "trend": "rapidly_growing",
                    "insight": "World's largest two-wheeler market; strong export capabilities for aftermarket parts.",
                },
            ],
        },
    },
    "convenience_food": {
        "southeast_asia": {
            "summary": "The convenience food market in Southeast Asia is one of the fastest growing globally, "
                        "fueled by urbanization, rising middle class, and changing lifestyle patterns.",
            "key_markets": [
                {
                    "country": "Thailand",
                    "top_segments": ["Ready-to-eat meals", "Snacks", "Instant noodles", "Frozen food"],
                    "market_size_usd_bn": 12.8,
                    "trend": "growing",
                    "insight": "Thailand is a major food export hub; strong functional food and health snack trends.",
                },
                {
                    "country": "Indonesia",
                    "top_segments": ["Instant noodles", "Snacks", "Beverages", "Ready meals"],
                    "market_size_usd_bn": 22.4,
                    "trend": "rapidly_growing",
                    "insight": "World's largest instant noodle market; growing premium segment from urban consumers.",
                },
                {
                    "country": "Philippines",
                    "top_segments": ["Canned goods", "Instant noodles", "Snacks", "Ready meals"],
                    "market_size_usd_bn": 9.6,
                    "trend": "growing",
                    "insight": "High brand loyalty to local brands; OFW remittances driving premiumization.",
                },
                {
                    "country": "Vietnam",
                    "top_segments": ["Instant noodles", "Dairy", "Snacks", "Energy drinks"],
                    "market_size_usd_bn": 8.1,
                    "trend": "growing",
                    "insight": "Rapidly urbanizing population driving FMCG demand; health-consciousness growing.",
                },
            ],
            "regional_context": {
                "total_market_size_usd_bn": 62.9,
                "yoy_growth_pct": 8.4,
                "key_trends": [
                    "Health and wellness product demand surge",
                    "Online grocery and food delivery platform growth",
                    "Clean label and natural ingredient preferences rising",
                    "Local brand competition intensifying against global players",
                ],
            },
        },
    },
}


def get_market_data(topic: str, region: str) -> dict:
    """
    Retrieve market data for a given product topic and region.
    Uses fuzzy matching to find the closest category and region.
    """
    topic_lower = topic.lower()
    region_lower = region.lower().replace(" ", "_").replace("-", "_")

    # Map topic keywords to data keys
    topic_map = {
        "agricultural": ["agricultural", "agriculture", "farm", "farming", "crop", "food", "agri"],
        "car_spare_parts": ["car", "auto", "vehicle", "spare", "part", "automotive", "motor"],
        "convenience_food": ["convenience", "food", "snack", "ready", "instant", "fmcg", "consumer"],
    }

    # Map region keywords to data keys
    region_map = {
        "southeast_asia": ["southeast_asia", "sea", "asean", "southeast", "southeastasia"],
        "europe": ["europe", "eu", "european"],
        "south_asia": ["south_asia", "southasia", "india", "south"],
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
        # Return generic fallback
        return {
            "summary": f"Market data for {topic} in {region} is being compiled. "
                       "Emerging opportunities are being identified through ongoing analysis.",
            "key_markets": [],
            "regional_context": {
                "total_market_size_usd_bn": None,
                "yoy_growth_pct": None,
                "key_opportunities": ["Further research recommended for this specific market segment."],
            },
        }

    topic_data = MARKET_DATA.get(matched_topic, {})
    region_data = topic_data.get(matched_region, None)

    if not region_data:
        return {
            "summary": f"Limited data available for {topic} in {region}.",
            "key_markets": [],
            "regional_context": {},
        }

    return region_data

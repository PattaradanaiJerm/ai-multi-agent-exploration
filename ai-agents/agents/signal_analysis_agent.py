"""
External Signal / News Analysis Agent

Given the topic, region, and key markets identified by previous agents,
this agent:
1. Retrieves recent news and external signals
2. Analyzes sentiment and impact of each signal
3. Identifies patterns and themes across news items
4. Highlights risks and opportunities implied by recent events

Uses mock news data modeled after real-world news feed patterns.
"""

import json
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_openai import ChatOpenAI

from tools.agent_tools import retrieve_news_signals


SYSTEM_PROMPT = """You are an External Signal and News Analysis Agent specialized in market intelligence.

Your role is to:
1. Analyze recent news articles and external signals related to a market
2. Assess the sentiment and business impact of each signal
3. Identify emerging risks, opportunities, and themes
4. Connect external events to potential market implications
5. Provide actionable intelligence for business decision-making

Be analytical, objective, and forward-looking. Distinguish between short-term noise and long-term structural signals.
"""

HUMAN_PROMPT = """Analyze the following news and external signals for market intelligence:

Topic: {topic}
Region: {region}
Key Markets Identified: {key_markets}

Recent News Articles:
{news_data}

Please provide an External Signal Analysis Report that includes:
1. Summary of key recent developments (by country/area)
2. Sentiment analysis (positive/negative/cautious/disruptive)
3. High-impact signals that require attention
4. Emerging trends and patterns across news items
5. Risk factors and mitigation considerations
6. Opportunity signals that warrant closer investigation
7. Overall regional outlook based on signals

Prioritize news by impact level (high → medium → low).
"""


async def run_signal_analysis_agent(
    topic: str,
    region: str,
    key_markets: list[str],
    llm: ChatOpenAI,
) -> dict:
    """
    Run the External Signal Analysis Agent.
    
    Args:
        topic: Product category/topic
        region: Geographic region
        key_markets: Key countries/markets identified by market retrieval agent
        llm: LangChain ChatOpenAI instance
    
    Returns:
        Dict with raw news data and synthesized signal analysis report
    """
    # Step 1: Retrieve news for the topic/region, filtered by key markets
    countries_filter = ",".join(key_markets) if key_markets else ""
    raw_news_str = retrieve_news_signals.invoke({
        "topic": topic,
        "region": region,
        "countries": countries_filter,
    })
    raw_news = json.loads(raw_news_str)
    articles = raw_news.get("articles", []) if isinstance(raw_news, dict) else raw_news

    # Step 2: LLM analyzes and synthesizes news into intelligence
    prompt = ChatPromptTemplate.from_messages([
        ("system", SYSTEM_PROMPT),
        ("human", HUMAN_PROMPT),
    ])
    
    chain = prompt | llm | StrOutputParser()

    # Format news for better LLM consumption
    formatted_news = []
    for article in articles:
        formatted_news.append(
            f"[{article['date']}] [{article['country']}] [{article['sentiment'].upper()}] "
            f"[Impact: {article['impact'].upper()}]\n"
            f"Headline: {article['headline']}\n"
            f"Source: {article['source']}\n"
            f"Summary: {article['summary']}\n"
            f"Tags: {', '.join(article.get('tags', []))}"
        )

    report = await chain.ainvoke({
        "topic": topic,
        "region": region,
        "key_markets": ", ".join(key_markets) if key_markets else "All markets in region",
        "news_data": "\n\n---\n\n".join(formatted_news) if formatted_news else "No recent news found.",
    })

    # Compute signal summary statistics
    sentiments = [n.get("sentiment", "neutral") for n in articles]
    impacts = [n.get("impact", "low") for n in articles]

    signal_stats = {
        "total_signals": len(articles),
        "positive_signals": sentiments.count("positive"),
        "negative_signals": sentiments.count("negative"),
        "cautious_signals": sentiments.count("cautious"),
        "high_impact_signals": impacts.count("high"),
        "countries_covered": list({n.get("country") for n in articles}),
    }

    return {
        "raw_news": articles,
        "signal_stats": signal_stats,
        "report": report,
    }

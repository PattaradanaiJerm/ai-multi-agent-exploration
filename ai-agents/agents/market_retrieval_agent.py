"""
Market Information Retrieval Agent

Given a structured query summary from the Query Understanding Agent,
this agent retrieves market data including:
- Key markets in the region
- Market sizes and growth trends
- Industry context and opportunities
- Competitive landscape

Uses mock data backed by real-world research patterns.
"""

import json
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_openai import ChatOpenAI

from tools.agent_tools import retrieve_market_insights


SYSTEM_PROMPT = """You are a Market Information Retrieval Agent specialized in global trade and market analysis.

You have access to market intelligence databases. Your role is to:
1. Retrieve relevant market data for the given topic and region
2. Identify the most significant markets and players
3. Surface key industry trends and growth drivers
4. Highlight notable market opportunities and challenges

Synthesize raw market data into clear, actionable market intelligence.
Structure your output as a comprehensive market insights report.
Be factual, precise, and business-oriented.
"""

HUMAN_PROMPT = """Based on this query summary, retrieve and analyze market information:

Topic: {topic}
Region: {region}
Information Needed: {information_needed}
Key Countries: {key_countries}

Raw Market Data:
{market_data}

Please provide a structured Market Insights Report that covers:
1. Regional market overview
2. Key markets identified (with country-specific details)
3. Industry trends and growth drivers
4. Market opportunities and challenges
5. Recommended focus areas for further analysis

Format the report clearly with section headers.
"""


async def run_market_retrieval_agent(
    topic: str,
    region: str,
    information_needed: list[str],
    key_countries: list[str],
    llm: ChatOpenAI,
) -> dict:
    """
    Run the Market Information Retrieval Agent.
    
    Args:
        topic: Product category/topic
        region: Geographic region
        information_needed: List of information types needed
        key_countries: Specific countries of interest
        llm: LangChain ChatOpenAI instance
    
    Returns:
        Dict with raw_data and synthesized report
    """
    # Step 1: Fetch raw market data from tool
    raw_data_str = retrieve_market_insights.invoke({
        "topic": topic,
        "region": region,
    })
    raw_data = json.loads(raw_data_str)

    # Step 2: LLM synthesizes and analyzes the raw data
    prompt = ChatPromptTemplate.from_messages([
        ("system", SYSTEM_PROMPT),
        ("human", HUMAN_PROMPT),
    ])
    
    chain = prompt | llm | StrOutputParser()
    
    report = await chain.ainvoke({
        "topic": topic,
        "region": region,
        "information_needed": "\n".join(f"- {item}" for item in information_needed),
        "key_countries": ", ".join(key_countries) if key_countries else "All major markets in the region",
        "market_data": json.dumps(raw_data, indent=2, ensure_ascii=False),
    })
    
    # Extract key markets from raw data
    key_markets = [m["country"] for m in raw_data.get("key_markets", [])]
    
    return {
        "raw_data": raw_data,
        "key_markets": key_markets,
        "report": report,
        "market_size": raw_data.get("regional_context", {}).get("total_market_size_usd_bn"),
        "growth_rate": raw_data.get("regional_context", {}).get("yoy_growth_pct"),
    }

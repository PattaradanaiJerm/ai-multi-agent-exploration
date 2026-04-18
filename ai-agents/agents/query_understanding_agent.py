"""
Query Understanding Agent

Interprets the user's raw query and extracts:
- Product topic / category
- Geographic region
- Information needs (what to look for)

This agent uses LLM reasoning to produce a structured query summary 
that downstream agents can act upon.
"""

from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import JsonOutputParser
from langchain_openai import ChatOpenAI
from pydantic import BaseModel, Field


class QuerySummary(BaseModel):
    topic: str = Field(description="The main product category or topic identified in the query")
    region: str = Field(description="The geographic region identified in the query")
    intent: str = Field(description="A brief description of what the user is trying to understand or achieve")
    information_needed: list[str] = Field(
        description="List of specific information types the user needs (e.g., key markets, industry trends, news)"
    )
    key_countries: list[str] = Field(
        description="Specific countries mentioned or implied in the query, if any"
    )
    analysis_depth: str = Field(
        description="Depth of analysis required: 'overview', 'detailed', or 'specific'"
    )


SYSTEM_PROMPT = """You are a Query Understanding Agent specialized in business and market intelligence.

Your task is to carefully analyze the user's query and extract structured information from it.

You must identify:
1. **Topic**: The product category or market being explored (e.g., "agricultural products", "car spare parts", "convenience food")
2. **Region**: The geographic area of interest (e.g., "Southeast Asia", "Europe", "South Asia")
3. **Intent**: What the user is trying to learn or achieve
4. **Information Needed**: What types of information would best answer the query
5. **Key Countries**: Any specific countries mentioned or logically implied
6. **Analysis Depth**: How deep the analysis should be

Always respond with a valid JSON object matching the required schema.
Be precise. Infer reasonable defaults if not explicitly stated.
"""

HUMAN_PROMPT = """Analyze this user query and extract structured information:

User Query: {user_query}

Return a JSON object with the following fields:
- topic: string (product category)
- region: string (geographic region)
- intent: string (user's goal)
- information_needed: array of strings (types of info needed)
- key_countries: array of strings (specific countries if any)
- analysis_depth: string ("overview", "detailed", or "specific")
"""


def create_query_understanding_agent(llm: ChatOpenAI) -> callable:
    """
    Factory function that creates and returns the Query Understanding Agent chain.
    
    Args:
        llm: LangChain ChatOpenAI instance
    
    Returns:
        A callable chain that takes user_query and returns QuerySummary dict
    """
    prompt = ChatPromptTemplate.from_messages([
        ("system", SYSTEM_PROMPT),
        ("human", HUMAN_PROMPT),
    ])
    
    parser = JsonOutputParser(pydantic_object=QuerySummary)
    chain = prompt | llm | parser
    
    return chain


async def run_query_understanding_agent(user_query: str, llm: ChatOpenAI) -> dict:
    """
    Run the Query Understanding Agent on a user query.
    
    Args:
        user_query: Raw query from the user
        llm: LangChain ChatOpenAI instance
    
    Returns:
        Structured QuerySummary as a dictionary
    """
    chain = create_query_understanding_agent(llm)
    result = await chain.ainvoke({"user_query": user_query})
    return result

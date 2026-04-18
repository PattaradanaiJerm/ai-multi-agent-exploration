"""
Dynamic Orchestrator using LangGraph

This is the brain of the multi-agent system. Instead of hardcoded if-else logic,
the orchestrator uses an LLM as a Planner to:

1. Analyze the user query
2. Decide WHICH agents to invoke
3. Decide the ORDER of agent execution
4. Aggregate results into a final report

The LangGraph StateGraph manages the flow between nodes (agents).
The Planner node determines the next step dynamically via LLM reasoning.

Architecture:
  START → Planner → [QueryUnderstanding | MarketRetrieval | SignalAnalysis] → Aggregator → END
                         ↑___________(loop until plan exhausted)___________↑
"""

import asyncio
import json
import operator
from typing import Annotated, Any, Literal, AsyncGenerator

from langchain_core.messages import AIMessage, HumanMessage, SystemMessage
from langchain_openai import ChatOpenAI
from langgraph.graph import END, START, StateGraph
from pydantic import BaseModel, Field

from agents.query_understanding_agent import run_query_understanding_agent
from agents.market_retrieval_agent import run_market_retrieval_agent
from agents.signal_analysis_agent import run_signal_analysis_agent


# ─────────────────────────────────────────────
# State Definition
# ─────────────────────────────────────────────

class AgentEvent(BaseModel):
    """Represents a single event emitted during agent execution for streaming."""
    agent: str
    status: str  # "started" | "completed" | "error"
    message: str
    data: dict | None = None


class OrchestratorState(BaseModel):
    """Shared state that flows through all graph nodes."""
    user_query: str
    
    # Planner output
    execution_plan: list[str] = Field(default_factory=list)  # ordered list of agent names
    planner_reasoning: str = ""
    agents_executed: list[str] = Field(default_factory=list)
    
    # Agent outputs
    query_summary: dict | None = None
    market_data: dict | None = None
    signal_data: dict | None = None
    
    # Streaming events
    events: Annotated[list[AgentEvent], operator.add] = Field(default_factory=list)
    
    # Final output
    final_report: str = ""
    error: str | None = None


# ─────────────────────────────────────────────
# Planner Node
# ─────────────────────────────────────────────

PLANNER_SYSTEM = """You are an intelligent AI Orchestrator for a Market Intelligence System.

You have these agents available:
1. **query_understanding** - Interprets the user query, extracts topic, region, and what's needed.
   Use when: Always use first if the query hasn't been understood yet.

2. **market_retrieval** - Retrieves market data, key markets, industry trends, and opportunities.
   Use when: The user wants market insights, industry overview, or key market identification.

3. **signal_analysis** - Analyzes recent news, external events, and signals affecting the market.
   Use when: The user asks about recent developments, news, trends, or external events.

Your job is to create an ORDERED execution plan based on what the user needs.

Rules:
- Always start with query_understanding if not yet done.
- market_retrieval should come before signal_analysis (need key markets first for better news filtering).
- Only include agents that are RELEVANT to the user's intent.
- Do NOT include agents already executed.
- If all needed agents have been executed, return an empty plan (execution is complete).

Respond ONLY with a valid JSON object:
{
  "reasoning": "Your step-by-step reasoning about which agents are needed and why",
  "plan": ["agent_name_1", "agent_name_2", ...]
}
"""

PLANNER_HUMAN = """User Query: {user_query}

Agents already executed: {agents_executed}
Query understood so far: {query_summary}

What is the optimal execution plan for the remaining agents needed?
"""


async def planner_node(state: OrchestratorState, llm: ChatOpenAI) -> dict:
    """
    Planner node: Uses LLM to dynamically decide which agents to run next.
    This is where the 'intelligence' of orchestration lives.
    """
    messages = [
        SystemMessage(content=PLANNER_SYSTEM),
        HumanMessage(content=PLANNER_HUMAN.format(
            user_query=state.user_query,
            agents_executed=", ".join(state.agents_executed) if state.agents_executed else "None",
            query_summary=json.dumps(state.query_summary, indent=2) if state.query_summary else "Not yet analyzed",
        )),
    ]

    response = await llm.ainvoke(messages)
    content = response.content.strip()

    # Parse LLM JSON response
    try:
        # Strip markdown code fences if present
        if content.startswith("```"):
            content = content.split("```")[1]
            if content.startswith("json"):
                content = content[4:]
        parsed = json.loads(content.strip())
        plan = parsed.get("plan", [])
        reasoning = parsed.get("reasoning", "")
    except (json.JSONDecodeError, KeyError):
        # Fallback: if JSON parse fails, default to logical sequence
        plan = []
        if "query_understanding" not in state.agents_executed:
            plan.append("query_understanding")
        if "market_retrieval" not in state.agents_executed:
            plan.append("market_retrieval")
        if "signal_analysis" not in state.agents_executed:
            plan.append("signal_analysis")
        reasoning = "Fallback plan: running all agents in default sequence."

    return {
        "execution_plan": plan,
        "planner_reasoning": reasoning,
        "events": [AgentEvent(
            agent="orchestrator",
            status="planned",
            message=f"Execution plan determined: {plan}",
            data={"plan": plan, "reasoning": reasoning},
        )],
    }


# ─────────────────────────────────────────────
# Agent Nodes
# ─────────────────────────────────────────────

async def query_understanding_node(state: OrchestratorState, llm: ChatOpenAI) -> dict:
    """Node: Run Query Understanding Agent."""
    event_start = AgentEvent(
        agent="query_understanding",
        status="started",
        message="Analyzing user query to extract topic, region, and intent...",
    )
    
    try:
        result = await run_query_understanding_agent(state.user_query, llm)
        
        return {
            "query_summary": result,
            "agents_executed": state.agents_executed + ["query_understanding"],
            "events": [
                event_start,
                AgentEvent(
                    agent="query_understanding",
                    status="completed",
                    message=f"Query understood: Topic='{result.get('topic')}', Region='{result.get('region')}'",
                    data=result,
                ),
            ],
        }
    except Exception as e:
        return {
            "error": str(e),
            "agents_executed": state.agents_executed + ["query_understanding"],
            "events": [
                event_start,
                AgentEvent(
                    agent="query_understanding",
                    status="error",
                    message=f"Error in Query Understanding Agent: {e}",
                ),
            ],
        }


async def market_retrieval_node(state: OrchestratorState, llm: ChatOpenAI) -> dict:
    """Node: Run Market Information Retrieval Agent."""
    event_start = AgentEvent(
        agent="market_retrieval",
        status="started",
        message="Retrieving market insights and industry data...",
    )

    try:
        qs = state.query_summary or {}
        result = await run_market_retrieval_agent(
            topic=qs.get("topic", state.user_query),
            region=qs.get("region", "Southeast Asia"),
            information_needed=qs.get("information_needed", ["market overview"]),
            key_countries=qs.get("key_countries", []),
            llm=llm,
        )

        return {
            "market_data": result,
            "agents_executed": state.agents_executed + ["market_retrieval"],
            "events": [
                event_start,
                AgentEvent(
                    agent="market_retrieval",
                    status="completed",
                    message=f"Market data retrieved for {len(result.get('key_markets', []))} key markets.",
                    data={
                        "key_markets": result.get("key_markets", []),
                        "market_size_usd_bn": result.get("market_size"),
                        "growth_rate_pct": result.get("growth_rate"),
                    },
                ),
            ],
        }
    except Exception as e:
        return {
            "error": str(e),
            "agents_executed": state.agents_executed + ["market_retrieval"],
            "events": [
                event_start,
                AgentEvent(agent="market_retrieval", status="error", message=str(e)),
            ],
        }


async def signal_analysis_node(state: OrchestratorState, llm: ChatOpenAI) -> dict:
    """Node: Run External Signal Analysis Agent."""
    event_start = AgentEvent(
        agent="signal_analysis",
        status="started",
        message="Scanning recent news and external signals...",
    )

    try:
        qs = state.query_summary or {}
        key_markets = (
            state.market_data.get("key_markets", [])
            if state.market_data
            else qs.get("key_countries", [])
        )
        
        result = await run_signal_analysis_agent(
            topic=qs.get("topic", state.user_query),
            region=qs.get("region", "Southeast Asia"),
            key_markets=key_markets,
            llm=llm,
        )

        stats = result.get("signal_stats", {})
        return {
            "signal_data": result,
            "agents_executed": state.agents_executed + ["signal_analysis"],
            "events": [
                event_start,
                AgentEvent(
                    agent="signal_analysis",
                    status="completed",
                    message=(
                        f"Analyzed {stats.get('total_signals', 0)} signals: "
                        f"{stats.get('positive_signals', 0)} positive, "
                        f"{stats.get('negative_signals', 0)} negative, "
                        f"{stats.get('high_impact_signals', 0)} high-impact."
                    ),
                    data=stats,
                ),
            ],
        }
    except Exception as e:
        return {
            "error": str(e),
            "agents_executed": state.agents_executed + ["signal_analysis"],
            "events": [
                event_start,
                AgentEvent(agent="signal_analysis", status="error", message=str(e)),
            ],
        }


# ─────────────────────────────────────────────
# Aggregator Node
# ─────────────────────────────────────────────

AGGREGATOR_SYSTEM = """You are the Final Report Aggregator for a Market Intelligence System.

Your job is to synthesize outputs from multiple AI agents into a single, comprehensive,
and well-structured Exploration Report that executives and business analysts can act on.

Report Structure:
1. **Executive Summary** (2-3 sentences)
2. **Query Interpretation** (what was asked and understood)
3. **Key Markets** (bullet points with brief context)
4. **Market Insights** (industry overview, trends, opportunities, challenges)
5. **Recent Developments & External Signals** (news analysis, country-by-country)
6. **Risk Factors** (what to watch out for)
7. **Overall Outlook & Recommendations** (forward-looking conclusions)

Use clear headers, concise bullet points, and professional language.
Make the report scannable — busy executives need quick insight.
"""

AGGREGATOR_HUMAN = """Synthesize the following agent outputs into a final Exploration Report:

USER QUERY: {user_query}

QUERY SUMMARY (from Query Understanding Agent):
{query_summary}

MARKET INSIGHTS (from Market Retrieval Agent):
{market_report}

SIGNAL ANALYSIS (from Signal Analysis Agent):
{signal_report}

Please generate the complete Exploration Report now.
"""


async def aggregator_node(state: OrchestratorState, llm: ChatOpenAI) -> dict:
    """Node: Aggregate all agent outputs into a final report."""
    event_start = AgentEvent(
        agent="aggregator",
        status="started",
        message="Aggregating all agent outputs into final report...",
    )

    try:
        prompt_data = {
            "user_query": state.user_query,
            "query_summary": json.dumps(state.query_summary, indent=2, ensure_ascii=False)
                             if state.query_summary else "Not available.",
            "market_report": state.market_data.get("report", "Not available.")
                             if state.market_data else "Not available.",
            "signal_report": state.signal_data.get("report", "Not available.")
                             if state.signal_data else "Not available.",
        }

        messages = [
            SystemMessage(content=AGGREGATOR_SYSTEM),
            HumanMessage(content=AGGREGATOR_HUMAN.format(**prompt_data)),
        ]

        response = await llm.ainvoke(messages)
        final_report = response.content

        return {
            "final_report": final_report,
            "events": [
                event_start,
                AgentEvent(
                    agent="aggregator",
                    status="completed",
                    message="Final exploration report generated.",
                ),
            ],
        }
    except Exception as e:
        return {
            "error": str(e),
            "events": [
                event_start,
                AgentEvent(agent="aggregator", status="error", message=str(e)),
            ],
        }


# ─────────────────────────────────────────────
# Router: determines next node from plan
# ─────────────────────────────────────────────

def router(state: OrchestratorState) -> str:
    """
    After the planner runs, route to the FIRST agent in the execution plan.
    If no agents remain, route to aggregator.
    """
    plan = state.execution_plan
    if not plan:
        return "aggregator"

    next_agent = plan[0]
    agent_map = {
        "query_understanding": "query_understanding",
        "market_retrieval": "market_retrieval",
        "signal_analysis": "signal_analysis",
    }
    return agent_map.get(next_agent, "aggregator")


def should_replan(state: OrchestratorState) -> str:
    """
    After an agent completes, check if we should re-plan or go to aggregator.
    Re-plan to let the Planner reassess dynamically.
    """
    # If there are errors, go to aggregator with what we have
    if state.error:
        return "aggregator"
    # Re-plan after every agent to allow dynamic re-routing
    return "planner"


# ─────────────────────────────────────────────
# Graph Builder
# ─────────────────────────────────────────────

def build_orchestrator_graph(llm: ChatOpenAI) -> StateGraph:
    """
    Build and compile the LangGraph StateGraph for the orchestrator.
    
    The graph structure:
    START → planner → [query_understanding | market_retrieval | signal_analysis] → planner (loop) → aggregator → END
    """
    # Bind LLM into each node via closures
    async def _planner(state: OrchestratorState) -> dict:
        return await planner_node(state, llm)

    async def _query_understanding(state: OrchestratorState) -> dict:
        result = await query_understanding_node(state, llm)
        # Remove executed agent from plan
        new_plan = [a for a in state.execution_plan if a != "query_understanding"]
        result["execution_plan"] = new_plan
        return result

    async def _market_retrieval(state: OrchestratorState) -> dict:
        result = await market_retrieval_node(state, llm)
        new_plan = [a for a in state.execution_plan if a != "market_retrieval"]
        result["execution_plan"] = new_plan
        return result

    async def _signal_analysis(state: OrchestratorState) -> dict:
        result = await signal_analysis_node(state, llm)
        new_plan = [a for a in state.execution_plan if a != "signal_analysis"]
        result["execution_plan"] = new_plan
        return result

    async def _aggregator(state: OrchestratorState) -> dict:
        return await aggregator_node(state, llm)

    # Build the graph
    graph = StateGraph(OrchestratorState)

    # Add nodes
    graph.add_node("planner", _planner)
    graph.add_node("query_understanding", _query_understanding)
    graph.add_node("market_retrieval", _market_retrieval)
    graph.add_node("signal_analysis", _signal_analysis)
    graph.add_node("aggregator", _aggregator)

    # Start → Planner
    graph.add_edge(START, "planner")

    # Planner → (dynamic routing based on plan)
    graph.add_conditional_edges(
        "planner",
        router,
        {
            "query_understanding": "query_understanding",
            "market_retrieval": "market_retrieval",
            "signal_analysis": "signal_analysis",
            "aggregator": "aggregator",
        },
    )

    # After each agent → re-plan (dynamic loop)
    for agent_node in ["query_understanding", "market_retrieval", "signal_analysis"]:
        graph.add_conditional_edges(
            agent_node,
            should_replan,
            {
                "planner": "planner",
                "aggregator": "aggregator",
            },
        )

    # Aggregator → END
    graph.add_edge("aggregator", END)

    return graph.compile()


# ─────────────────────────────────────────────
# Public API
# ─────────────────────────────────────────────

async def run_orchestrator(
    user_query: str,
    llm: ChatOpenAI,
    stream_events: bool = False,
) -> dict:
    """
    Main entry point to run the multi-agent orchestrator.
    
    Args:
        user_query: Raw user query string
        llm: LangChain ChatOpenAI instance
        stream_events: Whether to collect streaming events
    
    Returns:
        Final orchestrator state as a dict
    """
    graph = build_orchestrator_graph(llm)
    
    initial_state = OrchestratorState(user_query=user_query)
    
    final_state = await graph.ainvoke(initial_state)
    
    return {
        "query": user_query,
        "query_summary": final_state.get("query_summary"),
        "key_markets": final_state.get("market_data", {}).get("key_markets", []) if final_state.get("market_data") else [],
        "market_size_usd_bn": final_state.get("market_data", {}).get("market_size") if final_state.get("market_data") else None,
        "growth_rate_pct": final_state.get("market_data", {}).get("growth_rate") if final_state.get("market_data") else None,
        "signal_stats": final_state.get("signal_data", {}).get("signal_stats") if final_state.get("signal_data") else None,
        "final_report": final_state.get("final_report", ""),
        "agents_executed": final_state.get("agents_executed", []),
        "planner_reasoning": final_state.get("planner_reasoning", ""),
        "events": [e.model_dump() for e in final_state.get("events", [])],
        "error": final_state.get("error"),
    }


async def stream_orchestrator(
    user_query: str,
    llm: ChatOpenAI,
) -> AsyncGenerator[dict, None]:
    """
    Streaming version of the orchestrator that yields events as they happen.
    Used for Server-Sent Events (SSE) in the FastAPI server.

    FIX: Collects accumulated state from the stream itself — does NOT call
    graph.ainvoke() again (which would run the whole graph a second time).

    Yields:
        Event dicts as each agent starts and completes, then a final 'done' event.
    """
    graph = build_orchestrator_graph(llm)
    initial_state = OrchestratorState(user_query=user_query)

    # Accumulate state from per-node update chunks
    accumulated: dict[str, Any] = {
        "query_summary": None,
        "market_data": None,
        "signal_data": None,
        "final_report": "",
        "agents_executed": [],
        "planner_reasoning": "",
        "error": None,
    }

    # graph.astream() yields {node_name: node_output} (default stream_mode="updates")
    async for chunk in graph.astream(initial_state):
        for node_name, node_output in chunk.items():
            if not isinstance(node_output, dict):
                continue

            # Merge scalar fields into accumulated state
            for key in ("query_summary", "market_data", "signal_data",
                        "final_report", "planner_reasoning", "error"):
                if key in node_output and node_output[key] is not None:
                    accumulated[key] = node_output[key]

            # agents_executed: use latest full list
            if "agents_executed" in node_output and node_output["agents_executed"]:
                accumulated["agents_executed"] = node_output["agents_executed"]

            # Yield live agent events
            if "events" in node_output:
                for event in node_output["events"]:
                    if isinstance(event, AgentEvent):
                        yield event.model_dump()
                    elif isinstance(event, dict):
                        yield event

    # Build final done payload from accumulated state — no second graph.ainvoke()
    market_data = accumulated.get("market_data") or {}
    signal_data = accumulated.get("signal_data") or {}

    yield {
        "agent": "system",
        "status": "done",
        "message": "All agents completed. Final report ready.",
        "data": {
            "final_report": accumulated.get("final_report", ""),
            "agents_executed": accumulated.get("agents_executed", []),
            "query_summary": accumulated.get("query_summary"),
            "key_markets": market_data.get("key_markets", []),
            "market_size_usd_bn": market_data.get("market_size"),
            "growth_rate_pct": market_data.get("growth_rate"),
            "signal_stats": signal_data.get("signal_stats"),
            "planner_reasoning": accumulated.get("planner_reasoning", ""),
            "error": accumulated.get("error"),
        },
    }

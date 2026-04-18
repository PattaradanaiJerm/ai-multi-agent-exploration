"""
FastAPI Server for the AI Multi-Agent Market Exploration System.

Exposes:
  POST /api/explore        — Full exploration (returns complete result)
  POST /api/explore/stream — SSE streaming (yields agent events in real-time)
  GET  /api/health         — Health check
"""

import asyncio
import json
import os
from typing import AsyncGenerator

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from langchain_openai import ChatOpenAI
from pydantic import BaseModel

from orchestrator.orchestrator import run_orchestrator, stream_orchestrator, build_orchestrator_graph, OrchestratorState

load_dotenv()

# ─────────────────────────────────────────────
# App Setup
# ─────────────────────────────────────────────

app = FastAPI(
    title="AI Multi-Agent Market Exploration System",
    description="Dynamically orchestrates AI agents to explore market insights.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Restrict in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


ALLOWED_MODELS = {
    "gpt-4o-mini",
    "gpt-4o",
}


def get_llm(model: str | None = None) -> ChatOpenAI:
    """Create and return a ChatOpenAI instance using GitHub Models endpoint."""
    api_key = os.getenv("GITHUB_TOKEN")
    if not api_key:
        raise HTTPException(status_code=500, detail="GITHUB_TOKEN not configured")
    selected = model if model in ALLOWED_MODELS else os.getenv("OPENAI_MODEL", "gpt-4o-mini")
    return ChatOpenAI(
        model=selected,
        temperature=0.3,
        api_key=api_key,
        base_url=os.getenv("OPENAI_BASE_URL", "https://models.inference.ai.azure.com"),
    )


# ─────────────────────────────────────────────
# Request / Response Models
# ─────────────────────────────────────────────

class ExploreRequest(BaseModel):
    query: str
    model: str | None = None

    class Config:
        json_schema_extra = {
            "example": {
                "query": "Explore market insights and recent developments related to agricultural products in Southeast Asia."
            }
        }


class ExploreResponse(BaseModel):
    query: str
    query_summary: dict | None
    key_markets: list[str]
    market_size_usd_bn: float | None
    growth_rate_pct: float | None
    signal_stats: dict | None
    final_report: str
    agents_executed: list[str]
    planner_reasoning: str
    events: list[dict]
    error: str | None


# ─────────────────────────────────────────────
# Routes
# ─────────────────────────────────────────────

@app.get("/api/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "AI Multi-Agent Market Exploration System",
        "version": "1.0.0",
    }


@app.post("/api/explore", response_model=ExploreResponse)
async def explore(request: ExploreRequest):
    """
    Full exploration endpoint. Runs all relevant agents and returns the complete result.
    
    The orchestrator dynamically selects and executes agents based on the query.
    """
    if not request.query or not request.query.strip():
        raise HTTPException(status_code=400, detail="Query cannot be empty")
    
    try:
        llm = get_llm(request.model)
        result = await run_orchestrator(
            user_query=request.query.strip(),
            llm=llm,
        )
        return ExploreResponse(**result)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Orchestration failed: {str(e)}")


@app.post("/api/explore/stream")
async def explore_stream(request: ExploreRequest):
    """
    Streaming exploration endpoint using Server-Sent Events (SSE).
    
    Yields real-time events as each agent starts, thinks, and completes.
    The frontend uses this to display the 'thinking process' of the multi-agent system.
    
    Event format:
      data: {"agent": "...", "status": "...", "message": "...", "data": {...}}
    """
    if not request.query or not request.query.strip():
        raise HTTPException(status_code=400, detail="Query cannot be empty")

    try:
        llm = get_llm(request.model)
    except HTTPException as e:
        raise

    async def event_generator() -> AsyncGenerator[str, None]:
        user_query = request.query.strip()
        graph = build_orchestrator_graph(llm)
        initial_state = OrchestratorState(user_query=user_query)
        
        try:
            # Yield start event
            yield _sse({"agent": "system", "status": "started", "message": "Starting market exploration...", "data": {"query": user_query}})

            # Collect all state to track emitted events
            emitted_event_ids: set[str] = set()
            final_state_data = {}

            async for chunk in graph.astream(initial_state):
                for node_name, node_output in chunk.items():
                    if not isinstance(node_output, dict):
                        continue

                    # Emit agent events
                    for event in node_output.get("events", []):
                        event_dict = event.model_dump() if hasattr(event, "model_dump") else event
                        event_id = f"{event_dict.get('agent')}_{event_dict.get('status')}_{event_dict.get('message', '')[:30]}"
                        if event_id not in emitted_event_ids:
                            emitted_event_ids.add(event_id)
                            yield _sse(event_dict)
                            await asyncio.sleep(0)  # yield control to event loop

                    # Track final state data
                    if "final_report" in node_output:
                        final_state_data["final_report"] = node_output["final_report"]
                    if "query_summary" in node_output:
                        final_state_data["query_summary"] = node_output["query_summary"]
                    if "agents_executed" in node_output:
                        final_state_data["agents_executed"] = node_output["agents_executed"]
                    if "planner_reasoning" in node_output:
                        final_state_data["planner_reasoning"] = node_output["planner_reasoning"]
                    if "market_data" in node_output and node_output["market_data"]:
                        final_state_data["market_data"] = node_output["market_data"]
                    if "signal_data" in node_output and node_output["signal_data"]:
                        final_state_data["signal_data"] = node_output["signal_data"]

            # Yield final completion event with full report
            yield _sse({
                "agent": "system",
                "status": "done",
                "message": "Exploration complete. Final report ready.",
                "data": {
                    "final_report": final_state_data.get("final_report", ""),
                    "agents_executed": final_state_data.get("agents_executed", []),
                    "query_summary": final_state_data.get("query_summary"),
                    "key_markets": final_state_data.get("market_data", {}).get("key_markets", []) if final_state_data.get("market_data") else [],
                    "market_size_usd_bn": final_state_data.get("market_data", {}).get("market_size") if final_state_data.get("market_data") else None,
                    "growth_rate_pct": final_state_data.get("market_data", {}).get("growth_rate") if final_state_data.get("market_data") else None,
                    "signal_stats": final_state_data.get("signal_data", {}).get("signal_stats") if final_state_data.get("signal_data") else None,
                    "planner_reasoning": final_state_data.get("planner_reasoning", ""),
                },
            })

        except Exception as e:
            yield _sse({
                "agent": "system",
                "status": "error",
                "message": f"Orchestration error: {str(e)}",
                "data": None,
            })

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
        },
    )


def _sse(data: dict) -> str:
    """Format a dict as a Server-Sent Events message."""
    return f"data: {json.dumps(data, ensure_ascii=False)}\n\n"

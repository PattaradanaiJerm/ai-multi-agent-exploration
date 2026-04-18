# AI Multi-Agent Market Exploration System

A full-stack prototype that uses **multiple AI agents** to help users explore market insights, industry trends, and recent news — dynamically orchestrated based on user intent.

---

## System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                        User (Browser)                   │
│                    Next.js Frontend :3001               │
└───────────────────────────┬─────────────────────────────┘
                            │ HTTP / SSE
┌───────────────────────────▼─────────────────────────────┐
│                   NestJS Backend :5001                   │
│         (Sessions, History, DB, AI Orchestration)        │
└──────────────┬────────────────────────┬─────────────────┘
               │ PostgreSQL             │ HTTP / SSE
┌──────────────▼────────┐  ┌───────────▼─────────────────┐
│  PostgreSQL DB :5433  │  │  Python AI Agent Service    │
│  (Sessions, Reports,  │  │  FastAPI + LangGraph :8000  │
│   Events, Stats)      │  │                             │
└───────────────────────┘  │  ┌──────────────────────┐   │
                           │  │  Orchestrator (LLM)  │   │
                           │  │  Dynamic Planner      │   │
                           │  └──────────┬───────────┘   │
                           │             │                │
                           │  ┌──────────▼───────────┐   │
                           │  │  Agent Pool          │   │
                           │  │  • Query Understanding│   │
                           │  │  • Market Retrieval   │   │
                           │  │  • Signal Analysis    │   │
                           │  └──────────────────────┘   │
                           └─────────────────────────────┘
```

### Services

| Service    | Technology            | Port  | Description                          |
|------------|-----------------------|-------|--------------------------------------|
| Frontend   | Next.js 14, Tailwind  | 3001  | Chat UI with real-time streaming     |
| Backend    | NestJS 10, Prisma 5   | 5001  | API, session management, DB layer    |
| AI Agents  | Python, FastAPI, LangGraph | 8000 | Multi-agent orchestration engine |
| Database   | PostgreSQL 16         | 5433  | Persistent sessions & reports        |
| pgAdmin    | pgAdmin 4             | 5050  | Database management UI               |

---

## AI Agent Design

### Agent Orchestrator (Dynamic Planner)
The core of the system. Uses an **LLM as a Planner** (LangGraph StateGraph) to:
1. Analyze the user query
2. Decide **which agents** to invoke
3. Decide the **order** of execution
4. Aggregate results into a final report

The execution plan is generated dynamically per query — no hardcoded sequences.

---

### Agent 1 — Query Understanding Agent
**Role:** Interprets the user's natural language query and extracts structured intent.

**Input:** Raw user query string

**Output:**
```json
{
  "topic": "Agricultural products",
  "region": "Southeast Asia",
  "intent": "market_exploration",
  "information_needed": ["key_markets", "industry_insights", "recent_news"]
}
```

**When invoked:** Always first, unless the query is already understood.

---

### Agent 2 — Market Information Retrieval Agent
**Role:** Retrieves market data, key markets, industry trends, and opportunities.

**Input:** Structured query from Agent 1

**Output:**
- Key markets identified (countries/regions)
- Market size estimate (USD bn)
- Growth rate (%)
- Industry context and opportunities
- World Bank data enrichment (via public API)

**When invoked:** When the user wants market insights, industry overview, or key market identification.

---

### Agent 3 — External Signal / News Analysis Agent
**Role:** Analyzes recent news, events, and external signals affecting the market.

**Input:** Topic, region, and key markets from previous agents

**Output:**
- Recent news articles per market
- Signal statistics (bullish/bearish/neutral)
- Regional signal summary
- Overall sentiment

**When invoked:** When the user asks about recent developments, news, trends, or external events.

---

## Design Decisions

### Dynamic Orchestration over Fixed Pipelines
Instead of hardcoded `if-else` or sequential agent calls, the system uses an **LLM Planner** node in LangGraph that reads the current state and generates an execution plan. This allows the system to:
- Skip agents that are not relevant (e.g., skip news analysis for a pure market overview query)
- Re-plan mid-execution if new context changes the requirements
- Easily add new agents without modifying orchestration logic

### Real-time Streaming (SSE)
Agent events are streamed to the frontend via **Server-Sent Events** as each agent starts, thinks, and completes. This makes the AI reasoning process visible to users in real-time.

### Persistent Session History
All explorations are saved to PostgreSQL after the stream completes. Users can revisit past sessions from the sidebar.

### GitHub Models as LLM Provider
Uses `https://models.inference.ai.azure.com` via GitHub Models — supports both GPT-4o-mini and GPT-4o without requiring an OpenAI subscription.

---

## Running Instructions

### Prerequisites
- Docker & Docker Compose installed
- GitHub personal access token (for GitHub Models API)

### 1. Clone the repository
```bash
git clone <repository-url>
cd scg_exam2
```

### 2. Configure environment variables

**AI Agents service:**
```bash
cp ai-agents/.env.example ai-agents/.env
# Edit ai-agents/.env and set your GITHUB_TOKEN
```

**Backend service:**
```bash
cp backend/.env.example backend/.env
# No changes needed for local Docker run
```

**Frontend service:**
```bash
cp frontend/.env.example frontend/.env.local
# No changes needed for local Docker run
```

### 3. Start all services
```bash
docker-compose up --build
```

### 4. Access the application

| Service      | URL                        |
|--------------|----------------------------|
| Frontend     | http://localhost:3001       |
| Backend API  | http://localhost:5001       |
| AI Agents    | http://localhost:8000       |
| pgAdmin      | http://localhost:5050       |
| API Docs     | http://localhost:8000/docs  |

**pgAdmin credentials:** `admin@admin.com` / `admin`

---

## Project Structure

```
scg_exam2/
├── docker-compose.yml
├── README.md
│
├── ai-agents/              # Python FastAPI + LangGraph
│   ├── main.py             # FastAPI server, /api/explore endpoints
│   ├── orchestrator/
│   │   └── orchestrator.py # LangGraph StateGraph + LLM Planner
│   ├── agents/
│   │   ├── query_understanding_agent.py
│   │   ├── market_retrieval_agent.py
│   │   └── signal_analysis_agent.py
│   ├── tools/
│   │   └── agent_tools.py  # News fetch, market data tools
│   └── requirements.txt
│
├── backend/                # NestJS + Prisma
│   ├── src/
│   │   ├── exploration/    # Exploration controller & service
│   │   └── sessions/       # Session management
│   └── prisma/
│       └── schema.prisma   # DB schema
│
└── frontend/               # Next.js 14
    ├── src/
    │   ├── app/[locale]/   # Locale-based routing (EN/TH)
    │   ├── components/
    │   │   ├── chat/       # ChatArea, ChatInput, MessageBubble
    │   │   ├── layout/     # Navbar, Sidebar
    │   │   └── ui/         # ModelSelector, AgentStatusPanel
    │   ├── store/          # Zustand state (chat, model)
    │   └── lib/api.ts      # Backend API client
    └── public/             # Static assets (logo, avatars)
```

---

## Evaluation Criteria Coverage

| Criteria              | Implementation                                               |
|-----------------------|--------------------------------------------------------------|
| System Architecture   | LangGraph StateGraph, SSE streaming, PostgreSQL persistence  |
| AI Agent Design       | LLM Planner with dynamic routing, 3 specialized agents       |
| Backend Engineering   | NestJS + Prisma ORM, session history, stream buffering       |
| Frontend Usability    | Real-time streaming UI, session sidebar, EN/TH localization  |
| Documentation         | This README                                                  |

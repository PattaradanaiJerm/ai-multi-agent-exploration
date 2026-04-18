# How to Run — AI Multi-Agent Market Exploration System

## Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running
- Git installed

---

## Step 1 — Clone the Repository

```bash
git clone https://github.com/PattaradanaiJerm/ai-multi-agent-exploration.git
cd ai-multi-agent-exploration
```

---

## Step 2 — Create Environment File (Required)

Create a file at **`ai-agents/.env`** with the following content:

```
GITHUB_TOKEN=<provided_separately_via_email>
OPENAI_BASE_URL=https://models.inference.ai.azure.com
OPENAI_MODEL=gpt-4o-mini
HOST=0.0.0.0
PORT=8000
```

> ⚠️ The `GITHUB_TOKEN` value is provided separately in the submission email.  
> A reference template is available at `ai-agents/.env.example`.

---

## Step 3 — Start All Services

```bash
docker-compose up --build
```

> First-time build may take 3–5 minutes.

---

## Step 4 — Access the Application

| Service          | URL                          |
|------------------|------------------------------|
| **Frontend (UI)**| http://localhost:3001        |
| Backend API      | http://localhost:5001        |
| AI Agents API    | http://localhost:8000/docs   |
| pgAdmin (DB UI)  | http://localhost:5050        |

**pgAdmin login:** `admin@admin.com` / `admin`

---

## Example Queries to Try

- `Explore market insights for agricultural products in Southeast Asia`
- `Analyze car spare parts market opportunities in South Asia`
- `What are the latest developments in convenience food market in ASEAN?`

---

## Stopping the System

```bash
docker-compose down
```

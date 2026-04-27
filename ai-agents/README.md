# AI Multi-Agent Market Exploration System

ระบบ Multi-Agent สำหรับวิเคราะห์และสำรวจข้อมูลตลาดแบบอัจฉริยะ โดยใช้ LangGraph ร่วมกับ LLM (GPT-4o) ในการประสานงานระหว่าง Agent หลายตัวแบบ Dynamic

---

## โครงสร้างโฟลเดอร์

```
ai-agents/
├── main.py                         # FastAPI Server (entry point)
├── requirements.txt                # Python dependencies
├── Dockerfile                      # Docker build instructions
├── .env                            # Environment variables (ไม่ commit)
├── .env.example                    # ตัวอย่าง env variables
│
├── orchestrator/
│   └── orchestrator.py             # ตัวควบคุมหลัก (LangGraph-based)
│
├── agents/
│   ├── query_understanding_agent.py  # Agent วิเคราะห์คำถาม
│   ├── market_retrieval_agent.py     # Agent ดึงข้อมูลตลาด
│   └── signal_analysis_agent.py      # Agent วิเคราะห์ข่าวและสัญญาณ
│
├── tools/
│   └── agent_tools.py              # LangChain Tools สำหรับดึงข้อมูล
│
└── data/
    ├── mock_market_data.py          # ข้อมูลตลาด Mock
    └── mock_news_data.py            # ข้อมูลข่าว Mock
```

---

## รายละเอียดแต่ละไฟล์

### `main.py` — FastAPI Server (Entry Point)
จุดเริ่มต้นของระบบ ทำหน้าที่เป็น HTTP Server รับ request จาก Frontend/Backend

| Endpoint | Method | หน้าที่ |
|---|---|---|
| `/api/explore` | POST | รัน Orchestrator แบบปกติ รอผลแล้วส่งกลับทีเดียว |
| `/api/explore/stream` | POST | รัน Orchestrator แบบ SSE Streaming ส่ง event ของแต่ละ Agent แบบ real-time |
| `/api/health` | GET | ตรวจสอบสถานะของ server |

- รับ `query` และ `model` (optional: `gpt-4o-mini` หรือ `gpt-4o`) จาก request
- เชื่อมต่อกับ GitHub Models Endpoint ผ่าน `GITHUB_TOKEN`

---

### `orchestrator/orchestrator.py` — Dynamic Orchestrator (สมองหลักของระบบ)
ควบคุมการทำงานของ Agent ทั้งหมดโดยใช้ **LangGraph StateGraph**

**วิธีทำงาน:**
1. **Planner Node** — ใช้ LLM วิเคราะห์ query และตัดสินใจว่าต้องเรียก Agent ใดบ้าง และเรียงลำดับอย่างไร
2. **Agent Nodes** — รันแต่ละ Agent ตาม plan ที่ Planner กำหนด
3. **Aggregator Node** — รวมผลลัพธ์จากทุก Agent แล้วสรุปเป็น Final Report

**Flow:**
```
START → Planner → [QueryUnderstanding | MarketRetrieval | SignalAnalysis] → Aggregator → END
                        ↑_____________(วนซ้ำจนครบ plan)______________↑
```

**State ที่ใช้ร่วมกัน (`OrchestratorState`):**
- `user_query` — คำถามจากผู้ใช้
- `execution_plan` — ลำดับ Agent ที่จะรัน
- `query_summary` / `market_data` / `signal_data` — ผลลัพธ์จากแต่ละ Agent
- `final_report` — รายงานสรุปขั้นสุดท้าย
- `events` — stream events สำหรับ real-time UI update

---

### `agents/query_understanding_agent.py` — Query Understanding Agent
**หน้าที่:** วิเคราะห์คำถามดิบจากผู้ใช้และแปลงเป็นโครงสร้างที่ Agent อื่นใช้ต่อได้

**Output (`QuerySummary`):**
| Field | ความหมาย |
|---|---|
| `topic` | หมวดสินค้าหรือตลาดที่ถามถึง เช่น "agricultural products" |
| `region` | ภูมิภาคที่สนใจ เช่น "Southeast Asia" |
| `intent` | เป้าหมายของผู้ใช้ |
| `information_needed` | ประเภทข้อมูลที่ต้องการ |
| `key_countries` | ประเทศที่เกี่ยวข้อง |
| `analysis_depth` | ความลึกของการวิเคราะห์ (`overview` / `detailed` / `specific`) |

---

### `agents/market_retrieval_agent.py` — Market Retrieval Agent
**หน้าที่:** ดึงและสังเคราะห์ข้อมูลตลาดจาก topic และ region ที่ได้รับ

**ขั้นตอน:**
1. เรียก `retrieve_market_insights` tool เพื่อดึงข้อมูล (จาก World Bank API หรือ mock data)
2. ส่งข้อมูลดิบให้ LLM สังเคราะห์เป็น Market Insights Report

**Output Report มี:**
- Regional market overview
- Key markets รายประเทศ (market size, growth trend)
- Industry trends & growth drivers
- Market opportunities & challenges

---

### `agents/signal_analysis_agent.py` — Signal Analysis Agent
**หน้าที่:** ดึงและวิเคราะห์ข่าวสารและสัญญาณภายนอกที่กระทบตลาด

**ขั้นตอน:**
1. เรียก `retrieve_news_signals` tool เพื่อดึงข่าวล่าสุด (จาก Google News RSS หรือ mock data)
2. กรองข่าวตาม key markets ที่ agent ก่อนหน้าระบุ
3. สังเคราะห์เป็น External Signal Analysis Report

**Output Report มี:**
- สรุป key recent developments รายประเทศ
- Sentiment analysis (positive / negative / cautious / disruptive)
- High-impact signals
- Risk factors & opportunity signals
- Regional outlook

---

### `tools/agent_tools.py` — LangChain Tools
**หน้าที่:** เป็น interface สำหรับดึงข้อมูลจริงหรือ mock data ที่ Agent เรียกใช้

**Tools ที่มี:**

| Tool | หน้าที่ |
|---|---|
| `retrieve_market_insights` | ดึงข้อมูลตลาด — ลอง World Bank API ก่อน ถ้าไม่ได้ใช้ mock |
| `retrieve_news_signals` | ดึงข่าว — ลอง Google News RSS ก่อน ถ้าไม่ได้ใช้ mock |

**Data Strategy:**
1. เรียก World Bank Indicators API (GDP, trade data) สำหรับข้อมูลเศรษฐกิจ
2. เรียก Google News RSS สำหรับข่าวล่าสุด
3. ถ้า API ไม่ตอบสนองหรือ timeout → ใช้ mock data แทน (graceful fallback)

---

### `data/mock_market_data.py` — Mock Market Data
**หน้าที่:** เก็บข้อมูลตลาด mock ที่จำลองตามข้อมูลจริง เป็น fallback เมื่อ API ไม่พร้อม

ครอบคลุม:
- ข้อมูลเกษตรกรรม (Agricultural) ใน Southeast Asia, South Asia
- ข้อมูล Car Spare Parts ใน Southeast Asia
- ข้อมูล Convenience Food ในตลาดต่างๆ

---

### `data/mock_news_data.py` — Mock News Data
**หน้าที่:** เก็บข้อมูลข่าว mock จำลองข่าวจริงพร้อม sentiment และ impact level เป็น fallback เมื่อ Google News ไม่พร้อม

แต่ละข่าวมี: `headline`, `source`, `country`, `sentiment`, `impact`, `summary`, `tags`

---

### `requirements.txt` — Python Dependencies

| Package | หน้าที่ |
|---|---|
| `langchain` / `langchain-core` / `langchain-openai` | LLM framework |
| `langgraph` | Graph-based agent orchestration |
| `fastapi` + `uvicorn` | HTTP server |
| `pydantic` | Data validation & schema |
| `httpx` | Async HTTP client สำหรับเรียก external APIs |
| `python-dotenv` | โหลด `.env` file |

---

## Environment Variables (`.env`)

```env
GITHUB_TOKEN=<your_github_token>
OPENAI_BASE_URL=https://models.inference.ai.azure.com
OPENAI_MODEL=gpt-4o-mini
```

---

## การรัน (Local)

```bash
# ติดตั้ง dependencies
pip install -r requirements.txt

# รัน server
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

## การรันด้วย Docker

```bash
docker build -t ai-agents .
docker run -p 8000:8000 --env-file .env ai-agents
```

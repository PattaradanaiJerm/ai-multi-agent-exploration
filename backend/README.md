# Backend — NestJS API Server

NestJS Backend สำหรับระบบ AI Multi-Agent Market Exploration ทำหน้าที่เป็นตัวกลางระหว่าง Frontend กับ Python AI Service รวมถึงบันทึกและจัดการข้อมูลผ่าน PostgreSQL

---

## โครงสร้างโฟลเดอร์

```
backend/
├── main.ts                         # Entry point
├── app.module.ts                   # Root module
├── package.json                    # Node.js dependencies
├── nest-cli.json                   # NestJS CLI config
├── tsconfig.json / tsconfig.build.json
├── Dockerfile
├── .env / .env.example
│
├── prisma/
│   └── schema.prisma               # Database schema (PostgreSQL)
│
└── src/
    ├── main.ts
    ├── app.module.ts
    │
    ├── ai/                         # เชื่อมต่อกับ Python AI Service
    │   ├── ai.module.ts
    │   └── ai.service.ts
    │
    ├── session/                    # จัดการ Chat Session
    │   ├── session.controller.ts
    │   ├── session.module.ts
    │   ├── session.service.ts
    │   └── dto/session.dto.ts
    │
    ├── exploration/                # จัดการ Market Exploration Report
    │   ├── exploration.controller.ts
    │   ├── exploration.module.ts
    │   ├── exploration.service.ts
    │   └── dto/create-exploration.dto.ts
    │
    └── prisma/                     # Prisma DB Client wrapper
        ├── prisma.module.ts
        └── prisma.service.ts
```

---

## รายละเอียดแต่ละไฟล์

### `src/main.ts` — Entry Point
จุดเริ่มต้นของ NestJS Application

- เปิดใช้งาน **Global Validation Pipe** (whitelist + transform)
- ตั้งค่า **CORS** สำหรับรับ request จาก Frontend
- สร้าง **Swagger UI** ที่ `/api/docs` สำหรับทดสอบ API
- รันบนพอร์ตที่กำหนดใน `PORT` env (default: `3000`)

---

### `src/app.module.ts` — Root Module
รวม Module ทั้งหมดเข้าด้วยกัน

| Module | หน้าที่ |
|---|---|
| `ConfigModule` | โหลด `.env` แบบ global |
| `PrismaModule` | เชื่อมต่อ Database |
| `AiModule` | เชื่อมต่อ Python AI Service |
| `SessionModule` | CRUD สำหรับ Chat Session |
| `ExplorationModule` | รัน exploration และจัดการ report |

---

### `src/ai/ai.service.ts` — AI Service Client
ทำหน้าที่เป็น HTTP client สำหรับเรียก **Python AI Service**

| Method | หน้าที่ |
|---|---|
| `explore(query)` | POST ไปที่ `/api/explore` — รอผลครบแล้วส่งคืน |
| `getStreamUrl()` | คืน URL ของ `/api/explore/stream` สำหรับ proxy streaming |

- อ่าน `AI_SERVICE_URL` จาก env (default: `http://localhost:8000`)
- timeout 2 นาทีสำหรับ LLM calls

---

### `src/session/` — Session Module
จัดการ **Chat Session** ที่ใช้จัดกลุ่ม exploration หลายๆ ครั้งเข้าด้วยกัน

#### `session.controller.ts`

| Endpoint | Method | หน้าที่ |
|---|---|---|
| `/api/sessions` | POST | สร้าง session ใหม่ |
| `/api/sessions` | GET | ดึงรายการ session ทั้งหมด (เรียงล่าสุดก่อน) |
| `/api/sessions/:id` | GET | ดึง session พร้อม exploration และ agent events ทั้งหมด |
| `/api/sessions/:id` | PATCH | แก้ไขชื่อ session |
| `/api/sessions/:id` | DELETE | ลบ session และ exploration ทั้งหมดที่เกี่ยวข้อง |

#### `session.service.ts`
Business logic สำหรับ session — CRUD ผ่าน PrismaService

#### `dto/session.dto.ts`
- `CreateSessionDto` — `title` (optional, max 200 chars)
- `UpdateSessionDto` — `title` (required)

---

### `src/exploration/` — Exploration Module
จัดการ **Market Exploration Report** ที่เกิดจากการรัน AI Agents

#### `exploration.controller.ts`

| Endpoint | Method | หน้าที่ |
|---|---|---|
| `/api/explorations` | POST | รัน multi-agent exploration แบบปกติ บันทึกผลลัพธ์ใน DB |
| `/api/explorations/stream` | POST | Proxy SSE streaming จาก Python AI Service ส่ง event แบบ real-time ไปยัง Frontend แล้วบันทึกผลหลัง stream จบ |
| `/api/explorations/:id` | GET | ดึง exploration report ตาม ID |
| `/api/explorations/:id` | DELETE | ลบ exploration report |

**Streaming Flow:**
```
Frontend → POST /api/explorations/stream
    → Backend proxy → Python AI Service (SSE)
    → Backend เก็บ events ทั้งหมด
    → หลัง stream จบ บันทึกลง DB อัตโนมัติ
```

#### `exploration.service.ts`
Business logic สำหรับ exploration:
1. ตรวจสอบว่า session มีอยู่จริง
2. สร้าง record สถานะ `PENDING` ใน DB ก่อน
3. เรียก `AiService.explore()` รอผลจาก Python AI
4. บันทึก `AgentEvent` และ `SignalStats` พร้อม `ExplorationReport` ที่สมบูรณ์
5. Auto-set ชื่อ session จาก query แรก ถ้ายังไม่มีชื่อ

#### `dto/create-exploration.dto.ts`
- `sessionId` — UUID ของ session ที่ต้องการผูก
- `query` — คำถาม natural language จากผู้ใช้ (max 1000 chars)

---

### `src/prisma/prisma.service.ts` — Prisma Service
Wrapper ของ `PrismaClient` สำหรับ NestJS dependency injection

- เชื่อมต่อ DB เมื่อ module เริ่มต้น (`onModuleInit`)
- ตัดการเชื่อมต่อเมื่อ module ถูก destroy (`onModuleDestroy`)

---

### `prisma/schema.prisma` — Database Schema

#### ตาราง `sessions`
| Field | Type | หมายเหตุ |
|---|---|---|
| `id` | UUID | Primary key |
| `title` | String? | ชื่อ session (auto-generated จาก query แรก) |
| `createdAt` / `updatedAt` | DateTime | timestamps |

#### ตาราง `exploration_reports`
| Field | Type | หมายเหตุ |
|---|---|---|
| `id` | UUID | Primary key |
| `sessionId` | UUID | Foreign key → sessions |
| `query` | String | คำถามจากผู้ใช้ |
| `topic` / `region` | String? | จาก Query Understanding Agent |
| `keyMarkets` | String[] | รายชื่อตลาดสำคัญ |
| `marketSizeUsdBn` / `growthRatePct` | Float? | ขนาดตลาดและอัตราการเติบโต |
| `finalReport` | Text | รายงานสรุปจาก AI |
| `agentsExecuted` | String[] | ลำดับ agents ที่รัน |
| `status` | Enum | `PENDING` / `COMPLETED` / `ERROR` |

#### ตาราง `agent_events`
บันทึก event แต่ละขั้นตอนของ agents สำหรับแสดง thinking process บน UI

| Field | หมายเหตุ |
|---|---|
| `agent` | ชื่อ agent เช่น `query_understanding` |
| `status` | `started` / `completed` / `error` |
| `data` | JSON output ของ agent |

#### ตาราง `signal_stats`
สถิติจาก Signal Analysis Agent

| Field | หมายเหตุ |
|---|---|
| `totalSignals` | จำนวนข่าวทั้งหมด |
| `positiveSignals` / `negativeSignals` / `cautiousSignals` | แยกตาม sentiment |
| `highImpactSignals` | จำนวนสัญญาณ high impact |
| `countriesCovered` | ประเทศที่ครอบคลุม |

---

## Environment Variables (`.env`)

```env
DATABASE_URL=postgresql://user:password@localhost:5432/scg_exam
AI_SERVICE_URL=http://localhost:8000
PORT=3000
```

---

## การรัน (Local)

```bash
# ติดตั้ง dependencies
npm install

# migrate database
npx prisma migrate dev

# รัน development server
npm run start:dev
```

## การรันด้วย Docker

```bash
docker build -t backend .
docker run -p 3000:3000 --env-file .env backend
```

## Swagger UI

เมื่อ server รันแล้ว เปิด [http://localhost:3000/api/docs](http://localhost:3000/api/docs)

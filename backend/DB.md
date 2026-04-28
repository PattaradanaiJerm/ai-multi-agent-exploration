# DB ↔ Backend Relations

## คำอธิบายแต่ละตาราง

| ตาราง | เก็บอะไร |
|-------|---------|
| `sessions` | Chat session — กลุ่มการสนทนาของผู้ใช้ เหมือน "โฟลเดอร์" ที่รวม queries หลายอันไว้ด้วยกัน |
| `exploration_reports` | ผลลัพธ์จากการรัน AI agents ต่อ 1 query ได้แก่ topic, region, key markets, market size, final report |
| `agent_events` | Event ย่อยของแต่ละ agent ระหว่าง exploration เช่น started/completed ใช้แสดง "กระบวนการคิด" บน UI |
| `signal_stats` | สถิติสัญญาณข่าวจาก Signal Analysis Agent เช่น จำนวน positive/negative/cautious signals |
| `_prisma_migrations` | ประวัติการ migrate schema ของ Prisma (จัดการโดยอัตโนมัติ ไม่ต้อง touch) |

---

## ER Diagram

```
sessions (1) ──────────────── (N) exploration_reports
                                        │
                              ┌─────────┴─────────┐
                              │                   │
                         (N) agent_events    (1) signal_stats
```

---

## ตาราง → Service/Controller

| ตาราง DB | Service ที่ใช้ | Controller (Endpoint) |
|----------|---------------|-----------------------|
| `sessions` | `SessionService` | `POST /api/sessions` — สร้าง session ใหม่ |
| | | `GET /api/sessions` — ดูรายการทั้งหมด |
| | | `GET /api/sessions/:id` — ดู session + explorations + events |
| | | `PATCH /api/sessions/:id` — เปลี่ยนชื่อ |
| | | `DELETE /api/sessions/:id` — ลบ (cascade) |
| `exploration_reports` | `ExplorationService` | `POST /api/explorations` — รัน AI แบบปกติ + บันทึก DB |
| | | `POST /api/explorations/stream` — Proxy SSE + บันทึก DB หลัง stream จบ |
| | | `GET /api/explorations/session/:id` — ดึง explorations ทั้งหมดของ session |
| | | `DELETE /api/explorations/:id` — ลบ report |
| `agent_events` | `ExplorationService` | สร้างอัตโนมัติตอน exploration เสร็จ (ไม่มี endpoint แยก) |
| `signal_stats` | `ExplorationService` | สร้างอัตโนมัติตอน exploration เสร็จ (ไม่มี endpoint แยก) |

---

## Foreign Keys & Relations

| Relation | FK | On Delete |
|----------|----|-----------|
| `exploration_reports` → `sessions` | `sessionId` | CASCADE |
| `agent_events` → `exploration_reports` | `reportId` | CASCADE |
| `signal_stats` → `exploration_reports` | `reportId` | CASCADE |

---

## Flow การบันทึกข้อมูล

```
POST /api/explorations/stream
    │
    ├─ 1. ตรวจสอบ session มีอยู่ใน sessions
    ├─ 2. สร้าง exploration_reports (status = PENDING)
    ├─ 3. Auto-set session title (ถ้ายังว่าง) → update sessions
    ├─ 4. Proxy SSE → Python FastAPI → stream events ไปที่ Frontend
    ├─ 5. หลัง stream จบ → update exploration_reports (status = COMPLETED)
    ├─ 6. บันทึก agent_events (ทุก event ของทุก agent)
    └─ 7. บันทึก signal_stats (ถ้ามี)
```

---

## Prisma Models → TypeScript

| Prisma Model | ใช้ใน Service |
|-------------|--------------|
| `prisma.session` | `SessionService` |
| `prisma.explorationReport` | `ExplorationService` |
| `prisma.agentEvent` | `ExplorationService` (nested create) |
| `prisma.signalStats` | `ExplorationService` (nested create) |

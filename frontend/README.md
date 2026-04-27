# Frontend — Next.js Web Application

Next.js 14 Frontend สำหรับระบบ AI Multi-Agent Market Exploration รองรับ SSE streaming แบบ real-time, Dark/Light theme, และ i18n (ภาษาไทย/อังกฤษ)

---

## โครงสร้างโฟลเดอร์

```
frontend/
├── next.config.mjs             # Next.js config
├── tailwind.config.ts          # Tailwind CSS config
├── tsconfig.json               # TypeScript config
├── package.json
├── Dockerfile
├── .env.local / .env.example
│
├── public/
│   ├── ai-profile/             # รูป avatar ของ AI agents แต่ละตัว
│   ├── circle-avatar/          # รูป avatar ผู้ใช้และ AI ใน chat
│   └── logo/                   # โลโก้ SCG / mini logo
│
└── src/
    ├── middleware.ts            # Next-intl locale middleware
    ├── declarations.d.ts        # CSS module type declarations
    │
    ├── app/
    │   ├── globals.css          # Global styles + CSS variables (theme)
    │   └── [locale]/
    │       ├── layout.tsx       # Root layout (Navbar + Sidebar + ThemeProvider)
    │       ├── page.tsx         # หน้าหลัก (Welcome screen + ช่อง input)
    │       └── session/
    │           └── [sessionId]/
    │               └── page.tsx # หน้า chat ของแต่ละ session
    │
    ├── components/
    │   ├── chat/
    │   │   ├── ChatArea.tsx         # พื้นที่แสดง message ทั้งหมด
    │   │   ├── ChatInput.tsx        # ช่องพิมพ์คำถาม + เลือก model
    │   │   ├── AgentTimeline.tsx    # แสดง agent events แบบ timeline
    │   │   └── WelcomeScreen.tsx    # หน้าต้อนรับตอนยังไม่มี message
    │   ├── layout/
    │   │   ├── Navbar.tsx           # Top navigation bar
    │   │   └── Sidebar.tsx          # Sidebar แสดง session history
    │   ├── providers/
    │   │   └── ThemeProvider.tsx    # Dark/Light theme context
    │   ├── report/
    │   │   └── ReportView.tsx       # แสดงผล final report + stat cards
    │   └── ui/
    │       ├── AgentStatusPanel.tsx # แสดงสถานะ agents แต่ละตัว
    │       ├── LanguageSwitcher.tsx # สลับภาษา EN/TH
    │       ├── ModelSelector.tsx    # เลือก GPT model
    │       └── ThemeToggle.tsx      # ปุ่มสลับ Dark/Light
    │
    ├── i18n/
    │   ├── routing.ts           # กำหนด locales และ defaultLocale
    │   └── request.ts           # next-intl server config
    │
    ├── lib/
    │   └── api.ts               # HTTP client functions เรียก Backend API
    │
    ├── messages/
    │   ├── en.json              # ข้อความภาษาอังกฤษ
    │   └── th.json              # ข้อความภาษาไทย
    │
    ├── store/
    │   ├── chat.store.ts        # Zustand store สำหรับ chat state
    │   └── model.store.ts       # Zustand store สำหรับ model ที่เลือก
    │
    └── types/
        └── index.ts             # TypeScript type definitions
```

---

## รายละเอียดแต่ละไฟล์

### `src/middleware.ts` — Locale Middleware
ใช้ `next-intl` ดักจับ request ทุกอัน และ redirect ไปยัง locale ที่ถูกต้อง (เช่น `/` → `/en/`)
- รองรับ locale: `en`, `th`
- default locale: `en`

---

### `src/app/globals.css` — Global Styles
กำหนด CSS variables สำหรับ theme system (Dark/Light mode)

| Variable | ความหมาย |
|---|---|
| `--bg-primary` / `--bg-secondary` / `--bg-sidebar` | สีพื้นหลัง |
| `--text-primary` / `--text-muted` | สีตัวอักษร |
| `--accent` | สีหลัก (indigo) |
| `--border` | สีเส้นขอบ |
| `--success` / `--error` / `--warning` | สีสถานะ |

---

### `src/app/[locale]/layout.tsx` — Root Layout
Layout หลักที่ครอบทุกหน้า ประกอบด้วย:
- `NextIntlClientProvider` — inject ข้อความ i18n ให้ client components
- `ThemeProvider` — จัดการ dark/light mode
- `Navbar` — navigation bar ด้านบน
- `Sidebar` — sidebar ด้านซ้ายแสดง session history

---

### `src/app/[locale]/page.tsx` — หน้าหลัก
แสดง `ChatArea` + `ChatInput` สำหรับเริ่ม exploration ใหม่

---

### `src/app/[locale]/session/[sessionId]/page.tsx` — หน้า Session
แสดง chat ของ session ที่เลือก — โหลด explorations ของ session นั้นจาก store เมื่อ mount

---

## Components

### `components/chat/ChatArea.tsx`
พื้นที่หลักของ chat แสดง message ทั้งหมดใน session

- **User bubble** — แสดงคำถามของผู้ใช้ (ชิดขวา พร้อม avatar)
- **Exploration card** — แสดง `AgentTimeline` ระหว่าง streaming + `ReportView` เมื่อเสร็จ
- Auto-scroll ลงล่างเมื่อมี message ใหม่

---

### `components/chat/ChatInput.tsx`
ช่องพิมพ์คำถามพร้อมฟีเจอร์ครบชุด:
- Textarea auto-resize ตามเนื้อหา
- ส่งด้วย `Enter` (Shift+Enter ขึ้นบรรทัดใหม่)
- เลือก model (`gpt-4o-mini` / `gpt-4o`) ผ่าน dropdown
- ปุ่ม Voice input (Web Speech API)
- Disable ระหว่าง streaming

---

### `components/chat/AgentTimeline.tsx`
แสดง event ของแต่ละ agent เป็น timeline แบบ real-time ระหว่าง SSE streaming

| Agent | Icon | สี |
|---|---|---|
| `orchestrator` | Brain | Indigo |
| `query_understanding` | Search | Green |
| `market_retrieval` | BarChart | Cyan |
| `signal_analysis` | Newspaper | Yellow |
| `aggregator` | FileText | Pink |

แต่ละ event มี status dot:
- `started` — วงกลมกระพริบ (blinking)
- `completed` — เครื่องหมายถูกสีเขียว
- `error` — X สีแดง
- `planned` — ฟ้าผ่า (Zap icon)

---

### `components/chat/WelcomeScreen.tsx`
หน้าต้อนรับเมื่อยังไม่มี message แสดง example queries ที่คลิกได้เพื่อส่งทันที

---

### `components/layout/Navbar.tsx`
Top bar แสดงโลโก้ + ชื่อระบบ + `LanguageSwitcher` + `ThemeToggle`

---

### `components/layout/Sidebar.tsx`
Sidebar แสดง session history รองรับ:
- ปุ่ม "New Exploration" — สร้าง session ใหม่
- รายการ sessions พร้อม timestamp
- ปุ่มลบแต่ละ session
- `AgentStatusPanel` ด้านล่าง

---

### `components/report/ReportView.tsx`
แสดงผลลัพธ์ final exploration รวมถึง:
- **Stat cards** — Market Size, Growth Rate, Key Markets, Signals
- **Agents executed** — แสดง badges สีของแต่ละ agent ที่รัน
- **Final Report** — render Markdown ด้วย `react-markdown` + `remark-gfm`
- ปุ่ม Copy report

---

### `components/ui/AgentStatusPanel.tsx`
Panel ใน sidebar แสดงรูป avatar และสถานะ live ของ agents ทั้ง 3 ตัว (Query Understanding, Market Retrieval, Signal Analysis) ระหว่าง streaming

---

## Store (Zustand)

### `store/chat.store.ts`
State หลักของแอป

| State | ความหมาย |
|---|---|
| `sessions` | รายการ sessions ทั้งหมด |
| `currentSessionId` | session ที่เปิดอยู่ |
| `messages` | messages ใน session ปัจจุบัน |
| `isStreaming` | กำลัง stream อยู่หรือไม่ |

| Action | หน้าที่ |
|---|---|
| `loadSessions()` | โหลดรายการ sessions จาก backend |
| `selectSession(id)` | โหลด explorations ของ session |
| `startNewSession()` | เริ่ม session ใหม่ |
| `removeSession(id)` | ลบ session |
| `submitQuery(query)` | ส่งคำถาม → stream → บันทึก result |

### `store/model.store.ts`
เก็บ model ที่ผู้ใช้เลือก (`gpt-4o-mini` / `gpt-4o`) แบบ persistent ผ่าน `localStorage`

---

## `src/lib/api.ts` — Backend API Client
HTTP functions สำหรับติดต่อ NestJS Backend

| Function | หน้าที่ |
|---|---|
| `createSession()` | สร้าง session ใหม่ |
| `getSessions()` | ดึงรายการ sessions |
| `deleteSession(id)` | ลบ session |
| `getSessionExplorations(id)` | ดึง explorations ในแต่ละ session |
| `streamExploration()` | เปิด SSE stream รับ agent events แบบ real-time |

**Base URL** อ่านจาก `NEXT_PUBLIC_BACKEND_URL` (default: `http://localhost:3000`)

> `normalizeSignalStats()` — แปลง snake_case (จาก Python) หรือ camelCase (จาก DB) ให้เป็น format เดียวกัน

---

## `src/types/index.ts` — TypeScript Types

| Type | ความหมาย |
|---|---|
| `Session` | Chat session object |
| `AgentEvent` | Event จาก agent ระหว่าง streaming |
| `SignalStats` | สถิติจาก Signal Analysis Agent |
| `ExploreResult` | ผลลัพธ์ครบชุดจาก multi-agent run |
| `ChatMessage` | Message ใน UI (type: `user` หรือ `exploration`) |
| `ExplorationFromDB` | Exploration record ที่อ่านจาก Backend DB |

---

## i18n

### `src/i18n/routing.ts`
```ts
locales: ['en', 'th']
defaultLocale: 'en'
```

### `src/messages/en.json` / `th.json`
ข้อความทั้งหมดในแอปแยกตามภาษา ครอบคลุม: ชื่อ app, navigation, welcome screen, chat, report, agent names

---

## Environment Variables (`.env.local`)

```env
NEXT_PUBLIC_BACKEND_URL=http://localhost:3000
```

---

## การรัน (Local)

```bash
# ติดตั้ง dependencies
npm install

# รัน development server
npm run dev
```

เปิด [http://localhost:3001](http://localhost:3001)

## การรันด้วย Docker

```bash
docker build -t frontend .
docker run -p 3001:3001 --env-file .env.local frontend
```

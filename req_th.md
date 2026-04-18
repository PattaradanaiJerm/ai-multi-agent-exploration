Full-Stack AI Engineer – การทดสอบทางเทคนิค 1 สัปดาห์
ชื่อโปรเจกต์: AI Multi-Agent Market Exploration System

1. ที่มาของปัญหา

บริษัทการค้าระดับโลกแห่งหนึ่งบริหารจัดการสินค้าหลากหลายประเภทที่จัดหาจากซัพพลายเออร์ในหลายภูมิภาคทั่วโลก คลังสินค้าของบริษัทประกอบด้วยหมวดหมู่ต่าง ๆ เช่น อะไหล่รถยนต์ สินค้าเกษตร และผลิตภัณฑ์อาหารสำเร็จรูป

ในฐานะส่วนหนึ่งของกลยุทธ์การเติบโตระดับนานาชาติ ทีมงานมักสำรวจข้อมูลที่เกี่ยวข้องกับหมวดหมู่สินค้า ตลาด และอุตสาหกรรมต่าง ๆ เพื่อทำความเข้าใจโอกาสทางธุรกิจที่อาจเกิดขึ้น กระบวนการนี้อาจครอบคลุมการทบทวนข้อมูลจากหลากหลายแหล่ง เช่น ข้อมูลเชิงลึกของตลาด แนวโน้มอุตสาหกรรม และข่าวสารล่าสุด

บริษัทสนใจสำรวจว่า AI Agent สามารถช่วยให้ผู้ใช้รวบรวมข้อมูลที่เกี่ยวข้อง วิเคราะห์สัญญาณภายนอก และสร้าง Insight ที่ช่วยให้เข้าใจสถานการณ์ตลาดและโอกาสทางธุรกิจได้อย่างไร

2. ภาระงาน

ออกแบบและสร้างต้นแบบระบบ AI Multi-Agent ที่ช่วยให้ผู้ใช้สำรวจข้อมูลและสร้าง Insight ที่เกี่ยวข้องกับหมวดหมู่สินค้าและภูมิภาคที่ต้องการ

ระบบต้องสาธิตให้เห็นว่า AI Agent หลายตัวสามารถทำงานร่วมกันแบบ Dynamic เพื่อประมวลผล Query ของผู้ใช้ได้อย่างไร

ระบบต้องสามารถปรับพฤติกรรมตาม Intent ของผู้ใช้ ซึ่งครอบคลุม:
- ทำความเข้าใจ Query ของผู้ใช้
- เลือก Agent ที่เหมาะสม
- กำหนดลำดับการทำงาน
- รวบรวมข้อมูลที่เกี่ยวข้องจากหลากหลายแหล่ง
- วิเคราะห์บริบทของตลาด
- วิเคราะห์สัญญาณภายนอก เช่น ข่าวสารหรือเหตุการณ์ล่าสุด
- สร้าง Insight ที่มีประโยชน์เพื่อช่วยให้ผู้ใช้เข้าใจหัวข้อหรือบริบทของตลาดได้ดียิ่งขึ้น

การทำงานร่วมกันระหว่าง Agent ต้องไม่ยึดติดกับลำดับขั้นตอนที่ตายตัวหรือ Hardcode แต่ต้องสะท้อนการใช้เหตุผลแบบ Adaptive และการ Orchestration ที่ยืดหยุ่น

เป้าหมายของงานนี้คือการสาธิต:
- AI Agent Orchestration
- การใช้เหตุผลและการตัดสินใจ
- การ Integration แบบ Full-Stack

หมายเหตุ:
ระบบต้องสาธิต Dynamic Agent Orchestration
หมายความว่าระบบต้องสามารถตีความ Intent ของผู้ใช้ เลือก Agent ที่เกี่ยวข้อง และกำหนด Execution Flow ได้แบบ Dynamic
ระบบต้องไม่ยึดติดกับลำดับการทำงานของ Agent ที่ Hardcode ไว้

3. ตัวอย่าง User Scenario

ผู้ใช้ต้องการสำรวจข้อมูลและพัฒนาการล่าสุดที่เกี่ยวข้องกับหมวดหมู่สินค้าในภูมิภาคที่ต้องการ

ตัวอย่าง Input
Explore market insights and recent developments related to agricultural products in Southeast Asia.
(สำรวจข้อมูลเชิงลึกของตลาดและพัฒนาการล่าสุดที่เกี่ยวข้องกับสินค้าเกษตรในเอเชียตะวันออกเฉียงใต้)

4. ข้อกำหนดด้าน Multi-Agent

ระบบต้องมี AI Agent จำนวน 2–3 ตัว ที่ทำงานร่วมกันเพื่อประมวลผลคำร้องขอ

ตัวอย่างสถาปัตยกรรมระบบ

	User Query
	   ↓
	Chat Interface
	   ↓
	Agent Orchestrator (reasoning & dynamic routing)
	   ↓
	[Available Agents]
	Query Understanding Agent /
	Market & Information Retrieval Agent /
	External Signal / News Analysis Agent
	   ↓
	(Agents are selected and executed dynamically based on intent)
	   ↓
	Agent Orchestrator (aggregation)
	   ↓
	Final Insights

หมายเหตุ:
Agent ที่แสดงเป็นตัวอย่างข้างต้นแทนความสามารถที่มีอยู่ ไม่ใช่ลำดับการทำงานที่ตายตัว
ระบบต้องสามารถ Dynamic select และเรียกใช้งานเฉพาะ Agent ที่เกี่ยวข้องตาม Query ของผู้ใช้
ผู้สมัครสามารถออกแบบ Agent และ Workflow ของตัวเองได้อย่างอิสระ

5. ตัวอย่าง AI Agents

ด้านล่างนี้คือตัวอย่างบทบาทของ Agent แต่ละตัว

Agent 1 — Query Understanding Agent
ตีความคำร้องขอของผู้ใช้และดึง Key Topic ออกมา

Input
Explore market insights and recent developments related to agricultural products in Southeast Asia.

Output
Query Summary

Topic: Agricultural products
Region: Southeast Asia

Information Needed:
• Key markets in the region
• Industry or market insights
• Recent developments or news affecting the sector

---

Agent 2 — Market Information Retrieval Agent

Input
Topic: Agricultural products
Region: Southeast Asia
Information Needed:
• Key markets
• Industry insights

Output
Market Insights
Southeast Asia is a major producer and exporter of agricultural products.

Key Markets Identified
Thailand
Vietnam
Indonesia

Industry Context
• Strong agricultural production in the region
• Growing demand for food exports
• Expanding regional trade activity

---

Agent 3 — News / External Signal Analysis Agent

Input
Topic: Agricultural products
Region: Southeast Asia
Markets: Thailand, Vietnam, Indonesia

Output
Recent Developments

Vietnam
Recent reports highlight increased agricultural exports due to rising global food demand.

Indonesia
Policy discussions around agricultural import regulations may influence trade flows.

Thailand
Ongoing investment in agricultural technology and processing infrastructure.

Regional Signals
Global supply chain shifts and geopolitical developments may affect agricultural trade patterns.

---

ผลลัพธ์สุดท้าย (System Result)
ระบบต้องนำเสนอผลลัพธ์ผ่าน User Interface ที่เรียบง่าย

Exploration Report

Topic: Agricultural Products
Region: Southeast Asia

Key Markets
Thailand
Vietnam
Indonesia

Market Insights
Southeast Asia plays a significant role in global agricultural supply chains.

Recent Developments
Vietnam – Rising agricultural export activity.
Indonesia – Potential policy discussions affecting trade.
Thailand – Investments in agricultural technology.

Overall Insight
The region remains an active agricultural market with ongoing developments that may influence trade dynamics.

7. ข้อกำหนดด้านเทคนิค

ผู้สมัครต้องใช้ Tech Stack ดังต่อไปนี้:

AI Layer
Python

Frontend
TypeScript ร่วมกับ React หรือ Next.js

Backend
Node.js (NestJS)

ความรับผิดชอบ:
- API Integration
- Business Logic
- Database Integration
- AI Service Orchestration

Cloud (Optional)
การออกแบบระบบสามารถรองรับการ Deploy บน Google Cloud Platform ได้

8. ข้อมูล

เนื่องจากไม่มีข้อมูลภายในของบริษัทให้ ผู้สมัครสามารถใช้แหล่งข้อมูลที่สมเหตุสมผล เช่น:

- Mock data
- Public datasets
- Open APIs
- Web scraping

9. สิ่งที่ต้องส่ง (Expected Deliverables)

ผู้สมัครต้องส่ง:

1. Source Code
GitHub repository ที่ประกอบด้วย:
/frontend
/backend
/AI agents
/docker-compose.yml

2. Documentation
README.md ที่ประกอบด้วย:
- System architecture
- Explanation of AI agents
- Design decisions

3. Running Instructions
ตัวอย่าง:
docker-compose up
หรือ
npm install
npm run dev

4. System Demo
ระบบต้องสาธิต:
- Multi-agent workflow
- AI reasoning
- การโต้ตอบของผู้ใช้ผ่าน UI หรือ Chat Interface ที่เรียบง่าย

10. เกณฑ์การประเมิน

เกณฑ์                    น้ำหนัก
System architecture       25%
AI agent design           25%
Backend engineering       20%
Frontend usability        15%
Documentation             15%

งานชิ้นนี้มีวัตถุประสงค์เพื่อประเมินทักษะด้านการออกแบบระบบ วิศวกรรมซอฟต์แวร์ และการคิดเชิงการประยุกต์ใช้ AI

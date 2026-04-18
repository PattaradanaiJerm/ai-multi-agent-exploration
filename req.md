Full-Stack AI Engineer – 1 Week Technical Assignment													
Assignment: AI Multi-Agent Market Exploration System													
													
1. Problem Statement													
													
A global trading company manages a diverse portfolio of products sourced from suppliers across multiple regions. The product catalog includes categories such as car spare parts, agricultural goods, and convenience food products.													
As part of its international growth strategy, teams often explore information related to different product categories, markets, and industries to better understand potential opportunities.													
This process may involve reviewing information from various sources, such as market insights, industry trends, and recent news.													
													
The company is interested in exploring how AI-powered agents can assist users in gathering relevant information, analyzing external signals, and generating insights that help them better understand market situations and potential opportunities.													
													
2. Assignment													
Design and build a prototype AI multi-agent system that helps users explore information and generate insights related to a product category and region.													
The system should demonstrate how multiple AI agents can collaborate dynamically to process a user query.													
The system is expected to adapt its behavior based on the user’s intent, including:													
-understanding a user query													
- selecting appropriate agents													
-determining execution flow													
-gathering relevant information from different sources													
-analyzing market context													
-analyzing external signals such as recent news or events													
-generating useful insights that help users better understand the topic or market context													
													
The collaboration between agents should not rely on a fixed or hardcoded sequence, but instead reflect adaptive reasoning and flexible orchestration.													
													
The goal of this assignment is to demonstrate:													
- AI agent orchestration													
- reasoning and decision-making													
- full-stack integration													
													
Note:													
The system should demonstrate dynamic agent orchestration.													
This means the system should be able to interpret user intent, select relevant agents, and determine execution flow dynamically.													
The system should not rely on a fixed or hardcoded sequence of agent execution.													
													
3. Example User Scenario													
													
A user wants to explore information and recent developments related to a product category in a specific region.													
													
Example Input													
Explore market insights and recent developments related to agricultural products in Southeast Asia.													
													
													
4. Multi-Agent Requirement													
													
Your system should implement 2–3 AI agents that collaborate to process the request.													
													
Example architecture													
													
	User Query												
	   ↓												
	Chat Interface												
	   ↓												
	Agent Orchestrator (reasoning & dynamic routing)												
	   ↓												
	[Available Agents]												
	Query Understanding Agent/												
	Market & Information Retrieval Agent/												
	External Signal / News Analysis Agent												
	   ↓												
	(Agents are selected and executed dynamically based on intent)												
	   ↓												
	Agent Orchestrator (aggregation)												
	   ↓												
	Final Insights												
													
													
Note:													
The example agents above represent available capabilities, not a fixed execution sequence.													
The system is expected to dynamically select and invoke only the relevant agents based on the user query.													
Candidates are free to design their own agents and workflows.													
													
													
5. Example AI Agents													
Below are example agent roles.													
													
Agent 1 — Query Understanding Agent													
Interpret the user request and extract key topics.													
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
													
Final Output (System Result)													
The system should present the results through a simple user interface.													
													
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
													
7. Technical Requirements													
													
Candidates should use the following technology stack:													
													
AI Layer													
Python													
													
Frontend													
TypeScript with React or Next.js													
													
Backend													
Node.js (NestJS)													
													
Responsibilities:													
API integration													
business logic													
database integration													
AI service orchestration													
													
Cloud (Optional)													
System design may optionally include deployment on													
Google Cloud Platform													
													
8. Data													
Since internal company data is not provided, candidates may use any reasonable data sources, such as:													
													
mock data													
public datasets													
open APIs													
web scraping													
													
													
9. Expected Deliverables													
													
Candidates should submit:													
													
1.Source Code													
GitHub repository including:													
/frontend													
/backend													
/AI agents													
/docker-compose.yml													
													
2.Documentation													
README.md including:													
system architecture													
explanation of AI agents													
design decisions													
													
3.Running Instructions													
Example:													
docker-compose up													
or													
npm install													
npm run dev													
													
4.System Demo													
The system should demonstrate:													
multi-agent workflow													
AI reasoning													
user interaction through a simple UI or chat interface													
													
10. Evaluation Criteria													
													
Criteria	Weight												
System architecture	25%												
AI agent design	25%												
Backend engineering	20%												
Frontend usability	15%												
Documentation	15%												
													
													
This assignment is intended to evaluate system design, engineering skills, and AI application thinking.													
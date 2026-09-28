# CLIENTPILOT — AI Client Relationship & Follow-up Agent

[![Hackathon](https://img.shields.io/badge/Hackathon-Hack%20With%20Hyderabad%203.0-blue)](https://hackwithhyderabad.com)
[![Challenge](https://img.shields.io/badge/Challenge-AI%20Agents%20That%20Learn%20Using%20Hindsight-purple)](https://usehindsight.com)
[![Backend](https://img.shields.io/badge/Backend-Spring%20Boot%203.3%20%2F%20Java%2021-green)](https://spring.io)
[![Memory](https://img.shields.io/badge/Memory-Hindsight%20AI%20Memory-indigo)](https://vectorize.io)
[![Database](https://img.shields.io/badge/Database-PostgreSQL%2016-blue)](https://postgresql.org)
[![Frontend](https://img.shields.io/badge/Frontend-React%20%2B%20Tailwind%20CSS-teal)](https://vitejs.dev)

> **"ClientPilot does not simply remember conversations. It uses Hindsight long-term memory to avoid past mistakes, honor hard constraints, and get smarter with every client interaction."**

---

## 1. Problem Statement

Modern businesses, agencies, and sales teams engage in ongoing, multi-week dialogues with clients. Critical details are scattered across disparate channels:
- Initial project requirements and changes.
- Implicit communication preferences (e.g., Slack over Zoom, WhatsApp alerts).
- Hard budget constraints and financial ceilings.
- **Past rejections, friction points, and objections** (e.g., proposals turned down because quotes were too high).

Traditional LLM chatbots have no genuine episodic or reflective memory. They suffer from session amnesia, frequently repeating past blunders, quoting previously rejected prices, and asking questions the client already answered.

---

## 2. Solution: The ClientPilot Cognitive Agent

ClientPilot solves this by embedding **Hindsight** as its dedicated long-term cognitive memory bank. The agent operates on a 5-step cognitive loop:

$$\text{REMEMBER} \longrightarrow \text{RETRIEVE} \longrightarrow \text{REASON} \longrightarrow \text{ADAPT} \longrightarrow \text{ACT}$$

1. **Remember:** Ingests client touchpoints, automatically extracting preferences, budget limits, and past objections.
2. **Retrieve:** Semantically recalls relevant memories when any request is triggered.
3. **Reason:** Injects retrieved long-term memory facts directly into LLM deliberation.
4. **Adapt:** Automatically avoids repeating failed strategies (e.g., re-scoping proposals under known budget ceilings).
5. **Act:** Generates high-fidelity meeting preparation briefs, follow-up messages, and revised proposals.

---

## 3. Key Features

- **Hindsight Long-Term Memory Vault:** Visual categorized inspector for preferences, budget constraints, objections, and commitments with confidence scoring.
- **Contextual Meeting Preparation:** One-click generation of strategic briefings highlighting critical pitfalls to avoid.
- **Intelligent Follow-Up Generator:** Drafts personalized outreach messages that respect client constraints and acknowledge past feedback.
- **Adaptive Proposal Studio:** Side-by-side comparison illustrating a proposal *WITHOUT Memory* (which repeats the ₹3.8L failure) versus *WITH Hindsight Memory* (rescoped to ₹1.90L with WhatsApp automation).
- **Interactive Hackathon Demo Mode:** Step-by-step simulator showing how the agent learns over 6 progressive interactions for **Rahul Sharma (GreenLeaf Foods)**.

---

## 4. Architecture

```
User (Account Manager / Freelancer)
             │
             ▼
   [ React Frontend (Vite + Tailwind CSS) ]
             │
             ▼
   [ Spring Boot 3 / Express REST API ]
             │
      ┌──────┴──────────────────────────┐
      ▼                                 ▼
[ PostgreSQL Database ]        [ Hindsight Memory Service ]
  - Accounts (clients)           - Vector Memory Banks
  - Interaction Logs             - Retain / Recall / Reflect
      │                                 │
      └──────────────┬──────────────────┘
                     ▼
          [ AgentService & LLM Engine ]
            - Google Gemini 3.8 Flash
            - System Prompt Constraints
            - Reasoning Trace Synthesis
                     │
                     ▼
             Actionable Output
```

---

## 5. Technology Stack

- **Frontend:** React 19, Tailwind CSS 4, Lucide Icons, Motion, Vite.
- **Backend:** Java 21, Spring Boot 3.3.4, Spring Data JPA, Spring WebFlux, Maven.
- **Memory Engine:** Hindsight AI Memory Service (Vectorize.io Protocol).
- **Database:** PostgreSQL 16 (with relational integrity and automated triggers).
- **AI/LLM:** Google Gemini API (`gemini-3.8-flash`) with configurable provider adapter.

---

## 6. Project Structure

```
ClientPilot/
├── backend/
│   ├── pom.xml
│   ├── Dockerfile
│   └── src/
│       ├── main/
│       │   ├── java/com/clientpilot/
│       │   │   ├── ClientPilotApplication.java
│       │   │   ├── controller/      # Client, Interaction, Agent, Memory
│       │   │   ├── service/         # HindsightService, AgentService, LLMService, etc.
│       │   │   ├── model/           # Client, Interaction, Enums
│       │   │   ├── repository/      # Spring Data JPA interfaces
│       │   │   ├── dto/             # Requests, Responses, Memory DTOs
│       │   │   ├── config/          # CORS, Jackson AppConfig
│       │   │   └── exception/       # GlobalExceptionHandler
│       │   └── resources/
│       │       └── application.properties
│       └── test/                    # Unit and integration test suite
│
├── database/
│   ├── schema.sql                   # PostgreSQL schema definition
│   └── seed.sql                     # Seed data with Rahul Sharma scenario
│
├── docs/
│   ├── architecture.md              # Complete architecture breakdown
│   ├── hindsight-integration.md     # Hindsight API and memory banks guide
│   ├── api-documentation.md         # Full REST API documentation
│   ├── demo-script.md               # 3-5 min timed presentation script
│   └── team-work.md                 # Remote 6-member collaboration guide
│
├── src/                             # Live interactive React applet components & pages
├── server.ts                        # Full-stack API & Vite middleware server
├── docker-compose.yml               # Multi-container orchestration
├── .env.example                     # Environment template
└── README.md
```

---

## 7. Environment Variables & Architectures

ClientPilot supports two clear operational setups:

### SETUP A — LOCAL DEVELOPMENT (Recommended for Local Dev & Hackathon Demos)

Uses local Docker containers for both PostgreSQL and Hindsight:
- **PostgreSQL:** Exposed on host port `5432` (`localhost:5432`).
- **Hindsight:** Standalone container exposed on host port `8081` (`localhost:8081`).
- **Spring Boot Backend:** Runs on host port `8080` or in Docker.
- **Frontend / Unified Server:** Runs on port `3000`.

```env
# Hindsight Standalone (Local Docker mapped 8081:8080)
HINDSIGHT_BASE_URL=http://localhost:8081
HINDSIGHT_API_KEY=

# Google Gemini API
GEMINI_API_KEY=your_actual_gemini_api_key

# PostgreSQL (Host Connection)
POSTGRES_DB=clientpilot
POSTGRES_USER=clientpilot
POSTGRES_PASSWORD=clientpilot123

DATABASE_URL=jdbc:postgresql://localhost:5432/clientpilot
DATABASE_USERNAME=clientpilot
DATABASE_PASSWORD=clientpilot123

# NOTE: If running Spring Boot inside Docker Compose, use container hostname:
# DATABASE_URL=jdbc:postgresql://postgres:5432/clientpilot
# HINDSIGHT_BASE_URL=http://hindsight:8080
```

### SETUP B — CLOUD / GOOGLE AI STUDIO PREVIEW

When previewing inside Google AI Studio, the application runs on a remote Cloud Run instance. It cannot directly access `localhost:8081` on your personal development laptop without a tunnel or cloud instance:

```env
# Remote Hindsight Cloud or Tunnel
HINDSIGHT_BASE_URL=https://api.hindsight.vectorize.io
HINDSIGHT_API_KEY=your_hindsight_cloud_api_key

# Google Gemini API
GEMINI_API_KEY=your_gemini_api_key

# Hosted PostgreSQL (Cloud SQL, Supabase, Neon, or Railway)
DATABASE_URL=jdbc:postgresql://your-cloud-db-host:5432/clientpilot
DATABASE_USERNAME=your_db_username
DATABASE_PASSWORD=your_db_password
```

---

## 8. Docker & Service Commands

### 1. Stop and Clean Containers
```bash
docker compose down
```

### 2. Start PostgreSQL and Hindsight Services
```bash
docker compose up -d postgres hindsight
```

### 3. Verify Container Status
```bash
docker ps
```
*Expected: Both `clientpilot-postgres` and `clientpilot-hindsight` running with healthy status.*

### 4. Inspect Container Logs
```bash
docker logs clientpilot-postgres
docker logs clientpilot-hindsight
```

### 5. Test Hindsight Health on Host Port 8081
```bash
curl http://localhost:8081/health
```
*Expected response: `{"status":"ok"}` or HTTP 200.*

### 6. Test PostgreSQL Health with Docker Exec
```bash
docker exec clientpilot-postgres pg_isready -U clientpilot -d clientpilot
```
*Expected output: `clientpilot:5432 - accepting connections`.*

---

## 9. Starting the Applications

### 1. Start the Spring Boot Backend (Host Mode)
```bash
cd backend
mvn clean package -DskipTests
mvn spring-boot:run
```

**Startup Log Output:**
```
=============================================================================
                 CLIENTPILOT COGNITIVE AGENT SYSTEM INITIALIZATION           
=============================================================================
[ClientPilot] PostgreSQL: CONNECTED
[ClientPilot] Hindsight: CONNECTED at http://localhost:8081
[ClientPilot] Gemini: CONFIGURED
=============================================================================
```

### 2. Start the Frontend & Dev Server
```bash
# In repository root
npm install
npm run dev
```

### 3. Verify System Health Endpoint
```bash
curl http://localhost:3000/api/health
```

**Expected JSON Response:**
```json
{
  "status": "UP",
  "services": {
    "database": "CONNECTED",
    "hindsight": "CONNECTED",
    "gemini": "CONFIGURED"
  },
  "hindsightUrl": "http://localhost:8081",
  "hindsightPort": 8081,
  "geminiConfigured": true,
  "environment": "AI Studio / Development Host"
}
```

---

## 10. Hackathon Demo Walkthrough

1. Open the app at `http://localhost:3000`.
2. Notice the **Core Services & Engine Status** dashboard bar confirming Hindsight, Postgres, and Gemini status.
3. Click on **Learning Journey / Demo Mode** in the sidebar.
4. Click the prominent **`[Run Demo]`** button or step through sequentially:
   - **Step 1:** Log initial need (*"Rahul wants an e-commerce website"*).
   - **Step 2:** Log preferences & budget (*"WhatsApp integration, ₹2 lakh budget"*).
   - **Step 3:** Log previous rejection (*"Rejected previous proposal due to high cost"*).
   - **Step 4:** Query concerns (*"What are Rahul's main concerns?"*). Observe Hindsight recall and comparison with non-memory LLM.
   - **Step 5:** Generate tomorrow's meeting preparation brief.
   - **Step 6:** Generate the revised proposal (rescoped to ₹1,90,000 avoiding previous failure).

---

## 11. Remote Team Structure (Hack With Hyderabad 3.0)

- **Member 1:** React Frontend & UI/UX Design.
- **Member 2:** Spring Boot Backend & PostgreSQL Entities.
- **Member 3:** Hindsight Memory Service Adapter & Vector Bank Ingestion.
- **Member 4:** AI Agent Deliberation, Gemini Prompting & Reasoning Traces.
- **Member 5:** Meeting, Follow-Up & Proposal Generation Services.
- **Member 6:** Integration, End-to-End Testing, Documentation & Pitch.

# CLIENTPILOT ARCHITECTURE DESIGN
## Hack With Hyderabad 3.0: AI Agents That Learn Using Hindsight

---

## 1. System Overview

ClientPilot is an AI client relationship and follow-up agent designed for agencies, startups, sales executives, and freelancers. Unlike standard stateless chatbots that forget client nuances or confuse conversation threads across weeks, ClientPilot utilizes **Hindsight** as its dedicated long-term cognitive memory bank.

```
+-----------------------------------------------------------------------------------+
|                                 CLIENTPILOT MVP                                   |
+-----------------------------------------------------------------------------------+
|                                                                                   |
|  [ User / Account Exec ]                                                          |
|            │                                                                      |
|            ▼                                                                      |
|  [ React + Tailwind Frontend ] (Port 3000)                                       |
|     • Dashboard & Analytics                                                       |
|     • Client Directory & Profile Management                                       |
|     • Hindsight Memory Vault Visualizer                                           |
|     • Interactive AI Assistant with Memory Inspection                             |
|     • Dedicated Learning Journey & Hackathon Demo Mode                            |
|            │                                                                      |
|            │ REST / JSON (HTTP)                                                   |
|            ▼                                                                      |
|  [ Application Layer (Spring Boot / Express Full-Stack Server) ]                  |
|     ├── ClientController & ClientService                                          |
|     ├── InteractionController & InteractionService                                |
|     ├── MemoryController                                                          |
|     ├── AgentService (REMEMBER → RETRIEVE → REASON → ADAPT → ACT)                 |
|     ├── MeetingService, FollowUpService, ProposalService                          |
|     └── LLMService (Gemini API / Configurable LLM)                                |
|            │                                            │                         |
|            ▼                                            ▼                         |
|  [ PostgreSQL Relational DB ]              [ Hindsight Memory Engine ]            |
|     • Structured Accounts (clients)          • Vector & Fact Banks                |
|     • Interaction Timelines (interactions)   • Retain / Recall / Reflect APIs     |
|     • Foreign Key Integrity & Audit Logs     • Semantic Confidence & Recency      |
|                                                                                   |
+-----------------------------------------------------------------------------------+
```

---

## 2. Core Memory Architecture

### The Five-Stage Cognitive Pipeline

1. **REMEMBER (Ingestion & Extraction):**
   - Whenever an interaction (meeting note, email, complaint, requirement) is created, it is persisted as a relational row in PostgreSQL.
   - The interaction text is passed through the `HindsightService.retain()` adapter.
   - Hindsight extracts and classifies semantic facts into distinct categories:
     - `PREFERENCE`: Communication channels, workflow habits, technical requirements (e.g., WhatsApp integration, Slack).
     - `REQUIREMENT`: Functional specifications (e.g., D2C e-commerce, payment gateway).
     - `BUDGET_CONSTRAINT`: Financial ceilings and payment expectations (e.g., ₹2 lakh INR limit).
     - `OBJECTION_OUTCOME`: Critical past rejections, points of friction, pricing failures.
     - `COMMITMENT`: Promises made by the team to the client.

2. **RETRIEVE (Semantic Recall):**
   - When a user asks an AI question, triggers meeting prep, or requests a proposal, `HindsightService.recall()` is executed.
   - Hindsight queries the client's memory bank using semantic similarity and recency weighting.
   - The top relevant memory blocks are selected and verified.

3. **REASON (Cognitive Synthesis):**
   - Retrieved memory facts are structured into the LLM system prompt context:
     `CLIENT INFORMATION + RETRIEVED HINDSIGHT MEMORIES + CURRENT USER REQUEST`.
   - The model reasons under strict constraints: avoid repeating past mistakes, enforce hard budget limits, and preserve stated preferences.

4. **ADAPT (Strategic Course Correction):**
   - The agent prevents negative reinforcement. If a proposal was previously rejected for being ₹3.8 lakh, the revised proposal automatically restricts pricing below ₹2 lakh and offers phased milestones.

5. **ACT (Actionable Artifact Generation):**
   - Produces tailored output: comprehensive meeting briefs, customized follow-up emails, or revised commercial proposals.

---

## 3. Data Separation Principle

| Component | Storage Role | Technology |
|---|---|---|
| **Structured Business Data** | Accounts, client contact details, raw interaction logs, timestamps, foreign key relationships | PostgreSQL |
| **Cognitive Long-term Memory** | Evolving client preferences, budget constraints, objections, semantic associations, reflection vectors | Hindsight Memory Service (Vectorize.io) |
| **Reasoning Engine** | Natural language synthesis, contextual planning, document drafting | Google Gemini API (`gemini-3.8-flash`) |

---

## 4. Resilience & Graceful Degradation

If the external Hindsight cluster is unreachable:
1. `HindsightService` flags `hindsightAvailable = false`.
2. A clear status is returned to the user: `"Memory service unavailable. The response was generated without long-term memory."`
3. The application never silently pretends memories were retrieved if the service is down.

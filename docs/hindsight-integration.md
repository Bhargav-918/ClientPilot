# HINDSIGHT AI MEMORY INTEGRATION GUIDE
## Hack With Hyderabad 3.0: AI Agents That Learn Using Hindsight

---

## 1. What is Hindsight?

**Hindsight** (by Vectorize.io) is an open-source, purpose-built long-term memory engine for autonomous AI agents. Unlike standard conversation buffers (which suffer from context window limits and forgetfulness across sessions) or naive RAG (which treats all text as unranked chunks), Hindsight introduces **episodic, semantic, and reflective memory banks**.

Key Capabilities:
- **Memory Banks per Entity:** Isolated memory namespaces (`bank_clientId`).
- **Memory Types:**
  - `world_facts`: Immutable details about the client's business.
  - `experiences`: Past interaction logs and specific episodes.
  - `observations`: Inferred nuances such as price sensitivity and preferred speed.
  - `mental_models`: Synthesized understanding of client behavior patterns.
- **Core Verbs:**
  - `Retain`: Persist new observations into memory.
  - `Recall`: Search and retrieve memories relevant to an operational task.
  - `Reflect`: Generate higher-order insights from accumulated experiences.

---

## 2. Integration Architecture in ClientPilot

ClientPilot encapsulates all Hindsight communication behind a clean abstraction layer: `HindsightService.java` (in Spring Boot) and `server.ts` (in Node/Express).

```
   [ Application Code / Controllers ]
                   │
                   ▼
         [ HindsightService ]  <── Isolated Adapter Interface
                   │
         ┌─────────┴─────────┐
         ▼                   ▼
[ Remote Hindsight REST ]  [ Local Embedded Bank ]
  POST /v1/memories/retain   (Fallback in-memory cache)
  POST /v1/memories/recall
```

### Official API Endpoints

1. **Retain Memory (`POST /v1/memories/retain`):**
   ```json
   {
     "bankId": "bank_c1",
     "memories": [
       {
         "category": "BUDGET_CONSTRAINT",
         "fact": "Strict budget ceiling of ₹2,00,000 (₹2 lakh INR). Non-negotiable ceiling.",
         "confidence": 0.98,
         "sourceInteractionId": "i2",
         "sourceDate": "2026-09-22"
       }
     ]
   }
   ```

2. **Recall Memories (`POST /v1/memories/recall`):**
   ```json
   {
     "bankId": "bank_c1",
     "query": "What are Rahul's main concerns?",
     "limit": 5
   }
   ```

3. **Reflect Insights (`POST /v1/memories/reflect`):**
   ```json
   {
     "bankId": "bank_c1",
     "prompt": "Synthesize key lessons from past rejected proposals."
   }
   ```

---

## 3. Memory Verification & Anti-Hallucination

In ClientPilot:
- Every memory returned carries a `verifiedHindsight: true` attribute.
- The UI features a distinct purple **Hindsight Memory** badge.
- If Hindsight is disconnected, the system explicitly reports:
  `"Memory service unavailable. The response was generated without long-term memory."`
- The system never fakes Hindsight retrieval.

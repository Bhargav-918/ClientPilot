# CLIENTPILOT REST API DOCUMENTATION
## Hack With Hyderabad 3.0

Base URL: `http://localhost:8080` (Spring Boot Backend) or `http://localhost:3000` (Unified Dev Server)

All requests and responses use `Content-Type: application/json`.

---

## 1. Clients API

### `GET /api/clients`
Retrieves a list of all client profiles with interaction and memory counts.

**Response:**
```json
[
  {
    "id": "c1",
    "name": "Rahul Sharma",
    "company": "GreenLeaf Foods",
    "industry": "Food Manufacturing",
    "email": "rahul@greenleaffoods.in",
    "phone": "+91 98201 44520",
    "project": "E-commerce Website",
    "createdAt": "2026-09-20T10:00:00.000Z",
    "updatedAt": "2026-09-25T16:30:00.000Z",
    "interactionCount": 3,
    "memoryCount": 5
  }
]
```

### `GET /api/clients/{id}`
Retrieves a single client by ID.

### `POST /api/clients`
Creates a new client account.

**Request Body:**
```json
{
  "name": "Rahul Sharma",
  "company": "GreenLeaf Foods",
  "industry": "Food Manufacturing",
  "email": "rahul@greenleaffoods.in",
  "phone": "+91 98201 44520",
  "project": "E-commerce Website"
}
```

---

## 2. Interactions API

### `GET /api/clients/{clientId}/interactions`
Retrieves chronological interactions for a client.

### `POST /api/clients/{clientId}/interactions`
Creates an interaction and automatically triggers Hindsight long-term memory extraction.

**Request Body:**
```json
{
  "type": "NOTE",
  "content": "Rahul wants WhatsApp integration and wants the project to stay within a budget of ₹2 lakh.",
  "interactionDate": "2026-09-22T14:30:00.000Z"
}
```

**Response:**
```json
{
  "interaction": {
    "id": "i2",
    "clientId": "c1",
    "type": "NOTE",
    "content": "Rahul wants WhatsApp integration...",
    "interactionDate": "2026-09-22T14:30:00.000Z"
  },
  "storedInHindsight": true,
  "hindsightRetainedCount": 2,
  "retainedMemories": [
    {
      "category": "PREFERENCE",
      "fact": "Demands WhatsApp integration for automated order status notifications & customer tracking.",
      "confidence": 0.96
    },
    {
      "category": "BUDGET_CONSTRAINT",
      "fact": "Project budget is capped strictly at ₹2,00,000 (₹2 lakh INR). Non-negotiable ceiling.",
      "confidence": 0.99
    }
  ]
}
```

---

## 3. Memory API

### `GET /api/clients/{clientId}/memories`
Returns all memory blocks stored in Hindsight for this client.

### `POST /api/clients/{clientId}/memory/search`
Searches Hindsight memory using semantic keywords.

**Request Body:**
```json
{
  "query": "budget rejection concerns",
  "limit": 5
}
```

---

## 4. AI Agent API

### `POST /api/agent/chat`
Performs memory retrieval + reasoning + generation.

**Request Body:**
```json
{
  "clientId": "c1",
  "message": "What are Rahul's main concerns?"
}
```

**Response:**
```json
{
  "clientId": "c1",
  "clientName": "Rahul Sharma",
  "query": "What are Rahul's main concerns?",
  "memoryCount": 4,
  "memoriesRetrieved": [ ... ],
  "response": "Rahul is mainly concerned about keeping the project within ₹2 lakh. He also considers WhatsApp integration important. A previous proposal was rejected because the implementation cost was too high.",
  "withoutMemoryComparison": "I see that Rahul Sharma from GreenLeaf Foods is interested in E-commerce Website...",
  "reasoningTrace": {
    "step1": "Resolved client profile: Rahul Sharma (GreenLeaf Foods)",
    "step2": "Queried Hindsight memory bank for semantic vectors",
    "step3": "Retrieved 4 verified memory blocks",
    "step4": "Injected contextual constraints into LLM",
    "step5": "Synthesized personalized response avoiding repeated pitfalls"
  }
}
```

### `POST /api/agent/meeting`
Prepares comprehensive meeting brief for tomorrow.

### `POST /api/agent/followup`
Generates personalized follow-up message.

### `POST /api/agent/proposal`
Generates revised proposal respecting budget and past objections, side-by-side with the flawed non-memory proposal.

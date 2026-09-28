# CLIENTPILOT: 3-5 MINUTE HACKATHON DEMO SCRIPT
## Hack With Hyderabad 3.0: "AI Agents That Learn Using Hindsight"

---

### [0:00 - 0:30] Problem: Stateless LLMs in Client Relationships
**Presenter:**
> "Good evening, judges! Every agency, startup, and sales team interacts with clients across dozens of emails, WhatsApp calls, and meetings. But traditional chatbots and AI assistants have a fatal flaw: they suffer from amnesia.
>
> When a client says 'Keep it under ₹2 lakh' or 'Never pitch me that high quote again', standard AI forgets in the next session. This leads to blown deals, repeated mistakes, and ruined relationships.
>
> We built **ClientPilot** — the AI Client Relationship Agent that genuinely learns and adapts using **Hindsight Long-term Memory**."

---

### [0:30 - 1:00] Introducing ClientPilot Architecture
**Presenter:**
> "ClientPilot is not just storing chat history in a database. It implements the cognitive loop:
> **REMEMBER → RETRIEVE → REASON → ADAPT → ACT**.
>
> We use Spring Boot, PostgreSQL, and Google Gemini, with Vectorize.io's **Hindsight** memory engine as our dedicated cognitive memory layer."

---

### [1:00 - 2:20] The Live Learning Progression (GreenLeaf Foods)
**Presenter:** *(Clicks '[Run Demo]' in the Demo Mode)*
> "Let’s watch our agent learn in real-time with our client **Rahul Sharma** from **GreenLeaf Foods**.
>
> **Step 1:** Rahul asks for an e-commerce website. Watch the UI: Hindsight retains this as a `REQUIREMENT` memory block.
>
> **Step 2:** Two days later, Rahul adds: *'I want WhatsApp integration, and budget is strictly ₹2 lakh.'* Hindsight extracts two distinct memory blocks: a `PREFERENCE` (WhatsApp) and a `BUDGET_CONSTRAINT` (₹2,00,000 ceiling).
>
> **Step 3:** The team previously made a mistake and sent an expensive quote. Rahul says: *'Rejected the previous proposal because implementation cost was too high.'*
> Hindsight logs this as an `OBJECTION_OUTCOME`."

---

### [2:20 - 3:00] Interaction 4: Concern Analysis with Hindsight
**Presenter:** *(Clicks Step 4)*
> "Now, let’s ask the AI: *'What are Rahul's main concerns?'*
> Notice what happened:
> 1. It retrieved 4 relevant memories from Hindsight.
> 2. The AI generates: *'Rahul is mainly concerned about keeping the project within ₹2 lakh. He also considers WhatsApp integration important. A previous proposal was rejected because the implementation cost was too high.'*
>
> And look at our comparison panel: A standard AI without memory gives a generic, useless reply: *'Rahul wants an e-commerce website.'*"

---

### [3:00 - 3:40] Interaction 5 & 6: Meeting Prep and Revised Proposal
**Presenter:** *(Clicks Step 5 & 6)*
> "Now, look at tomorrow's meeting prep. ClientPilot lists:
> - Client Overview
> - Preferences (WhatsApp)
> - **CRITICAL PITFALLS TO AVOID**: Do NOT quote above ₹2 lakh!
>
> When we generate the **Revised Proposal**, look at the adaptation:
> - Capped at **₹1,90,000** (safely under ₹2L).
> - Features **WhatsApp Business API** upfront.
> - Breaks pricing into 3 milestones to remove upfront risk.
>
> ClientPilot did not repeat the previous failure because it remembered!"

---

### [3:40 - 4:30] The Hindsight Memory Vault & Wrap Up
**Presenter:** *(Navigates to Memory Vault tab)*
> "Here in the Hindsight Memory Vault, every fact is verified with confidence scores, timestamps, and categories.
>
> **ClientPilot does not simply remember the conversation. It uses long-term memory to make future decisions and responses more personalized.**
>
> Thank you, and we welcome your questions!"

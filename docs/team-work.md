# CLIENTPILOT: TEAM WORK BREAKDOWN & GIT WORKFLOW
## Hack With Hyderabad 3.0: 6-Member Remote Collaboration Guide

---

## 1. Member Responsibilities Matrix

| Member | Focus Area | Key Deliverables |
|---|---|---|
| **Member 1** | React Frontend & UI/UX | SaaS Dashboard, Client Directory, Memory Vault visualizer, Tailwind CSS styling, responsive layout |
| **Member 2** | Spring Boot & PostgreSQL | `pom.xml`, Entities (`Client`, `Interaction`), JPA Repositories, REST Controllers (`ClientController`, `InteractionController`) |
| **Member 3** | Hindsight Memory Integration | `HindsightService.java`, Vectorize.io retain/recall API client, category rules (`BUDGET_CONSTRAINT`, `PREFERENCE`, `OBJECTION_OUTCOME`), health checks |
| **Member 4** | AI Agent & Prompt Engineering | `AgentService.java`, `LLMService.java`, Gemini API integration, System Prompting, Reasoning Traces, Anti-Hallucination rules |
| **Member 5** | Meeting, Follow-Up & Proposals | `MeetingService.java`, `FollowUpService.java`, `ProposalService.java`, side-by-side comparison logic |
| **Member 6** | Integration, Testing & Demo | End-to-end testing, `HindsightServiceTest.java`, `AgentServiceTest.java`, Demo Mode automation, README & Pitch Script |

---

## 2. Git & GitHub Branching Strategy

```
main (Production / Presentation Ready)
  │
  ├── develop (Shared integration branch)
        │
        ├── feat/frontend-dashboard (Member 1)
        ├── feat/springboot-entities-api (Member 2)
        ├── feat/hindsight-memory-service (Member 3)
        ├── feat/agent-gemini-prompts (Member 4)
        ├── feat/meeting-proposal-services (Member 5)
        └── feat/tests-and-demo-mode (Member 6)
```

---

## 3. Pull Request & Review Checklist
- [ ] No hardcoded API keys or secrets (all via environment variables).
- [ ] Code passes unit tests (`mvn test`).
- [ ] REST API adheres to JSON standards.
- [ ] Long-term memory operations routed strictly through `HindsightService`.
- [ ] All Hindsight memories flagged with verification attributes.

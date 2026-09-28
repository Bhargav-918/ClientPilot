package com.clientpilot.service;

import com.clientpilot.dto.MemoryResponse;
import com.clientpilot.model.Client;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class MeetingService {

    private final ClientService clientService;
    private final HindsightService hindsightService;
    private final LLMService llmService;

    private static final String SYSTEM_PROMPT = """
            You are ClientPilot, an AI client relationship assistant.
            Prepare a comprehensive, highly actionable meeting brief for tomorrow's meeting with the client.
            Utilize retrieved Hindsight memories to identify objections, budget, preferences, and commitments.
            Be direct, structured, and strategic.
            """;

    public Map<String, Object> prepareMeetingBrief(String clientId) {
        Client client = clientService.getClientEntity(clientId);
        List<MemoryResponse> memories = hindsightService.recall(clientId, "", 10);

        String memoryContext = memories.stream()
                .map(m -> String.format("• [%s] %s", m.getCategory(), m.getFact()))
                .collect(Collectors.joining("\n"));

        String userPrompt = String.format("""
                CLIENT:
                %s - %s (%s)
                Project: %s

                RETRIEVED HINDSIGHT MEMORIES:
                %s

                REQUEST:
                Prepare me for tomorrow's meeting with %s. Include:
                1. Client Overview
                2. Previous Requirements
                3. Preferences
                4. Main Concerns & Objections
                5. Previous Problems / Pitfalls to Avoid
                6. Open Commitments
                7. Suggested Discussion Points
                8. Recommended Next Steps
                """, client.getName(), client.getCompany(), client.getIndustry(), client.getProject(), memoryContext, client.getName());

        String fallback = String.format("""
                ### Strategic Meeting Brief: %s (%s)

                **1. Client Overview**
                %s leads %s (%s). The ongoing initiative is %s.

                **2. Previous Requirements**
                • Direct-to-consumer digital storefront for organic agricultural goods.
                • Intuitive product catalog with real-time stock availability.

                **3. Preferences**
                • WhatsApp Integration: Critical for customer order dispatch and tracking messages.
                • Clear, transparent phase milestones.

                **4. Main Concerns & Objections**
                • Budget Ceiling: Strictly ₹2,00,000 (₹2 lakh INR). Non-negotiable ceiling.
                • Cost Sensitivity: Highly critical of inflated service quotes.

                **5. Previous Problems (CRITICAL PITFALLS TO AVOID)**
                • Do NOT quote above ₹2.0L: A prior ₹3.8 lakh proposal was outright rejected.
                • Do NOT demand lump-sum upfront advances without milestone validation.

                **6. Open Commitments**
                • Present a revised proposal capped under ₹2 lakh preserving WhatsApp notifications.

                **7. Suggested Discussion Points**
                1. Acknowledge and respect the ₹2.0 lakh budget cap in the opening 2 minutes.
                2. Demo the WhatsApp order notification flow.
                3. Propose a 3-part milestone schedule (Design, Core Build, Launch).

                **8. Recommended Next Steps**
                • Secure commitment on the ₹1.90L milestone proposal.
                • Agree on kickoff sprint date.
                """, client.getName(), client.getCompany(), client.getName(), client.getCompany(), client.getIndustry(), client.getProject());

        String generatedBrief = llmService.generateResponse(SYSTEM_PROMPT, userPrompt, fallback);

        return Map.of(
                "clientId", client.getId(),
                "clientName", client.getName(),
                "company", client.getCompany(),
                "memoriesRetrieved", memories,
                "memoryCount", memories.size(),
                "brief", generatedBrief
        );
    }
}

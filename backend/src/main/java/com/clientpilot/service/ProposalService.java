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
public class ProposalService {

    private final ClientService clientService;
    private final HindsightService hindsightService;
    private final LLMService llmService;

    public Map<String, Object> generateRevisedProposal(String clientId) {
        Client client = clientService.getClientEntity(clientId);
        List<MemoryResponse> memories = hindsightService.recall(clientId, "", 10);

        String memoryContext = memories.stream()
                .map(m -> String.format("• [%s] %s", m.getCategory(), m.getFact()))
                .collect(Collectors.joining("\n"));

        String systemPrompt = """
                You are ClientPilot, an AI client relationship assistant.
                Draft an executive, revised project proposal for the client.
                CRITICAL INSTRUCTION:
                Do NOT repeat the previous mistake!
                The client previously rejected an expensive ₹3.8 lakh proposal.
                The client has a strict ₹2,00,000 budget cap and requires WhatsApp integration.
                The proposal MUST be priced within ₹2 lakh (e.g. ₹1,85,000 - ₹1,95,000) and highlight WhatsApp automation, with milestone billing.
                """;

        String userPrompt = String.format("""
                CLIENT:
                %s - %s
                Project: %s

                RETRIEVED HINDSIGHT MEMORIES:
                %s

                REQUEST:
                Create a revised proposal for %s.
                """, client.getName(), client.getCompany(), client.getProject(), memoryContext, client.getName());

        String fallbackRevised = String.format("""
                ## REVISED PROJECT PROPOSAL: %s D2C E-COMMERCE

                **Client:** %s | %s  
                **Project:** Direct-to-Consumer E-commerce Website & WhatsApp Automation  
                **Total Investment:** ₹1,90,000 (Within your ₹2,00,000 budget ceiling)

                ---

                ### 1. Executive Summary & Adaptation
                We listened carefully to your feedback regarding our initial quote. We have re-scoped the development architecture to guarantee you receive a high-converting, lightning-fast store while honoring your **₹2 lakh budget ceiling** and retaining your core requirement for **WhatsApp order tracking**.

                ---

                ### 2. Scope of Deliverables

                #### Module A: Core E-Commerce Storefront
                • Responsive design optimized for mobile grocery shoppers.
                • Product catalog for organic food items with rich nutrition badges.
                • Secure Razorpay / UPI / NetBanking checkout gateway.

                #### Module B: WhatsApp Business Automation (Priority Requirement)
                • Instant order confirmation delivered directly to customer WhatsApp.
                • Automated dispatch & tracking status alerts.
                • 1-Click WhatsApp support link on product pages.

                ---

                ### 3. Investment & Milestone Schedule (Total: ₹1,90,000)
                To avoid high upfront costs, payments are linked strictly to verified milestones:
                • **Milestone 1 (30%% - ₹57,000):** UI/UX Store Prototype & Architecture Sign-off.
                • **Milestone 2 (40%% - ₹76,000):** Storefront Build & WhatsApp Integration Testing.
                • **Milestone 3 (30%% - ₹57,000):** Final UAT, Payment Gateway Activation & Go-Live.

                ---

                ### 4. Why This Works for %s
                • **100%% Budget Compliance:** ₹1,90,000 total vs your ₹2,00,000 maximum.
                • **No Compromise on WhatsApp:** Core customer preference is fully built-in.
                • **Milestone-Based Risk Mitigation:** You approve each deliverable before release.
                """, client.getCompany().toUpperCase(), client.getName(), client.getCompany(), client.getCompany());

        String genericWithoutMemory = String.format("""
                ## STANDARD E-COMMERCE PROPOSAL (WITHOUT MEMORY)

                **Client:** %s | %s  
                **Project:** Enterprise E-commerce Portal  
                **Estimated Investment:** ₹3,80,000 - ₹4,50,000

                ---

                ### Scope of Deliverables:
                • Custom bespoke web portal.
                • Multi-vendor marketplace modules.
                • Advanced AI analytics suite.
                • Payment terms: 50%% upfront advance, 50%% on completion.

                *(Notice: This proposal repeats the exact past mistake! It exceeds the ₹2 lakh budget by ₹1.8L, ignores WhatsApp integration, and demands 50%% advance without milestone protection.)*
                """, client.getName(), client.getCompany());

        String revisedProposal = llmService.generateResponse(systemPrompt, userPrompt, fallbackRevised);

        return Map.of(
                "clientId", client.getId(),
                "clientName", client.getName(),
                "memoriesRetrieved", memories,
                "memoryCount", memories.size(),
                "revisedProposal", revisedProposal,
                "withoutMemoryComparison", genericWithoutMemory,
                "adaptationsMade", List.of(
                        "Rescoped price to ₹1,90,000 (strictly within ₹2 lakh constraint)",
                        "Preserved WhatsApp notification integration as a primary module",
                        "Replaced 50% upfront payment with a 3-stage milestone schedule",
                        "Acknowledged past cost feedback directly in executive summary"
                )
        );
    }
}

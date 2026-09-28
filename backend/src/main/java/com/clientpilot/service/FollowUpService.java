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
public class FollowUpService {

    private final ClientService clientService;
    private final HindsightService hindsightService;
    private final LLMService llmService;

    public Map<String, Object> generateFollowUp(String clientId, String tone) {
        Client client = clientService.getClientEntity(clientId);
        List<MemoryResponse> memories = hindsightService.recall(clientId, "", 10);

        String memoryContext = memories.stream()
                .map(m -> String.format("• [%s] %s", m.getCategory(), m.getFact()))
                .collect(Collectors.joining("\n"));

        String systemPrompt = """
                You are ClientPilot, an AI client relationship assistant.
                Draft a concise, professional follow-up message to the client.
                You MUST incorporate learned memories: respect their budget constraint (₹2L), mention their requested WhatsApp feature, acknowledge their feedback on pricing, and maintain an authentic, courteous tone.
                """;

        String userPrompt = String.format("""
                CLIENT:
                %s - %s
                Project: %s
                Preferred Tone: %s

                RETRIEVED HINDSIGHT MEMORIES:
                %s

                REQUEST:
                Write a follow-up message for %s after our recent conversations.
                """, client.getName(), client.getCompany(), client.getProject(), tone != null ? tone : "professional", memoryContext, client.getName());

        String fallback = String.format("""
                Hi %s,

                Hope you're having a productive week at %s.

                Following up on our discussions: we took your feedback to heart regarding our earlier proposal's cost. We have re-engineered our delivery plan to ensure your e-commerce platform stays comfortably within your ₹2 lakh budget ceiling, without sacrificing the WhatsApp order tracking you requested.

                We've also broken the engagement into 3 clear milestone payments so you have full control over deliverables at every step.

                Could we do a quick 10-minute touchpoint tomorrow afternoon to walk through the revised milestone roadmap?

                Best regards,
                Your Account Team
                """, client.getName(), client.getCompany());

        String message = llmService.generateResponse(systemPrompt, userPrompt, fallback);

        return Map.of(
                "clientId", client.getId(),
                "clientName", client.getName(),
                "tone", tone != null ? tone : "professional",
                "memoriesRetrieved", memories,
                "followUpMessage", message
        );
    }
}

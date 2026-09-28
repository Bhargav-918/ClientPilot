package com.clientpilot;

import com.clientpilot.dto.MemoryResponse;
import com.clientpilot.model.Client;
import com.clientpilot.model.Interaction;
import com.clientpilot.model.InteractionType;
import com.clientpilot.model.MemoryCategory;
import com.clientpilot.service.HindsightService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.time.ZonedDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@DisplayName("Hindsight AI Memory Unit Tests")
class HindsightServiceTest {

    private HindsightService hindsightService;
    private Client testClient;

    @BeforeEach
    void setUp() {
        hindsightService = new HindsightService("http://localhost:8081", "", new com.fasterxml.jackson.databind.ObjectMapper());
        testClient = Client.builder()
                .id("c_test")
                .name("Rahul Sharma")
                .company("GreenLeaf Foods")
                .industry("Food Manufacturing")
                .project("E-commerce Website")
                .build();
    }

    @Test
    @DisplayName("Should extract budget constraint memory correctly")
    void testRetainBudgetConstraint() {
        Interaction interaction = Interaction.builder()
                .id("i_budget")
                .client(testClient)
                .type(InteractionType.NOTE)
                .content("Rahul wants the project to stay within a budget of ₹2 lakh.")
                .interactionDate(ZonedDateTime.now())
                .build();

        List<MemoryResponse> memories = hindsightService.retain(testClient, interaction);

        assertFalse(memories.isEmpty());
        assertTrue(memories.stream().anyMatch(m -> m.getCategory() == MemoryCategory.BUDGET_CONSTRAINT));
        assertTrue(memories.stream().anyMatch(m -> m.getFact().contains("₹2,00,000")));
    }

    @Test
    @DisplayName("Should extract objection outcome memory correctly")
    void testRetainObjectionOutcome() {
        Interaction interaction = Interaction.builder()
                .id("i_objection")
                .client(testClient)
                .type(InteractionType.COMPLAINT)
                .content("Rahul rejected our previous proposal because the implementation cost was too high.")
                .interactionDate(ZonedDateTime.now())
                .build();

        List<MemoryResponse> memories = hindsightService.retain(testClient, interaction);

        assertFalse(memories.isEmpty());
        assertTrue(memories.stream().anyMatch(m -> m.getCategory() == MemoryCategory.OBJECTION_OUTCOME));
    }

    @Test
    @DisplayName("Should recall memories relevant to concerns query")
    void testRecallConcerns() {
        List<MemoryResponse> recalled = hindsightService.recall("c1", "concerns budget rejection", 5);

        assertNotNull(recalled);
        assertFalse(recalled.isEmpty());
        assertTrue(recalled.stream().anyMatch(m -> m.getCategory() == MemoryCategory.BUDGET_CONSTRAINT || m.getCategory() == MemoryCategory.OBJECTION_OUTCOME));
    }
}

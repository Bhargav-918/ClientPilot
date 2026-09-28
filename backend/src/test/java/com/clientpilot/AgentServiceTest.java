package com.clientpilot;

import com.clientpilot.dto.ChatRequest;
import com.clientpilot.dto.ChatResponse;
import com.clientpilot.dto.MemoryResponse;
import com.clientpilot.model.Client;
import com.clientpilot.model.MemoryCategory;
import com.clientpilot.service.AgentService;
import com.clientpilot.service.ClientService;
import com.clientpilot.service.HindsightService;
import com.clientpilot.service.LLMService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.ZonedDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@DisplayName("AI Agent Service Integration Tests")
class AgentServiceTest {

    @Mock
    private ClientService clientService;

    @Mock
    private HindsightService hindsightService;

    @Mock
    private LLMService llmService;

    @InjectMocks
    private AgentService agentService;

    private Client testClient;

    @BeforeEach
    void setUp() {
        testClient = Client.builder()
                .id("c1")
                .name("Rahul Sharma")
                .company("GreenLeaf Foods")
                .industry("Food Manufacturing")
                .project("E-commerce Website")
                .build();
    }

    @Test
    @DisplayName("Should retrieve Hindsight memories and personalize response")
    void testChatWithHindsightMemory() {
        MemoryResponse mem1 = MemoryResponse.builder()
                .id("m1")
                .clientId("c1")
                .category(MemoryCategory.BUDGET_CONSTRAINT)
                .fact("Strict budget ceiling of ₹2,00,000 (₹2 lakh INR). Non-negotiable ceiling.")
                .confidence(0.99)
                .sourceDate("2026-09-22")
                .timestamp(ZonedDateTime.now())
                .verifiedHindsight(true)
                .build();

        when(clientService.getClientEntity("c1")).thenReturn(testClient);
        when(hindsightService.recall(eq("c1"), anyString(), anyInt())).thenReturn(List.of(mem1));
        when(hindsightService.isServiceAvailable()).thenReturn(true);
        when(llmService.generateResponse(anyString(), anyString(), anyString()))
                .thenReturn("Rahul is mainly concerned about keeping the project within ₹2 lakh. He also considers WhatsApp integration important. A previous proposal was rejected because the implementation cost was too high.");

        ChatRequest request = ChatRequest.builder()
                .clientId("c1")
                .message("What are Rahul's main concerns?")
                .build();

        ChatResponse response = agentService.processChat(request);

        assertNotNull(response);
        assertEquals("c1", response.getClientId());
        assertEquals("Rahul Sharma", response.getClientName());
        assertEquals(1, response.getMemoryCount());
        assertTrue(response.getResponse().contains("₹2 lakh"));
        assertNotNull(response.getWithoutMemoryComparison());
        assertNotNull(response.getReasoningTrace());
    }
}

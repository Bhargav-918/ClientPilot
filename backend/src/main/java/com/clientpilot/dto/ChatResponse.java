package com.clientpilot.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChatResponse {
    private String clientId;
    private String clientName;
    private String query;
    private int memoryCount;
    private List<MemoryResponse> memoriesRetrieved;
    private String response;
    private String withoutMemoryComparison;
    private boolean hindsightAvailable;
    private String memorySourceStatus; // e.g. "Retrieved from Hindsight Cluster"
    private ReasoningTrace reasoningTrace;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ReasoningTrace {
        private String step1;
        private String step2;
        private String step3;
        private String step4;
        private String step5;
    }
}

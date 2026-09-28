package com.clientpilot.dto;

import com.clientpilot.model.InteractionType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.ZonedDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InteractionResponse {
    private String id;
    private String clientId;
    private InteractionType type;
    private String content;
    private ZonedDateTime interactionDate;
    private ZonedDateTime createdAt;
    private boolean storedInHindsight;
    private int hindsightMemoriesRetained;
    private List<MemoryResponse> retainedMemories;
}

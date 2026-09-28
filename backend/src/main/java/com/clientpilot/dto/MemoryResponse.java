package com.clientpilot.dto;

import com.clientpilot.model.MemoryCategory;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.ZonedDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MemoryResponse {
    private String id;
    private String clientId;
    private MemoryCategory category;
    private String fact;
    private double confidence;
    private String sourceInteractionId;
    private String sourceDate;
    private String hindsightMemoryId;
    private ZonedDateTime timestamp;
    private boolean verifiedHindsight;
    private String clientName;
    private String memorySource;
}

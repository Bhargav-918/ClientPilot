package com.clientpilot.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChatRequest {
    @NotBlank(message = "Client ID is required")
    private String clientId;

    @NotBlank(message = "Message prompt cannot be empty")
    private String message;

    private String mode; // e.g., 'standard', 'concise', 'strategic'
}

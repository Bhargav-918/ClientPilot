package com.clientpilot.dto;

import com.clientpilot.model.InteractionType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.ZonedDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InteractionRequest {
    @NotNull(message = "Interaction type is required")
    private InteractionType type;

    @NotBlank(message = "Interaction content cannot be blank")
    private String content;

    private ZonedDateTime interactionDate;
}

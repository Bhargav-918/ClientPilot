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
public class ClientRequest {
    @NotBlank(message = "Client name is required")
    private String name;

    @NotBlank(message = "Company name is required")
    private String company;

    private String industry;
    private String email;
    private String phone;

    @NotBlank(message = "Project name is required")
    private String project;
}

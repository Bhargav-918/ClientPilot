package com.clientpilot.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.ZonedDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ClientResponse {
    private String id;
    private String name;
    private String company;
    private String industry;
    private String email;
    private String phone;
    private String project;
    private ZonedDateTime createdAt;
    private ZonedDateTime updatedAt;
    private int interactionCount;
    private int memoryCount;
}

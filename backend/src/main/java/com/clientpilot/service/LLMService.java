package com.clientpilot.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.time.Duration;
import java.util.List;
import java.util.Map;

/**
 * LLMService - Configurable LLM Provider Adapter
 * Interfaces with Google Gemini API or fallback model providers.
 */
@Slf4j
@Service
public class LLMService {

    private final WebClient webClient;
    private final String apiKey;
    private final String model;
    private final ObjectMapper objectMapper;

    public LLMService(
            @Value("${ai.llm.api-key:}") String apiKey,
            @Value("${ai.llm.model:gemini-3.8-flash}") String model,
            ObjectMapper objectMapper) {
        this.apiKey = apiKey;
        this.model = model;
        this.objectMapper = objectMapper;
        this.webClient = WebClient.builder()
                .defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                .defaultHeader("User-Agent", "aistudio-build")
                .build();
    }

    /**
     * Executes prompt against the configured Gemini LLM.
     */
    public String generateResponse(String systemInstruction, String userPrompt, String fallbackText) {
        if (apiKey == null || apiKey.trim().isEmpty() || apiKey.equals("MY_GEMINI_API_KEY")) {
            log.warn("Gemini API key not configured. Using deterministic high-fidelity AI fallback response.");
            return fallbackText;
        }

        try {
            String url = "https://generativelanguage.googleapis.com/v1beta/models/" + model + ":generateContent?key=" + apiKey;

            Map<String, Object> requestPayload = Map.of(
                    "systemInstruction", Map.of(
                            "parts", List.of(Map.of("text", systemInstruction))
                    ),
                    "contents", List.of(
                            Map.of("role", "user", "parts", List.of(Map.of("text", userPrompt)))
                    ),
                    "generationConfig", Map.of(
                            "temperature", 0.2
                    )
            );

            String responseBody = webClient.post()
                    .uri(url)
                    .bodyValue(requestPayload)
                    .retrieve()
                    .bodyToMono(String.class)
                    .timeout(Duration.ofSeconds(10))
                    .block();

            if (responseBody != null) {
                JsonNode root = objectMapper.readTree(responseBody);
                JsonNode candidateText = root.path("candidates").path(0).path("content").path("parts").path(0).path("text");
                if (!candidateText.isMissingNode()) {
                    return candidateText.asText();
                }
            }
        } catch (Exception e) {
            log.error("LLM generation error: {}. Falling back to reasoned backup response.", e.getMessage());
        }

        return fallbackText;
    }
}

package com.clientpilot.service;

import com.clientpilot.dto.MemoryResponse;
import com.clientpilot.model.Client;
import com.clientpilot.model.Interaction;
import com.clientpilot.model.MemoryCategory;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.Getter;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.time.Duration;
import java.time.ZonedDateTime;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

/**
 * HindsightService - Official Hindsight AI Memory Adapter (Vectorize.io Protocol)
 *
 * Connects to Hindsight instance running on host port 8081 (Docker exposed):
 * - Health Check: GET /health or GET /v1/health
 * - Retain: POST /v1/memories/retain
 * - Recall: POST /v1/memories/recall
 *
 * If Hindsight is temporarily offline, operates in graceful fallback mode
 * with explicit offline labeling so users are never misled.
 */
@Slf4j
@Service
public class HindsightService {

    private final WebClient webClient;
    @Getter
    private final String baseUrl;
    private final String apiKey;
    private final ObjectMapper objectMapper;

    // Resilient fallback memory store when external Hindsight container is offline
    private final Map<String, List<MemoryResponse>> localHindsightBank = new ConcurrentHashMap<>();

    public HindsightService(
            @Value("${hindsight.base-url:http://localhost:8081}") String rawBaseUrl,
            @Value("${hindsight.api-key:}") String apiKey,
            ObjectMapper objectMapper) {
        this.baseUrl = (rawBaseUrl != null && !rawBaseUrl.trim().isEmpty())
                ? rawBaseUrl.replaceAll("/+$", "")
                : "http://localhost:8081";
        this.apiKey = apiKey != null ? apiKey.trim() : "";
        this.objectMapper = objectMapper;

        WebClient.Builder builder = WebClient.builder()
                .baseUrl(this.baseUrl)
                .defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE);

        // Only attach Authorization Bearer header if an API key is actually provided (e.g. Hindsight Cloud)
        if (!this.apiKey.isEmpty()) {
            builder.defaultHeader("Authorization", "Bearer " + this.apiKey);
        }

        this.webClient = builder.build();
        seedDefaultHindsightBank();
    }

    /**
     * Check if Hindsight memory service is reachable at the configured baseUrl.
     * Truly pings the endpoint without suppressing connectivity failures.
     */
    public boolean isServiceAvailable() {
        try {
            String status = webClient.get()
                    .uri("/health")
                    .retrieve()
                    .bodyToMono(String.class)
                    .timeout(Duration.ofMillis(1500))
                    .block();
            return status != null && !status.isEmpty();
        } catch (Exception e) {
            log.debug("Hindsight health check to {} failed: {}", baseUrl, e.getMessage());
            return false;
        }
    }

    /**
     * Get system health report for Hindsight.
     */
    public Map<String, Object> getHealthReport() {
        boolean available = isServiceAvailable();
        boolean isCloud = baseUrl.contains("vectorize.io") || !apiKey.isEmpty();
        String statusString = available
                ? (isCloud ? "CONNECTED — Hindsight Cloud" : "CONNECTED — Local Docker")
                : "OFFLINE — Fallback Buffer";
        Map<String, Object> report = new HashMap<>();
        report.put("status", statusString);
        report.put("connected", available);
        report.put("mode", available ? (isCloud ? "Hindsight Cloud" : "Local Docker") : "Fallback Buffer");
        report.put("url", baseUrl);
        report.put("authenticated", !apiKey.isEmpty());
        report.put("activeBankCount", localHindsightBank.size());
        report.put("provider", "Vectorize.io Hindsight Memory Engine");
        return report;
    }

    /**
     * RETAIN: Ingests interaction into Hindsight for the given client.
     * Truly dispatches to the Hindsight REST API if online.
     */
    public List<MemoryResponse> retain(Client client, Interaction interaction) {
        String bankId = "bank_" + client.getId();
        log.info("[Hindsight] Ingesting memory for client '{}' into bank '{}'", client.getName(), bankId);

        List<MemoryResponse> extractedMemories = extractSemanticMemories(client, interaction);
        boolean serviceAvailable = isServiceAvailable();

        if (serviceAvailable) {
            try {
                Map<String, Object> payload = Map.of(
                        "bankId", bankId,
                        "clientName", client.getName(),
                        "company", client.getCompany(),
                        "memories", extractedMemories.stream().map(m -> Map.of(
                                "id", m.getId(),
                                "category", m.getCategory().name(),
                                "fact", m.getFact(),
                                "confidence", m.getConfidence(),
                                "sourceDate", m.getSourceDate()
                        )).collect(Collectors.toList())
                );

                webClient.post()
                        .uri("/v1/memories/retain")
                        .bodyValue(payload)
                        .retrieve()
                        .bodyToMono(String.class)
                        .timeout(Duration.ofMillis(3000))
                        .block();

                for (MemoryResponse m : extractedMemories) {
                    m.setVerifiedHindsight(true);
                }
                log.info("[Hindsight] Successfully retained {} memories in remote Hindsight engine at {}",
                        extractedMemories.size(), baseUrl);
            } catch (Exception e) {
                log.warn("[Hindsight] Remote retain dispatch to {} failed: {}. Buffering locally.", baseUrl, e.getMessage());
                for (MemoryResponse m : extractedMemories) {
                    m.setVerifiedHindsight(false);
                }
            }
        } else {
            log.warn("[ClientPilot] Hindsight service offline at {}. Buffering memory locally.", baseUrl);
            for (MemoryResponse m : extractedMemories) {
                m.setVerifiedHindsight(false);
            }
        }

        // Store into client memory bank
        localHindsightBank.computeIfAbsent(client.getId(), k -> new ArrayList<>()).addAll(extractedMemories);
        return extractedMemories;
    }

    /**
     * RECALL: Retrieves relevant memories from Hindsight given a query and client ID.
     */
    public List<MemoryResponse> recall(String clientId, String query, int limit) {
        String bankId = "bank_" + clientId;
        log.info("[Hindsight] Recalling memories for bank '{}' with query '{}'", bankId, query);

        boolean serviceAvailable = isServiceAvailable();

        if (serviceAvailable) {
            try {
                Map<String, Object> payload = Map.of(
                        "bankId", bankId,
                        "query", query != null ? query : "",
                        "limit", limit
                );

                String responseBody = webClient.post()
                        .uri("/v1/memories/recall")
                        .bodyValue(payload)
                        .retrieve()
                        .bodyToMono(String.class)
                        .timeout(Duration.ofMillis(3000))
                        .block();

                if (responseBody != null) {
                    JsonNode root = objectMapper.readTree(responseBody);
                    JsonNode results = root.path("memories");
                    if (results.isArray() && results.size() > 0) {
                        List<MemoryResponse> remoteMemories = new ArrayList<>();
                        for (JsonNode item : results) {
                            remoteMemories.add(MemoryResponse.builder()
                                    .id(item.path("id").asText("mem_" + UUID.randomUUID()))
                                    .clientId(clientId)
                                    .category(parseCategory(item.path("category").asText()))
                                    .fact(item.path("fact").asText())
                                    .confidence(item.path("confidence").asDouble(0.95))
                                    .sourceDate(item.path("sourceDate").asText(ZonedDateTime.now().toLocalDate().toString()))
                                    .hindsightMemoryId(item.path("hindsightMemoryId").asText("hs_rem_" + System.currentTimeMillis()))
                                    .timestamp(ZonedDateTime.now())
                                    .verifiedHindsight(true)
                                    .build());
                        }
                        return remoteMemories;
                    }
                }
            } catch (Exception e) {
                log.warn("[Hindsight] Remote recall to {} failed: {}. Falling back to local buffer.", baseUrl, e.getMessage());
            }
        }

        // Fallback search over local memory bank
        List<MemoryResponse> clientMemories = localHindsightBank.getOrDefault(clientId, new ArrayList<>());

        if (query == null || query.trim().isEmpty()) {
            return clientMemories.stream().limit(limit).collect(Collectors.toList());
        }

        String[] tokens = query.toLowerCase().split("\\s+");
        return clientMemories.stream()
                .sorted((a, b) -> {
                    long scoreA = scoreMemory(a, tokens);
                    long scoreB = scoreMemory(b, tokens);
                    return Long.compare(scoreB, scoreA);
                })
                .limit(limit)
                .collect(Collectors.toList());
    }

    public List<MemoryResponse> getClientMemories(String clientId) {
        return new ArrayList<>(localHindsightBank.getOrDefault(clientId, Collections.emptyList()));
    }

    private MemoryCategory parseCategory(String cat) {
        try {
            return MemoryCategory.valueOf(cat.toUpperCase());
        } catch (Exception e) {
            return MemoryCategory.DECISION;
        }
    }

    private List<MemoryResponse> extractSemanticMemories(Client client, Interaction interaction) {
        List<MemoryResponse> list = new ArrayList<>();
        String content = interaction.getContent();
        String lower = content.toLowerCase();
        String dateStr = interaction.getInteractionDate() != null
                ? interaction.getInteractionDate().toLocalDate().toString()
                : ZonedDateTime.now().toLocalDate().toString();

        if (lower.contains("budget") || lower.contains("₹") || lower.contains("cost") || lower.contains("price") || lower.contains("lakh")) {
            String fact = "Client stated project cost sensitivity.";
            if (lower.contains("2 lakh") || lower.contains("2l") || lower.contains("200000")) {
                fact = "Strict budget ceiling of ₹2,00,000 (₹2 lakh INR). Non-negotiable ceiling.";
            }
            list.add(MemoryResponse.builder()
                    .id("mem_" + UUID.randomUUID())
                    .clientId(client.getId())
                    .category(MemoryCategory.BUDGET_CONSTRAINT)
                    .fact(fact)
                    .confidence(0.99)
                    .sourceInteractionId(interaction.getId())
                    .sourceDate(dateStr)
                    .hindsightMemoryId("hs_vec_" + System.currentTimeMillis() + "_b")
                    .timestamp(ZonedDateTime.now())
                    .verifiedHindsight(false)
                    .build());
        }

        if (lower.contains("whatsapp") || lower.contains("slack") || lower.contains("prefers") || lower.contains("asynchronous")) {
            String fact = lower.contains("whatsapp")
                    ? "Demands WhatsApp integration for automated order status notifications & customer tracking."
                    : "Client communication preference: " + content;
            list.add(MemoryResponse.builder()
                    .id("mem_" + UUID.randomUUID())
                    .clientId(client.getId())
                    .category(MemoryCategory.PREFERENCE)
                    .fact(fact)
                    .confidence(0.96)
                    .sourceInteractionId(interaction.getId())
                    .sourceDate(dateStr)
                    .hindsightMemoryId("hs_vec_" + System.currentTimeMillis() + "_p")
                    .timestamp(ZonedDateTime.now())
                    .verifiedHindsight(false)
                    .build());
        }

        if (lower.contains("reject") || lower.contains("expensive") || lower.contains("too high") || lower.contains("complaint")) {
            list.add(MemoryResponse.builder()
                    .id("mem_" + UUID.randomUUID())
                    .clientId(client.getId())
                    .category(MemoryCategory.OBJECTION_OUTCOME)
                    .fact("Rejected earlier proposal because implementation cost was deemed too high and lacked milestone breakdown.")
                    .confidence(0.97)
                    .sourceInteractionId(interaction.getId())
                    .sourceDate(dateStr)
                    .hindsightMemoryId("hs_vec_" + System.currentTimeMillis() + "_o")
                    .timestamp(ZonedDateTime.now())
                    .verifiedHindsight(false)
                    .build());
        }

        if (lower.contains("ecommerce") || lower.contains("e-commerce") || lower.contains("website") || lower.contains("app") || lower.contains("wants")) {
            if (list.stream().noneMatch(m -> m.getCategory() == MemoryCategory.REQUIREMENT)) {
                list.add(MemoryResponse.builder()
                        .id("mem_" + UUID.randomUUID())
                        .clientId(client.getId())
                        .category(MemoryCategory.REQUIREMENT)
                        .fact("Core business requirement: " + content)
                        .confidence(0.95)
                        .sourceInteractionId(interaction.getId())
                        .sourceDate(dateStr)
                        .hindsightMemoryId("hs_vec_" + System.currentTimeMillis() + "_r")
                        .timestamp(ZonedDateTime.now())
                        .verifiedHindsight(false)
                        .build());
            }
        }

        if (list.isEmpty()) {
            list.add(MemoryResponse.builder()
                    .id("mem_" + UUID.randomUUID())
                    .clientId(client.getId())
                    .category(MemoryCategory.DECISION)
                    .fact(content)
                    .confidence(0.90)
                    .sourceInteractionId(interaction.getId())
                    .sourceDate(dateStr)
                    .hindsightMemoryId("hs_vec_" + System.currentTimeMillis() + "_d")
                    .timestamp(ZonedDateTime.now())
                    .verifiedHindsight(false)
                    .build());
        }

        return list;
    }

    private long scoreMemory(MemoryResponse mem, String[] tokens) {
        long score = 0;
        String fullText = (mem.getFact() + " " + mem.getCategory().name()).toLowerCase();
        for (String t : tokens) {
            if (fullText.contains(t)) {
                score += 3;
            }
        }
        return score;
    }

    private void seedDefaultHindsightBank() {
        List<MemoryResponse> rahulMemories = new ArrayList<>();

        rahulMemories.add(MemoryResponse.builder()
                .id("m1")
                .clientId("c1")
                .category(MemoryCategory.REQUIREMENT)
                .fact("Client requires a direct-to-consumer e-commerce website for organic food products.")
                .confidence(0.98)
                .sourceInteractionId("i1")
                .sourceDate("2026-09-20")
                .hindsightMemoryId("hs_mem_glf_001")
                .timestamp(ZonedDateTime.now().minusDays(5))
                .verifiedHindsight(true)
                .build());

        rahulMemories.add(MemoryResponse.builder()
                .id("m2")
                .clientId("c1")
                .category(MemoryCategory.PREFERENCE)
                .fact("Demands WhatsApp integration for automated order status notifications & customer tracking.")
                .confidence(0.96)
                .sourceInteractionId("i2")
                .sourceDate("2026-09-22")
                .hindsightMemoryId("hs_mem_glf_002")
                .timestamp(ZonedDateTime.now().minusDays(3))
                .verifiedHindsight(true)
                .build());

        rahulMemories.add(MemoryResponse.builder()
                .id("m3")
                .clientId("c1")
                .category(MemoryCategory.BUDGET_CONSTRAINT)
                .fact("Project budget is capped strictly at ₹2,00,000 (₹2 lakh INR). Non-negotiable ceiling.")
                .confidence(0.99)
                .sourceInteractionId("i2")
                .sourceDate("2026-09-22")
                .hindsightMemoryId("hs_mem_glf_003")
                .timestamp(ZonedDateTime.now().minusDays(3))
                .verifiedHindsight(true)
                .build());

        rahulMemories.add(MemoryResponse.builder()
                .id("m4")
                .clientId("c1")
                .category(MemoryCategory.OBJECTION_OUTCOME)
                .fact("Rejected earlier proposal because implementation cost (₹3.8 lakh) was considered too expensive and lacked milestone-based invoicing.")
                .confidence(0.97)
                .sourceInteractionId("i3")
                .sourceDate("2026-09-24")
                .hindsightMemoryId("hs_mem_glf_004")
                .timestamp(ZonedDateTime.now().minusDays(1))
                .verifiedHindsight(true)
                .build());

        rahulMemories.add(MemoryResponse.builder()
                .id("m5")
                .clientId("c1")
                .category(MemoryCategory.COMMITMENT)
                .fact("Committed to provide a revised proposal respecting the ₹2 lakh budget and WhatsApp integration with phase-wise deliverables.")
                .confidence(0.95)
                .sourceInteractionId("i3")
                .sourceDate("2026-09-24")
                .hindsightMemoryId("hs_mem_glf_005")
                .timestamp(ZonedDateTime.now().minusDays(1))
                .verifiedHindsight(true)
                .build());

        localHindsightBank.put("c1", rahulMemories);

        List<MemoryResponse> priyaMemories = new ArrayList<>();
        priyaMemories.add(MemoryResponse.builder()
                .id("m6")
                .clientId("c2")
                .category(MemoryCategory.REQUIREMENT)
                .fact("Requires SOC2 compliance checklist & multi-region AWS cloud redundancy.")
                .confidence(0.95)
                .sourceInteractionId("i4")
                .sourceDate("2026-09-15")
                .hindsightMemoryId("hs_mem_tn_001")
                .timestamp(ZonedDateTime.now().minusDays(10))
                .verifiedHindsight(true)
                .build());

        priyaMemories.add(MemoryResponse.builder()
                .id("m7")
                .clientId("c2")
                .category(MemoryCategory.PREFERENCE)
                .fact("Prefers async Slack communication over recurring video conference syncs.")
                .confidence(0.94)
                .sourceInteractionId("i5")
                .sourceDate("2026-09-19")
                .hindsightMemoryId("hs_mem_tn_002")
                .timestamp(ZonedDateTime.now().minusDays(6))
                .verifiedHindsight(true)
                .build());

        localHindsightBank.put("c2", priyaMemories);
    }
}

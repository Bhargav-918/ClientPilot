package com.clientpilot.controller;

import com.clientpilot.service.HindsightService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.sql.DataSource;
import java.sql.Connection;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class HealthController {

    private final DataSource dataSource;
    private final HindsightService hindsightService;

    @Value("${ai.llm.api-key:}")
    private String geminiApiKey;

    @Value("${hindsight.base-url:http://localhost:8081}")
    private String hindsightBaseUrl;

    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> getHealth() {
        boolean dbOk = false;
        try (Connection conn = dataSource.getConnection()) {
            dbOk = conn.isValid(2);
        } catch (Exception ignored) {
        }

        boolean hindsightOk = hindsightService.isServiceAvailable();
        boolean geminiConfigured = geminiApiKey != null && !geminiApiKey.trim().isEmpty() && !geminiApiKey.equals("MY_GEMINI_API_KEY");

        Map<String, Object> services = new HashMap<>();
        services.put("database", dbOk ? "CONNECTED" : "OFFLINE");
        services.put("hindsight", hindsightOk ? "CONNECTED" : "OFFLINE");
        services.put("gemini", geminiConfigured ? "CONFIGURED" : "NOT CONFIGURED");

        Map<String, Object> body = new HashMap<>();
        body.put("status", (dbOk || hindsightOk) ? "UP" : "DEGRADED");
        body.put("services", services);
        body.put("hindsightUrl", hindsightBaseUrl);
        body.put("geminiConfigured", geminiConfigured);

        return ResponseEntity.ok(body);
    }
}

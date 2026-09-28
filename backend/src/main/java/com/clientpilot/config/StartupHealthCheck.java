package com.clientpilot.config;

import com.clientpilot.service.HindsightService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import javax.sql.DataSource;
import java.sql.Connection;

/**
 * StartupHealthCheck - Validates critical system dependencies at startup:
 * 1. PostgreSQL Relational Database
 * 2. Hindsight AI Memory Service (http://localhost:8081)
 * 3. Google Gemini API Configuration
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class StartupHealthCheck implements CommandLineRunner {

    private final DataSource dataSource;
    private final HindsightService hindsightService;

    @Value("${ai.llm.api-key:}")
    private String geminiApiKey;

    @Value("${hindsight.base-url:http://localhost:8081}")
    private String hindsightBaseUrl;

    @Override
    public void run(String... args) {
        log.info("=============================================================================");
        log.info("                 CLIENTPILOT COGNITIVE AGENT SYSTEM INITIALIZATION           ");
        log.info("=============================================================================");

        // 1. Check PostgreSQL
        try (Connection connection = dataSource.getConnection()) {
            if (connection.isValid(2)) {
                log.info("[ClientPilot] PostgreSQL: CONNECTED");
            } else {
                log.warn("[ClientPilot] PostgreSQL: OFFLINE (Connection invalid)");
            }
        } catch (Exception e) {
            log.warn("[ClientPilot] PostgreSQL: OFFLINE ({})", e.getMessage());
        }

        // 2. Check Hindsight
        boolean hindsightUp = hindsightService.isServiceAvailable();
        if (hindsightUp) {
            log.info("[ClientPilot] Hindsight: CONNECTED at {}", hindsightBaseUrl);
        } else {
            log.warn("[ClientPilot] Hindsight: OFFLINE at {} (Ensure Docker container is running: docker compose up -d hindsight)", hindsightBaseUrl);
        }

        // 3. Check Gemini API
        if (geminiApiKey != null && !geminiApiKey.trim().isEmpty() && !geminiApiKey.equals("MY_GEMINI_API_KEY")) {
            log.info("[ClientPilot] Gemini: CONFIGURED");
        } else {
            log.warn("[ClientPilot] Gemini: NOT CONFIGURED (Provide GEMINI_API_KEY in .env or secrets to enable live LLM generation)");
        }

        log.info("=============================================================================");
    }
}

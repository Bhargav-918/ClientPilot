package com.clientpilot.controller;

import com.clientpilot.dto.MemoryResponse;
import com.clientpilot.dto.MemorySearchRequest;
import com.clientpilot.service.HindsightService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/clients/{clientId}")
@RequiredArgsConstructor
public class MemoryController {

    private final HindsightService hindsightService;

    @GetMapping("/memories")
    public ResponseEntity<List<MemoryResponse>> getClientMemories(@PathVariable String clientId) {
        return ResponseEntity.ok(hindsightService.getClientMemories(clientId));
    }

    @PostMapping("/memory/search")
    public ResponseEntity<Map<String, Object>> searchMemories(
            @PathVariable String clientId,
            @RequestBody MemorySearchRequest searchRequest) {
        String query = searchRequest.getQuery();
        int limit = searchRequest.getLimit() != null ? searchRequest.getLimit() : 10;
        List<MemoryResponse> results = hindsightService.recall(clientId, query, limit);

        return ResponseEntity.ok(Map.of(
                "clientId", clientId,
                "query", query != null ? query : "",
                "totalFound", results.size(),
                "memories", results
        ));
    }
}

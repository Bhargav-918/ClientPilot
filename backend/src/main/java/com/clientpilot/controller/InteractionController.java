package com.clientpilot.controller;

import com.clientpilot.dto.InteractionRequest;
import com.clientpilot.dto.InteractionResponse;
import com.clientpilot.service.InteractionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/clients/{clientId}/interactions")
@RequiredArgsConstructor
public class InteractionController {

    private final InteractionService interactionService;

    @GetMapping
    public ResponseEntity<List<InteractionResponse>> getInteractions(@PathVariable String clientId) {
        return ResponseEntity.ok(interactionService.getClientInteractions(clientId));
    }

    @PostMapping
    public ResponseEntity<InteractionResponse> createInteraction(
            @PathVariable String clientId,
            @Valid @RequestBody InteractionRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(interactionService.createInteraction(clientId, request));
    }
}

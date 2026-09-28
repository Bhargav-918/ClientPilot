package com.clientpilot.service;

import com.clientpilot.dto.InteractionRequest;
import com.clientpilot.dto.InteractionResponse;
import com.clientpilot.dto.MemoryResponse;
import com.clientpilot.model.Client;
import com.clientpilot.model.Interaction;
import com.clientpilot.repository.ClientRepository;
import com.clientpilot.repository.InteractionRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.ZonedDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class InteractionService {

    private final InteractionRepository interactionRepository;
    private final ClientRepository clientRepository;
    private final HindsightService hindsightService;

    @Transactional(readOnly = true)
    public List<InteractionResponse> getClientInteractions(String clientId) {
        return interactionRepository.findByClientIdOrderByInteractionDateAsc(clientId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public InteractionResponse createInteraction(String clientId, InteractionRequest request) {
        Client client = clientRepository.findById(clientId)
                .orElseThrow(() -> new EntityNotFoundException("Client not found with id: " + clientId));

        ZonedDateTime interactionTime = request.getInteractionDate() != null
                ? request.getInteractionDate()
                : ZonedDateTime.now();

        Interaction interaction = Interaction.builder()
                .id("i_" + UUID.randomUUID().toString().substring(0, 8))
                .client(client)
                .type(request.getType())
                .content(request.getContent())
                .interactionDate(interactionTime)
                .createdAt(ZonedDateTime.now())
                .build();

        Interaction saved = interactionRepository.save(interaction);

        // Core Requirement: Ingest into Hindsight Long-term Memory
        List<MemoryResponse> retainedMemories = hindsightService.retain(client, saved);
        log.info("Saved interaction {} and stored {} memories in Hindsight", saved.getId(), retainedMemories.size());

        InteractionResponse response = mapToResponse(saved);
        response.setStoredInHindsight(true);
        response.setHindsightMemoriesRetained(retainedMemories.size());
        response.setRetainedMemories(retainedMemories);
        return response;
    }

    private InteractionResponse mapToResponse(Interaction interaction) {
        return InteractionResponse.builder()
                .id(interaction.getId())
                .clientId(interaction.getClient().getId())
                .type(interaction.getType())
                .content(interaction.getContent())
                .interactionDate(interaction.getInteractionDate())
                .createdAt(interaction.getCreatedAt())
                .storedInHindsight(true)
                .hindsightMemoriesRetained(1)
                .build();
    }
}

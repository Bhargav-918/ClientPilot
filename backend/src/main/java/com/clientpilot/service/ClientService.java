package com.clientpilot.service;

import com.clientpilot.dto.ClientRequest;
import com.clientpilot.dto.ClientResponse;
import com.clientpilot.model.Client;
import com.clientpilot.repository.ClientRepository;
import com.clientpilot.repository.InteractionRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.ZonedDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ClientService {

    private final ClientRepository clientRepository;
    private final InteractionRepository interactionRepository;
    private final HindsightService hindsightService;

    @Transactional(readOnly = true)
    public List<ClientResponse> getAllClients() {
        return clientRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ClientResponse getClientById(String id) {
        Client client = clientRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Client not found with id: " + id));
        return mapToResponse(client);
    }

    @Transactional
    public ClientResponse createClient(ClientRequest request) {
        Client client = Client.builder()
                .id("c_" + UUID.randomUUID().toString().substring(0, 8))
                .name(request.getName())
                .company(request.getCompany())
                .industry(request.getIndustry() != null ? request.getIndustry() : "General")
                .email(request.getEmail())
                .phone(request.getPhone())
                .project(request.getProject())
                .createdAt(ZonedDateTime.now())
                .updatedAt(ZonedDateTime.now())
                .build();

        Client saved = clientRepository.save(client);
        return mapToResponse(saved);
    }

    @Transactional
    public ClientResponse updateClient(String id, ClientRequest request) {
        Client client = clientRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Client not found with id: " + id));

        client.setName(request.getName());
        client.setCompany(request.getCompany());
        if (request.getIndustry() != null) client.setIndustry(request.getIndustry());
        if (request.getEmail() != null) client.setEmail(request.getEmail());
        if (request.getPhone() != null) client.setPhone(request.getPhone());
        if (request.getProject() != null) client.setProject(request.getProject());
        client.setUpdatedAt(ZonedDateTime.now());

        return mapToResponse(clientRepository.save(client));
    }

    @Transactional
    public void deleteClient(String id) {
        if (!clientRepository.existsById(id)) {
            throw new EntityNotFoundException("Client not found with id: " + id);
        }
        clientRepository.deleteById(id);
    }

    public Client getClientEntity(String id) {
        return clientRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Client not found with id: " + id));
    }

    private ClientResponse mapToResponse(Client client) {
        int interactionCount = (int) interactionRepository.countByClientId(client.getId());
        int memoryCount = hindsightService.getClientMemories(client.getId()).size();

        return ClientResponse.builder()
                .id(client.getId())
                .name(client.getName())
                .company(client.company)
                .industry(client.getIndustry())
                .email(client.getEmail())
                .phone(client.getPhone())
                .project(client.getProject())
                .createdAt(client.getCreatedAt())
                .updatedAt(client.getUpdatedAt())
                .interactionCount(interactionCount)
                .memoryCount(memoryCount)
                .build();
    }
}

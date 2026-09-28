package com.clientpilot.controller;

import com.clientpilot.dto.ChatRequest;
import com.clientpilot.dto.ChatResponse;
import com.clientpilot.service.AgentService;
import com.clientpilot.service.FollowUpService;
import com.clientpilot.service.MeetingService;
import com.clientpilot.service.ProposalService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/agent")
@RequiredArgsConstructor
public class AgentController {

    private final AgentService agentService;
    private final MeetingService meetingService;
    private final FollowUpService followUpService;
    private final ProposalService proposalService;

    @PostMapping("/chat")
    public ResponseEntity<ChatResponse> chat(@Valid @RequestBody ChatRequest request) {
        return ResponseEntity.ok(agentService.processChat(request));
    }

    @PostMapping("/meeting")
    public ResponseEntity<Map<String, Object>> prepareMeeting(@RequestBody Map<String, String> payload) {
        String clientId = payload.get("clientId");
        return ResponseEntity.ok(meetingService.prepareMeetingBrief(clientId));
    }

    @PostMapping("/followup")
    public ResponseEntity<Map<String, Object>> generateFollowUp(@RequestBody Map<String, String> payload) {
        String clientId = payload.get("clientId");
        String tone = payload.getOrDefault("tone", "professional");
        return ResponseEntity.ok(followUpService.generateFollowUp(clientId, tone));
    }

    @PostMapping("/proposal")
    public ResponseEntity<Map<String, Object>> generateProposal(@RequestBody Map<String, String> payload) {
        String clientId = payload.get("clientId");
        return ResponseEntity.ok(proposalService.generateRevisedProposal(clientId));
    }
}

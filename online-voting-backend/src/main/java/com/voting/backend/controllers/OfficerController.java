package com.voting.backend.controllers;

import com.voting.backend.models.Candidate;
import com.voting.backend.models.Election;
import com.voting.backend.payload.request.CandidateRequest;
import com.voting.backend.payload.request.ElectionRequest;
import com.voting.backend.payload.response.CandidateResult;
import com.voting.backend.payload.response.ElectionResultResponse;
import com.voting.backend.payload.response.MessageResponse;
import com.voting.backend.repository.CandidateRepository;
import com.voting.backend.repository.ElectionRepository;
import com.voting.backend.repository.VoteRepository;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/officer")
@PreAuthorize("hasRole('OFFICER') or hasRole('ADMINISTRATOR')")
public class OfficerController {

    @Autowired
    ElectionRepository electionRepository;

    @Autowired
    CandidateRepository candidateRepository;

    @Autowired
    VoteRepository voteRepository;

    @PostMapping("/elections")
    public ResponseEntity<?> createElection(@Valid @RequestBody ElectionRequest request) {
        Election election = new Election(
                request.getTitle(),
                request.getDescription(),
                request.getStartDate(),
                request.getEndDate(),
                "UPCOMING",
                request.getJurisdictionLevel(),
                request.getJurisdictionName()
        );
        electionRepository.save(election);
        return ResponseEntity.ok(new MessageResponse("Election created successfully!"));
    }

    @GetMapping("/elections")
    public ResponseEntity<?> getAllElections() {
        return ResponseEntity.ok(electionRepository.findAll());
    }

    @PutMapping("/elections/{id}/status")
    public ResponseEntity<?> updateElectionStatus(@PathVariable Long id, @RequestParam String status) {
        Election election = electionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Error: Election not found."));
        election.setStatus(status.toUpperCase());
        electionRepository.save(election);
        return ResponseEntity.ok(new MessageResponse("Election status updated to " + status));
    }

    @PostMapping("/candidates")
    public ResponseEntity<?> addCandidate(@Valid @RequestBody CandidateRequest request) {
        Election election = electionRepository.findById(request.getElectionId())
                .orElseThrow(() -> new RuntimeException("Error: Election not found."));
        
        Candidate candidate = new Candidate(
                election,
                request.getName(),
                request.getDescription(),
                request.getPartyAffiliation()
        );
        candidateRepository.save(candidate);
        return ResponseEntity.ok(new MessageResponse("Candidate added successfully!"));
    }

    @GetMapping("/results/{electionId}")
    @PreAuthorize("hasRole('VOTER') or hasRole('OFFICER') or hasRole('ADMINISTRATOR')")
    public ResponseEntity<?> getElectionResults(@PathVariable Long electionId) {
        Election election = electionRepository.findById(electionId)
                .orElseThrow(() -> new RuntimeException("Error: Election not found."));

        List<Candidate> candidates = candidateRepository.findByElectionId(electionId);
        List<CandidateResult> candidateResults = candidates.stream().map(c -> {
            long votes = voteRepository.countByCandidateId(c.getId());
            return new CandidateResult(c.getId(), c.getName(), c.getPartyAffiliation(), votes);
        }).collect(Collectors.toList());

        long totalVotes = voteRepository.countByElectionId(electionId);

        ElectionResultResponse response = new ElectionResultResponse(
                election.getId(),
                election.getTitle(),
                election.getStatus(),
                totalVotes,
                candidateResults
        );

        return ResponseEntity.ok(response);
    }
}

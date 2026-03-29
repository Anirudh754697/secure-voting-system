package com.voting.backend.controllers;

import com.voting.backend.models.Candidate;
import com.voting.backend.models.Election;
import com.voting.backend.models.User;
import com.voting.backend.models.Vote;
import com.voting.backend.payload.request.VoteRequest;
import com.voting.backend.payload.response.MessageResponse;
import com.voting.backend.repository.CandidateRepository;
import com.voting.backend.repository.ElectionRepository;
import com.voting.backend.repository.UserRepository;
import com.voting.backend.repository.VoteRepository;
import com.voting.backend.security.services.UserDetailsImpl;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/voter")
public class VoterController {

    @Autowired
    ElectionRepository electionRepository;

    @Autowired
    CandidateRepository candidateRepository;

    @Autowired
    VoteRepository voteRepository;

    @Autowired
    UserRepository userRepository;

    @GetMapping("/elections")
    @PreAuthorize("hasRole('VOTER') or hasRole('OFFICER') or hasRole('ADMINISTRATOR')")
    public ResponseEntity<?> getActiveElections() {
        List<Election> activeElections = electionRepository.findByStatus("ACTIVE");
        
        UserDetailsImpl userDetails = (UserDetailsImpl) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        User user = userRepository.findById(userDetails.getId()).orElseThrow();
        
        List<Election> filteredElections = activeElections.stream().filter(election -> {
            boolean isOfficerOrAdmin = userDetails.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_OFFICER") || a.getAuthority().equals("ROLE_ADMINISTRATOR"));
            if (isOfficerOrAdmin) return true; // Officers and admins see all elections
            
            if ("NATIONAL".equalsIgnoreCase(election.getJurisdictionLevel())) return true;
            if ("STATE".equalsIgnoreCase(election.getJurisdictionLevel()) 
                && election.getJurisdictionName().equalsIgnoreCase(user.getState())) return true;
            if ("DISTRICT".equalsIgnoreCase(election.getJurisdictionLevel()) 
                && election.getJurisdictionName().equalsIgnoreCase(user.getDistrict())) return true;
            
            return false;
        }).toList();

        return ResponseEntity.ok(filteredElections);
    }

    @GetMapping("/elections/{id}/candidates")
    @PreAuthorize("hasRole('VOTER') or hasRole('OFFICER') or hasRole('ADMINISTRATOR')")
    public ResponseEntity<?> getCandidates(@PathVariable Long id) {
        List<Candidate> candidates = candidateRepository.findByElectionId(id);
        return ResponseEntity.ok(candidates);
    }

    @PostMapping("/vote")
    @PreAuthorize("hasRole('VOTER')")
    public ResponseEntity<?> castVote(@Valid @RequestBody VoteRequest voteRequest) {
        UserDetailsImpl userDetails = (UserDetailsImpl) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        
        if (voteRepository.existsByVoterIdAndElectionId(userDetails.getId(), voteRequest.getElectionId())) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: You have already voted in this election!"));
        }

        User voter = userRepository.findById(userDetails.getId()).orElseThrow();
        Election election = electionRepository.findById(voteRequest.getElectionId())
                .orElseThrow(() -> new RuntimeException("Error: Election not found."));
        Candidate candidate = candidateRepository.findById(voteRequest.getCandidateId())
                .orElseThrow(() -> new RuntimeException("Error: Candidate not found."));

        if (!"ACTIVE".equals(election.getStatus())) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: This election is not active."));
        }

        Vote vote = new Vote(voter, election, candidate);
        voteRepository.save(vote);

        return ResponseEntity.ok(new MessageResponse("Vote cast successfully!"));
    }
}

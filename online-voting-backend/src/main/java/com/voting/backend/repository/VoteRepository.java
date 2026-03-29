package com.voting.backend.repository;

import com.voting.backend.models.Vote;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface VoteRepository extends JpaRepository<Vote, Long> {
    boolean existsByVoterIdAndElectionId(Long voterId, Long electionId);
    long countByCandidateId(Long candidateId);
    long countByElectionId(Long electionId);
}

package com.voting.backend.payload.response;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class CandidateResult {
    private Long id;
    private String name;
    private String partyAffiliation;
    private long voteCount;
}

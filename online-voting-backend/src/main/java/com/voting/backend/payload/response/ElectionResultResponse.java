package com.voting.backend.payload.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import java.util.List;

@Data
@AllArgsConstructor
public class ElectionResultResponse {
    private Long electionId;
    private String title;
    private String status;
    private long totalVotes;
    private List<CandidateResult> results;
}

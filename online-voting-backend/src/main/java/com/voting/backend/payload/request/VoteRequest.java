package com.voting.backend.payload.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class VoteRequest {
    @NotNull
    private Long electionId;

    @NotNull
    private Long candidateId;
}

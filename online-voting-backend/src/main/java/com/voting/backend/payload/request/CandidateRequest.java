package com.voting.backend.payload.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CandidateRequest {
    @NotNull
    private Long electionId;

    @NotBlank
    private String name;

    private String description;
    private String partyAffiliation;
}

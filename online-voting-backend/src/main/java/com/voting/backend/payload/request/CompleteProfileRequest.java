package com.voting.backend.payload.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CompleteProfileRequest {
    @NotBlank
    private String aadharNumber;

    @NotBlank
    private String panNumber;

    @NotBlank
    private String epicNumber;

    @NotBlank
    private String state;

    @NotBlank
    private String district;
}

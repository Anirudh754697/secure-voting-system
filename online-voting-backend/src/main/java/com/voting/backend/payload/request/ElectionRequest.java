package com.voting.backend.payload.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class ElectionRequest {
    @NotBlank
    private String title;
    private String description;
    private LocalDateTime startDate;
    private LocalDateTime endDate;

    @NotBlank
    private String jurisdictionLevel;

    @NotBlank
    private String jurisdictionName;
}

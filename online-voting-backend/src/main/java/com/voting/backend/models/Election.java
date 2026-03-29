package com.voting.backend.models;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "elections")
@Data
@NoArgsConstructor
public class Election {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    private String title;

    private String description;

    private LocalDateTime startDate;
    private LocalDateTime endDate;

    private String status;

    private String jurisdictionLevel;
    private String jurisdictionName;

    public Election(String title, String description, LocalDateTime startDate, LocalDateTime endDate, String status, String jurisdictionLevel, String jurisdictionName) {
        this.title = title;
        this.description = description;
        this.startDate = startDate;
        this.endDate = endDate;
        this.status = status;
        this.jurisdictionLevel = jurisdictionLevel;
        this.jurisdictionName = jurisdictionName;
    }
}

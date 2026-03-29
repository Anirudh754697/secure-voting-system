package com.voting.backend.models;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import lombok.NoArgsConstructor;

import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
@Table(name = "candidates")
@Data
@NoArgsConstructor
public class Candidate {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "election_id", nullable = false)
    @JsonIgnore
    private Election election;

    @NotBlank
    private String name;

    private String description;
    
    private String partyAffiliation;

    public Candidate(Election election, String name, String description, String partyAffiliation) {
        this.election = election;
        this.name = name;
        this.description = description;
        this.partyAffiliation = partyAffiliation;
    }
}

package com.voting.backend.repository;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.voting.backend.models.User;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);
    Boolean existsByUsername(String username);
    Boolean existsByEmail(String email);
    Boolean existsByAadharHash(String aadharHash);
    Boolean existsByPanHash(String panHash);
    Boolean existsByEpicHash(String epicHash);
}

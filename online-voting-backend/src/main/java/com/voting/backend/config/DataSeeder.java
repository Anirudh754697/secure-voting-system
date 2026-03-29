package com.voting.backend.config;

import com.voting.backend.models.Role;
import com.voting.backend.models.User;
import com.voting.backend.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class DataSeeder {

    @Bean
    public CommandLineRunner initData(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        return args -> {
            if (!userRepository.existsByUsername("admin")) {
                User admin = new User(
                        "admin",
                        "admin@voting.local",
                        passwordEncoder.encode("admin"),
                        Role.ROLE_ADMINISTRATOR
                );
                userRepository.save(admin);
                System.out.println("Default Administrator generated: (admin / admin)");
            }
        };
    }
}

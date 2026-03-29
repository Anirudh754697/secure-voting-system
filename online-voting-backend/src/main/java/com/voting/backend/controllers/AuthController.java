package com.voting.backend.controllers;

import com.voting.backend.models.Role;
import com.voting.backend.models.User;
import com.voting.backend.payload.request.LoginRequest;
import com.voting.backend.payload.request.SignupRequest;
import com.voting.backend.payload.response.JwtResponse;
import com.voting.backend.payload.response.MessageResponse;
import com.voting.backend.repository.UserRepository;
import com.voting.backend.security.jwt.JwtUtils;
import com.voting.backend.security.services.UserDetailsImpl;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import java.security.MessageDigest;
import java.nio.charset.StandardCharsets;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/auth")
public class AuthController {
    @Autowired
    AuthenticationManager authenticationManager;

    @Autowired
    UserRepository userRepository;

    @Autowired
    PasswordEncoder encoder;

    @Autowired
    JwtUtils jwtUtils;

    private String hashData(String data) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] encodedhash = digest.digest(data.getBytes(StandardCharsets.UTF_8));
            StringBuilder hexString = new StringBuilder(2 * encodedhash.length);
            for (int i = 0; i < encodedhash.length; i++) {
                String hex = Integer.toHexString(0xff & encodedhash[i]);
                if (hex.length() == 1) {
                    hexString.append('0');
                }
                hexString.append(hex);
            }
            return hexString.toString();
        } catch (Exception e) {
            throw new RuntimeException("Error hashing data", e);
        }
    }

    @PostMapping("/signin")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getUsername(), loginRequest.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtUtils.generateJwtToken(authentication);

        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        String role = userDetails.getAuthorities().iterator().next().getAuthority();

        User dbUser = userRepository.findById(userDetails.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));
        boolean profileCompleted = (dbUser.getAadharHash() != null && !dbUser.getAadharHash().isEmpty());

        return ResponseEntity.ok(new JwtResponse(jwt,
                userDetails.getId(),
                userDetails.getUsername(),
                userDetails.getEmail(),
                role,
                profileCompleted));
    }

    @PostMapping("/signup")
    public ResponseEntity<?> registerUser(@Valid @RequestBody SignupRequest signUpRequest) {
        if (userRepository.existsByUsername(signUpRequest.getUsername())) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: Username is already taken!"));
        }

        if (userRepository.existsByEmail(signUpRequest.getEmail())) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: Email is already in use!"));
        }

        // Enforce VOTER role for all public registrations
        Role role = Role.ROLE_VOTER;

        User user = new User(signUpRequest.getUsername(),
                signUpRequest.getEmail(),
                encoder.encode(signUpRequest.getPassword()),
                role);

        userRepository.save(user);

        return ResponseEntity.ok(new MessageResponse("User registered successfully!"));
    }

    @PostMapping("/complete-profile")
    public ResponseEntity<?> completeProfile(
            @Valid @RequestBody com.voting.backend.payload.request.CompleteProfileRequest request) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentUsername = authentication.getName();
        User user = userRepository.findByUsername(currentUsername)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.getAadharHash() != null) {
            return ResponseEntity.badRequest().body(new MessageResponse("Profile is already completed!"));
        }

        if (userRepository.existsByAadharHash(hashData(request.getAadharNumber()))) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: Aadhar Number is already registered!"));
        }
        if (userRepository.existsByPanHash(hashData(request.getPanNumber()))) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: PAN Number is already registered!"));
        }
        if (userRepository.existsByEpicHash(hashData(request.getEpicNumber()))) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: EPIC Number is already registered!"));
        }

        user.setAadharHash(hashData(request.getAadharNumber()));
        user.setPanHash(hashData(request.getPanNumber()));
        user.setEpicHash(hashData(request.getEpicNumber()));

        user.setState(request.getState());
        user.setDistrict(request.getDistrict());

        userRepository.save(user);

        return ResponseEntity.ok(new MessageResponse("Profile completed successfully!"));
    }
}

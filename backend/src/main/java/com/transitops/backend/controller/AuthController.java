package com.transitops.backend.controller;

import com.transitops.backend.dto.AuthRequest;
import com.transitops.backend.model.AppUser;
import com.transitops.backend.repository.AppUserRepository;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;
import java.util.Locale;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AppUserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthController(AppUserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @PostMapping("/register")
    public ResponseEntity<String> registerUser(@Valid @RequestBody AuthRequest.Register request) {
        String email = normalizeEmail(request.getEmail());

        if (userRepository.existsByEmail(email)) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body("Email is already in use.");
        }

        AppUser newUser = new AppUser();
        newUser.setName(request.getName().trim());
        newUser.setEmail(email);
        newUser.setRole(request.getRole());
        newUser.setPasswordHash(passwordEncoder.encode(request.getPassword()));

        userRepository.save(newUser);

        return ResponseEntity.status(HttpStatus.CREATED).body("User registered successfully.");
    }

    @PostMapping("/login")
    public ResponseEntity<String> loginUser(@Valid @RequestBody AuthRequest.Login request) {
        Optional<AppUser> userOptional = userRepository.findByEmail(normalizeEmail(request.getEmail()));

        if (userOptional.isPresent()) {
            AppUser user = userOptional.get();
            if (passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
                return ResponseEntity.ok("Login successful! Welcome, " + user.getName() + " (" + user.getRole() + ")");
            }
        }

        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid email or password.");
    }

    private String normalizeEmail(String email) {
        return email.trim().toLowerCase(Locale.ROOT);
    }
}
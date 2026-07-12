package com.transitops.backend.controller;

import com.transitops.backend.dto.AuthRequest;
import com.transitops.backend.dto.AuthResponse;
import com.transitops.backend.dto.common.ApiResponse;
import com.transitops.backend.model.AppUser;
import com.transitops.backend.repository.AppUserRepository;
import com.transitops.backend.config.JwtUtil;
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
    private final JwtUtil jwtUtil;

    public AuthController(AppUserRepository userRepository, PasswordEncoder passwordEncoder, JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<String>> registerUser(@Valid @RequestBody AuthRequest.Register request) {
        String email = normalizeEmail(request.getEmail());

        if (userRepository.existsByEmail(email)) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(ApiResponse.error("Email is already in use."));
        }

        AppUser newUser = new AppUser();
        newUser.setName(request.getName().trim());
        newUser.setEmail(email);
        newUser.setRole(request.getRole());
        newUser.setPasswordHash(passwordEncoder.encode(request.getPassword()));

        userRepository.save(newUser);

        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("User registered successfully."));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> loginUser(@Valid @RequestBody AuthRequest.Login request) {
        Optional<AppUser> userOptional = userRepository.findByEmail(normalizeEmail(request.getEmail()));

        if (userOptional.isPresent()) {
            AppUser user = userOptional.get();
            if (passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
                String token = jwtUtil.generateToken(
                        user.getEmail(),
                        user.getName(),
                        user.getRole().name(),
                        user.getId().toString()
                );
                AuthResponse authResponse = new AuthResponse(token, user.getId(), user.getName(), user.getRole().name());
                return ResponseEntity.ok(ApiResponse.success("Login successful!", authResponse));
            }
        }

        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(ApiResponse.error("Invalid email or password."));
    }

    private String normalizeEmail(String email) {
        return email.trim().toLowerCase(Locale.ROOT);
    }
}
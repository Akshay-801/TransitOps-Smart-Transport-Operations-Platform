package com.transitops.backend.dto.auth;

import com.transitops.backend.model.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LoginResponseDTO {

    private UUID userId;

    private String name;

    private String email;

    private Role role;

    private String message;
}

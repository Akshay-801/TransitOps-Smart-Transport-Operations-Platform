package com.transitops.backend.dto.driver;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DriverRequestDTO {

    @NotBlank(message = "Driver name is required")
    private String name;

    @NotBlank(message = "License number is required")
    private String licenseNumber;

    @NotBlank(message = "License category is required")
    private String licenseCategory;

    @NotNull(message = "License expiry date is required")
    @Future(message = "License expiry date must be in the future")
    private LocalDate licenseExpiryDate;

    @NotBlank(message = "Contact number is required")
    @Pattern(regexp = "^[+]?[0-9]{10,15}$", message = "Contact number must be a valid mobile number (10-15 digits)")
    private String contactNumber;

    @PositiveOrZero(message = "Safety score must be zero or positive")
    private Double safetyScore;

    @NotBlank(message = "Status is required")
    private String status;
}

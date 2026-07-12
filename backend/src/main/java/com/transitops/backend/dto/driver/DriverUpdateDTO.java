package com.transitops.backend.dto.driver;

import com.transitops.backend.model.DriverStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DriverUpdateDTO {

    @NotBlank(message = "Driver name is required")
    @Size(max = 100, message = "Driver name must be at most 100 characters")
    private String name;

    @NotBlank(message = "License number is required")
    @Size(max = 100, message = "License number must be at most 100 characters")
    private String licenseNumber;

    @NotBlank(message = "License category is required")
    @Size(max = 50, message = "License category must be at most 50 characters")
    private String licenseCategory;

    @NotNull(message = "License expiry date is required")
    private LocalDate licenseExpiryDate;

    @NotBlank(message = "Contact number is required")
    @Size(max = 30, message = "Contact number must be at most 30 characters")
    private String contactNumber;

    @NotNull(message = "Safety score is required")
    @Min(value = 0, message = "Safety score must be zero or positive")
    private Integer safetyScore;

    @NotNull(message = "Status is required")
    private DriverStatus status;

    private UUID userId;
}

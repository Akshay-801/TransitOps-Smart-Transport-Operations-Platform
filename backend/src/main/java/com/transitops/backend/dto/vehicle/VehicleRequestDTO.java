package com.transitops.backend.dto.vehicle;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VehicleRequestDTO {

    @NotBlank(message = "Registration number is required")
    private String registrationNumber;

    @NotBlank(message = "Vehicle name is required")
    private String vehicleName;

    @NotBlank(message = "Vehicle type is required")
    private String vehicleType;

    @Positive(message = "Maximum load capacity must be positive")
    private Double maximumLoadCapacity;

    @PositiveOrZero(message = "Odometer reading must be zero or positive")
    private Double odometer;

    @PositiveOrZero(message = "Acquisition cost must be zero or positive")
    private BigDecimal acquisitionCost;

    @NotBlank(message = "Status is required")
    private String status;
}

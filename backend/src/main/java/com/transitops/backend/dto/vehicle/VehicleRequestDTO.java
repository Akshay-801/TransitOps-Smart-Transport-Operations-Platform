package com.transitops.backend.dto.vehicle;

import com.transitops.backend.model.VehicleStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;
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
    @Size(max = 50, message = "Registration number must be at most 50 characters")
    private String registrationNumber;

    @NotBlank(message = "Vehicle name is required")
    @Size(max = 100, message = "Vehicle name must be at most 100 characters")
    private String name;

    @Size(max = 100, message = "Vehicle type must be at most 100 characters")
    private String vehicleType;

    @NotNull(message = "Maximum load capacity is required")
    @Positive(message = "Maximum load capacity must be positive")
    private java.math.BigDecimal maxLoadCapacity;

    @NotNull(message = "Odometer is required")
    @PositiveOrZero(message = "Odometer reading must be zero or positive")
    private java.math.BigDecimal odometer;

    @NotNull(message = "Acquisition cost is required")
    @Positive(message = "Acquisition cost must be positive")
    private BigDecimal acquisitionCost;

    @NotNull(message = "Status is required")
    private VehicleStatus status;

    @Size(max = 100, message = "Region must be at most 100 characters")
    private String region;
}

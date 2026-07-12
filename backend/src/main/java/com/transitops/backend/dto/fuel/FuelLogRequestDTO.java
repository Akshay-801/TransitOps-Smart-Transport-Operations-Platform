package com.transitops.backend.dto.fuel;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FuelLogRequestDTO {

    @NotNull(message = "Vehicle ID is required")
    private Long vehicleId;

    private Long tripId;

    @NotNull(message = "Fuel liters is required")
    @Positive(message = "Fuel liters must be positive")
    private Double fuelLiters;

    @NotNull(message = "Fuel cost is required")
    @Positive(message = "Fuel cost must be positive")
    private BigDecimal fuelCost;

    @NotNull(message = "Fuel date is required")
    private LocalDate fuelDate;
}

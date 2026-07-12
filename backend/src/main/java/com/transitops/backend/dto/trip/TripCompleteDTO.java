package com.transitops.backend.dto.trip;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TripCompleteDTO {

    @NotNull(message = "Trip ID is required")
    private Long tripId;

    @NotNull(message = "Final odometer reading is required")
    @PositiveOrZero(message = "Final odometer must be zero or positive")
    private Double finalOdometer;

    @NotNull(message = "Fuel consumed is required")
    @Positive(message = "Fuel consumed must be positive")
    private Double fuelConsumed;
}

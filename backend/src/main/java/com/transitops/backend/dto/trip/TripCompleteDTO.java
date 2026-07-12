package com.transitops.backend.dto.trip;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TripCompleteDTO {

    @NotNull(message = "Trip ID is required")
    private UUID tripId;

    @NotNull(message = "Actual distance is required")
    @Positive(message = "Actual distance must be positive")
    private BigDecimal actualDistance;
}

package com.transitops.backend.dto.trip;

import com.transitops.backend.model.TripStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
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
public class TripRequestDTO {

    @NotBlank(message = "Source is required")
    @Size(max = 255, message = "Source must be at most 255 characters")
    private String source;

    @NotBlank(message = "Destination is required")
    @Size(max = 255, message = "Destination must be at most 255 characters")
    private String destination;

    @NotNull(message = "Vehicle ID is required")
    private UUID vehicleId;

    @NotNull(message = "Driver ID is required")
    private UUID driverId;

    @NotNull(message = "Created by user ID is required")
    private UUID createdById;

    @Positive(message = "Cargo weight must be positive")
    private BigDecimal cargoWeight;

    @Positive(message = "Planned distance must be positive")
    private BigDecimal plannedDistance;

    private TripStatus status;
}

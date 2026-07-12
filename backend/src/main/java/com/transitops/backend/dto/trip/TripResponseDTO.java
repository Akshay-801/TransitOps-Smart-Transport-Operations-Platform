package com.transitops.backend.dto.trip;

import com.transitops.backend.model.TripStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TripResponseDTO {

    private UUID id;

    private String source;

    private String destination;

    private UUID vehicleId;

    private String vehicleName;

    private UUID driverId;

    private String driverName;

    private UUID createdById;

    private BigDecimal cargoWeight;

    private BigDecimal plannedDistance;

    private BigDecimal actualDistance;

    private TripStatus tripStatus;

    private LocalDateTime dispatchedAt;

    private LocalDateTime completedAt;
}

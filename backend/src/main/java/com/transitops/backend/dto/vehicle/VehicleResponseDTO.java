package com.transitops.backend.dto.vehicle;

import com.transitops.backend.model.VehicleStatus;
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
public class VehicleResponseDTO {

    private UUID id;

    private String registrationNumber;

    private String name;

    private String vehicleType;

    private BigDecimal maxLoadCapacity;

    private BigDecimal odometer;

    private BigDecimal acquisitionCost;

    private VehicleStatus status;

    private String region;
}

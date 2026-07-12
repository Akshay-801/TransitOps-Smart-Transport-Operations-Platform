package com.transitops.backend.dto.vehicle;

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
public class VehicleResponseDTO {

    private Long id;

    private String registrationNumber;

    private String vehicleName;

    private String vehicleType;

    private Double maximumLoadCapacity;

    private Double odometer;

    private BigDecimal acquisitionCost;

    private String status;
}

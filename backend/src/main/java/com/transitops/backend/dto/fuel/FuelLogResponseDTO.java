package com.transitops.backend.dto.fuel;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FuelLogResponseDTO {

    private UUID id;

    private UUID vehicleId;

    private UUID tripId;

    private String vehicleName;

    private BigDecimal liters;

    private BigDecimal cost;

    private LocalDate logDate;
}

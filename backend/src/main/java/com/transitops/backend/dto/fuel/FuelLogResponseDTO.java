package com.transitops.backend.dto.fuel;

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
public class FuelLogResponseDTO {

    private Long id;

    private String vehicleName;

    private Double fuelLiters;

    private BigDecimal fuelCost;

    private LocalDate fuelDate;
}

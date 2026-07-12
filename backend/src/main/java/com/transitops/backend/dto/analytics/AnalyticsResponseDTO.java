package com.transitops.backend.dto.analytics;

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
public class AnalyticsResponseDTO {

    private Double fuelEfficiency;

    private BigDecimal operationalCost;

    private Double vehicleROI;
}

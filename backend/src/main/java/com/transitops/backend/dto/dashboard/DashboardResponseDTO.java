package com.transitops.backend.dto.dashboard;

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
public class DashboardResponseDTO {

    private Long activeVehicles;

    private Long availableVehicles;

    private Long vehiclesInMaintenance;

    private Long activeTrips;

    private Long pendingTrips;

    private Long driversOnDuty;

    private Double fleetUtilization;
}

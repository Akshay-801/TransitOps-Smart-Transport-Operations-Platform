package com.transitops.backend.dto.maintenance;

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
public class MaintenanceResponseDTO {

    private Long id;

    private String vehicleName;

    private String maintenanceType;

    private String description;

    private BigDecimal cost;

    private String status;

    private LocalDate scheduledDate;
}

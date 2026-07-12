package com.transitops.backend.dto.maintenance;

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
public class MaintenanceCloseDTO {

    @NotNull(message = "Maintenance ID is required")
    private UUID maintenanceId;

    @Positive(message = "Cost must be positive")
    private BigDecimal cost;
}

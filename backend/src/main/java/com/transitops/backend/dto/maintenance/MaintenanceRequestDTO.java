package com.transitops.backend.dto.maintenance;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
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
public class MaintenanceRequestDTO {

    @NotNull(message = "Vehicle ID is required")
    private Long vehicleId;

    @NotBlank(message = "Maintenance type is required")
    private String maintenanceType;

    @NotBlank(message = "Description is required")
    private String description;

    @NotNull(message = "Cost is required")
    @Positive(message = "Cost must be positive")
    private BigDecimal cost;

    @NotNull(message = "Scheduled date is required")
    private LocalDate scheduledDate;
}

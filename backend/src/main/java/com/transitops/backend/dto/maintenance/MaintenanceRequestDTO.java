package com.transitops.backend.dto.maintenance;

import com.transitops.backend.model.MaintenanceStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
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
public class MaintenanceRequestDTO {

    @NotNull(message = "Vehicle ID is required")
    private UUID vehicleId;

    @NotBlank(message = "Description is required")
    @Size(max = 1000, message = "Description must be at most 1000 characters")
    private String description;

    @Positive(message = "Cost must be positive")
    private BigDecimal cost;

    private LocalDateTime openedAt;

    private LocalDateTime closedAt;

    private MaintenanceStatus status;
}

package com.transitops.backend.dto.maintenance;

import com.transitops.backend.model.MaintenanceStatus;
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
public class MaintenanceResponseDTO {

    private UUID id;

    private UUID vehicleId;

    private String vehicleName;

    private String description;

    private BigDecimal cost;

    private LocalDateTime openedAt;

    private LocalDateTime closedAt;

    private MaintenanceStatus status;
}

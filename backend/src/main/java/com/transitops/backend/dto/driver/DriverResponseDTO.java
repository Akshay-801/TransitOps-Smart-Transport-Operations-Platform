package com.transitops.backend.dto.driver;

import com.transitops.backend.model.DriverStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DriverResponseDTO {

    private UUID id;

    private String name;

    private String licenseNumber;

    private String licenseCategory;

    private LocalDate licenseExpiryDate;

    private String contactNumber;

    private Integer safetyScore;

    private DriverStatus status;

    private UUID userId;
}

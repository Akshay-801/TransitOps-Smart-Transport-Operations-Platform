package com.transitops.backend.dto.driver;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DriverResponseDTO {

    private Long id;

    private String name;

    private String licenseNumber;

    private String licenseCategory;

    private LocalDate licenseExpiryDate;

    private String contactNumber;

    private Double safetyScore;

    private String status;
}

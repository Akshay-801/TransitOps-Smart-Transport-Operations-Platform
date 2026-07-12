package com.transitops.backend.dto.trip;

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
public class TripResponseDTO {

    private Long id;

    private String source;

    private String destination;

    private String vehicleName;

    private String driverName;

    private Double cargoWeight;

    private Double plannedDistance;

    private String tripStatus;

    private LocalDate createdDate;
}

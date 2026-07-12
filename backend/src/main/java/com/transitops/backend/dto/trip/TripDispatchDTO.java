package com.transitops.backend.dto.trip;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TripDispatchDTO {

    @NotNull(message = "Trip ID is required")
    private UUID tripId;
}

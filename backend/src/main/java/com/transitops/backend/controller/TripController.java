package com.transitops.backend.controller;

import com.transitops.backend.dto.common.ApiResponse;
import com.transitops.backend.dto.trip.TripRequestDTO;
import com.transitops.backend.dto.trip.TripResponseDTO;
import com.transitops.backend.dto.trip.TripCompleteDTO;
import com.transitops.backend.model.TripStatus;
import com.transitops.backend.service.TripService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/trips")
public class TripController {

    private final TripService tripService;

    public TripController(TripService tripService) {
        this.tripService = tripService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<TripResponseDTO>> createTrip(@Valid @RequestBody TripRequestDTO request) {
        TripResponseDTO trip = tripService.createTrip(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Trip created successfully", trip));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<TripResponseDTO>> getTrip(@PathVariable UUID id) {
        TripResponseDTO trip = tripService.getTrip(id);
        return ResponseEntity.ok(ApiResponse.success("Trip retrieved successfully", trip));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<TripResponseDTO>>> getAllTrips(
            @RequestParam(required = false) TripStatus status) {
        List<TripResponseDTO> trips = status != null ? 
            tripService.getTripsByStatus(status) : 
            tripService.getAllTrips();
        return ResponseEntity.ok(ApiResponse.success("Trips retrieved successfully", trips));
    }

    @PostMapping("/{id}/dispatch")
    public ResponseEntity<ApiResponse<TripResponseDTO>> dispatchTrip(@PathVariable UUID id) {
        TripResponseDTO trip = tripService.dispatchTrip(id);
        return ResponseEntity.ok(ApiResponse.success("Trip dispatched successfully", trip));
    }

    @PostMapping("/{id}/complete")
    public ResponseEntity<ApiResponse<TripResponseDTO>> completeTrip(
            @PathVariable UUID id,
            @Valid @RequestBody TripCompleteDTO request) {
        TripResponseDTO trip = tripService.completeTrip(id, request);
        return ResponseEntity.ok(ApiResponse.success("Trip completed successfully", trip));
    }

    @PostMapping("/{id}/cancel")
    public ResponseEntity<ApiResponse<Void>> cancelTrip(@PathVariable UUID id) {
        tripService.cancelTrip(id);
        return ResponseEntity.ok(ApiResponse.success("Trip cancelled successfully"));
    }
}

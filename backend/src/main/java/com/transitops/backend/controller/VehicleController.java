package com.transitops.backend.controller;

import com.transitops.backend.dto.common.ApiResponse;
import com.transitops.backend.dto.vehicle.VehicleRequestDTO;
import com.transitops.backend.dto.vehicle.VehicleResponseDTO;
import com.transitops.backend.dto.vehicle.VehicleUpdateDTO;
import com.transitops.backend.model.VehicleStatus;
import com.transitops.backend.service.VehicleService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/vehicles")
public class VehicleController {

    private final VehicleService vehicleService;

    public VehicleController(VehicleService vehicleService) {
        this.vehicleService = vehicleService;
    }

    @PostMapping
    @PreAuthorize("hasRole('FLEET_MANAGER')")
    public ResponseEntity<ApiResponse<VehicleResponseDTO>> createVehicle(@Valid @RequestBody VehicleRequestDTO request) {
        VehicleResponseDTO vehicle = vehicleService.createVehicle(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Vehicle created successfully", vehicle));
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<VehicleResponseDTO>> getVehicle(@PathVariable UUID id) {
        VehicleResponseDTO vehicle = vehicleService.getVehicle(id);
        return ResponseEntity.ok(ApiResponse.success("Vehicle retrieved successfully", vehicle));
    }

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<List<VehicleResponseDTO>>> getAllVehicles(
            @RequestParam(required = false) VehicleStatus status,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String region) {
        List<VehicleResponseDTO> vehicles = vehicleService.getVehiclesFiltered(status, type, region);
        return ResponseEntity.ok(ApiResponse.success("Vehicles retrieved successfully", vehicles));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('FLEET_MANAGER')")
    public ResponseEntity<ApiResponse<VehicleResponseDTO>> updateVehicle(
            @PathVariable UUID id,
            @Valid @RequestBody VehicleUpdateDTO request) {
        VehicleResponseDTO vehicle = vehicleService.updateVehicle(id, request);
        return ResponseEntity.ok(ApiResponse.success("Vehicle updated successfully", vehicle));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('FLEET_MANAGER')")
    public ResponseEntity<ApiResponse<Void>> deleteVehicle(@PathVariable UUID id) {
        vehicleService.deleteVehicle(id);
        return ResponseEntity.ok(ApiResponse.success("Vehicle deleted successfully"));
    }
}

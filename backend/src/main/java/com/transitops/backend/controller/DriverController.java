package com.transitops.backend.controller;

import com.transitops.backend.dto.common.ApiResponse;
import com.transitops.backend.dto.driver.DriverRequestDTO;
import com.transitops.backend.dto.driver.DriverResponseDTO;
import com.transitops.backend.dto.driver.DriverUpdateDTO;
import com.transitops.backend.model.DriverStatus;
import com.transitops.backend.service.DriverService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/drivers")
public class DriverController {

    private final DriverService driverService;

    public DriverController(DriverService driverService) {
        this.driverService = driverService;
    }

    @PostMapping
    @PreAuthorize("hasRole('SAFETY_OFFICER') or hasRole('FLEET_MANAGER')")
    public ResponseEntity<ApiResponse<DriverResponseDTO>> createDriver(@Valid @RequestBody DriverRequestDTO request) {
        DriverResponseDTO driver = driverService.createDriver(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Driver created successfully", driver));
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<DriverResponseDTO>> getDriver(@PathVariable UUID id) {
        DriverResponseDTO driver = driverService.getDriver(id);
        return ResponseEntity.ok(ApiResponse.success("Driver retrieved successfully", driver));
    }

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<List<DriverResponseDTO>>> getAllDrivers(
            @RequestParam(required = false) DriverStatus status) {
        List<DriverResponseDTO> drivers = status != null ?
            driverService.getDriversByStatus(status) :
            driverService.getAllDrivers();
        return ResponseEntity.ok(ApiResponse.success("Drivers retrieved successfully", drivers));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('SAFETY_OFFICER') or hasRole('FLEET_MANAGER')")
    public ResponseEntity<ApiResponse<DriverResponseDTO>> updateDriver(
            @PathVariable UUID id,
            @Valid @RequestBody DriverUpdateDTO request) {
        DriverResponseDTO driver = driverService.updateDriver(id, request);
        return ResponseEntity.ok(ApiResponse.success("Driver updated successfully", driver));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('SAFETY_OFFICER') or hasRole('FLEET_MANAGER')")
    public ResponseEntity<ApiResponse<Void>> deleteDriver(@PathVariable UUID id) {
        driverService.deleteDriver(id);
        return ResponseEntity.ok(ApiResponse.success("Driver deleted successfully"));
    }
}

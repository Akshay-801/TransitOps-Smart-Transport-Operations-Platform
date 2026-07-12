package com.transitops.backend.controller;

import com.transitops.backend.dto.common.ApiResponse;
import com.transitops.backend.dto.fuel.FuelLogRequestDTO;
import com.transitops.backend.dto.fuel.FuelLogResponseDTO;
import com.transitops.backend.service.FuelLogService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/fuel")
public class FuelLogController {

    private final FuelLogService fuelLogService;

    public FuelLogController(FuelLogService fuelLogService) {
        this.fuelLogService = fuelLogService;
    }

    @PostMapping
    @PreAuthorize("hasRole('DRIVER') or hasRole('FINANCIAL_ANALYST') or hasRole('FLEET_MANAGER') or hasRole('DISPATCHER')")
    public ResponseEntity<ApiResponse<FuelLogResponseDTO>> logFuel(@Valid @RequestBody FuelLogRequestDTO request) {
        FuelLogResponseDTO fuelLog = fuelLogService.logFuel(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Fuel logged successfully", fuelLog));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('FINANCIAL_ANALYST') or hasRole('FLEET_MANAGER') or hasRole('DISPATCHER')")
    public ResponseEntity<ApiResponse<FuelLogResponseDTO>> getFuelLog(@PathVariable UUID id) {
        FuelLogResponseDTO fuelLog = fuelLogService.getFuelLog(id);
        return ResponseEntity.ok(ApiResponse.success("Fuel log retrieved successfully", fuelLog));
    }

    @GetMapping
    @PreAuthorize("hasRole('FINANCIAL_ANALYST') or hasRole('FLEET_MANAGER') or hasRole('DISPATCHER')")
    public ResponseEntity<ApiResponse<List<FuelLogResponseDTO>>> getAllFuelLogs(
            @RequestParam(required = false) UUID vehicleId) {
        List<FuelLogResponseDTO> fuelLogs = vehicleId != null ? 
            fuelLogService.getFuelLogsByVehicle(vehicleId) : 
            fuelLogService.getAllFuelLogs();
        return ResponseEntity.ok(ApiResponse.success("Fuel logs retrieved successfully", fuelLogs));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('FINANCIAL_ANALYST')")
    public ResponseEntity<ApiResponse<Void>> deleteFuelLog(@PathVariable UUID id) {
        fuelLogService.deleteFuelLog(id);
        return ResponseEntity.ok(ApiResponse.success("Fuel log deleted successfully"));
    }
}

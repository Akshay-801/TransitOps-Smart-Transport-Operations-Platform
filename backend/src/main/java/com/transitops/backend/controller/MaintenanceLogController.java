package com.transitops.backend.controller;

import com.transitops.backend.dto.common.ApiResponse;
import com.transitops.backend.dto.maintenance.MaintenanceRequestDTO;
import com.transitops.backend.dto.maintenance.MaintenanceResponseDTO;
import com.transitops.backend.dto.maintenance.MaintenanceCloseDTO;
import com.transitops.backend.service.MaintenanceLogService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/maintenance")
public class MaintenanceLogController {

    private final MaintenanceLogService maintenanceLogService;

    public MaintenanceLogController(MaintenanceLogService maintenanceLogService) {
        this.maintenanceLogService = maintenanceLogService;
    }

    @PostMapping
    @PreAuthorize("hasRole('FLEET_MANAGER')")
    public ResponseEntity<ApiResponse<MaintenanceResponseDTO>> openMaintenance(
            @Valid @RequestBody MaintenanceRequestDTO request) {
        MaintenanceResponseDTO maintenance = maintenanceLogService.openMaintenance(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Maintenance opened successfully", maintenance));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('FLEET_MANAGER') or hasRole('DISPATCHER') or hasRole('SAFETY_OFFICER') or hasRole('FINANCIAL_ANALYST')")
    public ResponseEntity<ApiResponse<MaintenanceResponseDTO>> getMaintenance(@PathVariable UUID id) {
        MaintenanceResponseDTO maintenance = maintenanceLogService.getMaintenance(id);
        return ResponseEntity.ok(ApiResponse.success("Maintenance retrieved successfully", maintenance));
    }

    @GetMapping
    @PreAuthorize("hasRole('FLEET_MANAGER') or hasRole('DISPATCHER') or hasRole('SAFETY_OFFICER') or hasRole('FINANCIAL_ANALYST')")
    public ResponseEntity<ApiResponse<List<MaintenanceResponseDTO>>> getAllMaintenance(
            @RequestParam(required = false, defaultValue = "false") boolean openOnly) {
        List<MaintenanceResponseDTO> maintenance = openOnly ?
            maintenanceLogService.getOpenMaintenance() :
            maintenanceLogService.getAllMaintenance();
        return ResponseEntity.ok(ApiResponse.success("Maintenance logs retrieved successfully", maintenance));
    }

    @PostMapping("/{id}/close")
    @PreAuthorize("hasRole('FLEET_MANAGER')")
    public ResponseEntity<ApiResponse<MaintenanceResponseDTO>> closeMaintenance(
            @PathVariable UUID id,
            @Valid @RequestBody MaintenanceCloseDTO request) {
        MaintenanceResponseDTO maintenance = maintenanceLogService.closeMaintenance(id, request);
        return ResponseEntity.ok(ApiResponse.success("Maintenance closed successfully", maintenance));
    }
}

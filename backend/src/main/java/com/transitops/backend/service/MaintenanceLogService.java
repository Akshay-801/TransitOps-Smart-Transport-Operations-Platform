package com.transitops.backend.service;

import com.transitops.backend.dto.maintenance.MaintenanceRequestDTO;
import com.transitops.backend.dto.maintenance.MaintenanceResponseDTO;
import com.transitops.backend.dto.maintenance.MaintenanceCloseDTO;
import com.transitops.backend.model.MaintenanceLog;
import com.transitops.backend.model.MaintenanceStatus;
import com.transitops.backend.model.Vehicle;
import com.transitops.backend.model.VehicleStatus;
import com.transitops.backend.repository.MaintenanceLogRepository;
import com.transitops.backend.repository.VehicleRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
public class MaintenanceLogService {

    private final MaintenanceLogRepository maintenanceRepository;
    private final VehicleRepository vehicleRepository;

    public MaintenanceLogService(MaintenanceLogRepository maintenanceRepository,
                                 VehicleRepository vehicleRepository) {
        this.maintenanceRepository = maintenanceRepository;
        this.vehicleRepository = vehicleRepository;
    }

    public MaintenanceResponseDTO openMaintenance(MaintenanceRequestDTO request) {
        Vehicle vehicle = vehicleRepository.findById(request.getVehicleId())
                .orElseThrow(() -> new IllegalArgumentException("Vehicle not found"));

        MaintenanceLog log = new MaintenanceLog();
        log.setVehicle(vehicle);
        log.setDescription(request.getDescription().trim());
        log.setCost(request.getCost());
        log.setStatus(MaintenanceStatus.OPEN);
        log.setOpenedAt(LocalDateTime.now());

        vehicle.setStatus(VehicleStatus.IN_SHOP);
        vehicleRepository.save(vehicle);

        MaintenanceLog saved = maintenanceRepository.save(log);
        return mapToResponse(saved);
    }

    public MaintenanceResponseDTO getMaintenance(UUID id) {
        MaintenanceLog log = maintenanceRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Maintenance log not found with ID: " + id));
        return mapToResponse(log);
    }

    public List<MaintenanceResponseDTO> getAllMaintenance() {
        return maintenanceRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<MaintenanceResponseDTO> getOpenMaintenance() {
        return maintenanceRepository.findAll().stream()
                .filter(m -> m.getStatus().equals(MaintenanceStatus.OPEN))
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public MaintenanceResponseDTO closeMaintenance(UUID id, MaintenanceCloseDTO request) {
        MaintenanceLog log = maintenanceRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Maintenance log not found with ID: " + id));

        if (!log.getStatus().equals(MaintenanceStatus.OPEN)) {
            throw new IllegalArgumentException("Only open maintenance logs can be closed");
        }

        log.setStatus(MaintenanceStatus.CLOSED);
        log.setClosedAt(LocalDateTime.now());
        if (request.getCost() != null && request.getCost().compareTo(BigDecimal.ZERO) > 0) {
            log.setCost(request.getCost());
        }

        Vehicle vehicle = log.getVehicle();
        vehicle.setStatus(VehicleStatus.AVAILABLE);
        vehicleRepository.save(vehicle);

        MaintenanceLog updated = maintenanceRepository.save(log);
        return mapToResponse(updated);
    }

    private MaintenanceResponseDTO mapToResponse(MaintenanceLog log) {
        MaintenanceResponseDTO dto = new MaintenanceResponseDTO();
        dto.setId(log.getId());
        dto.setVehicleId(log.getVehicle().getId());
        dto.setVehicleName(log.getVehicle().getName());
        dto.setDescription(log.getDescription());
        dto.setCost(log.getCost());
        dto.setOpenedAt(log.getOpenedAt());
        dto.setClosedAt(log.getClosedAt());
        dto.setStatus(log.getStatus());
        return dto;
    }
}

package com.transitops.backend.service;

import com.transitops.backend.dto.fuel.FuelLogRequestDTO;
import com.transitops.backend.dto.fuel.FuelLogResponseDTO;
import com.transitops.backend.model.FuelLog;
import com.transitops.backend.model.Vehicle;
import com.transitops.backend.repository.FuelLogRepository;
import com.transitops.backend.repository.VehicleRepository;
import com.transitops.backend.repository.TripRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
public class FuelLogService {

    private final FuelLogRepository fuelLogRepository;
    private final VehicleRepository vehicleRepository;
    private final TripRepository tripRepository;

    public FuelLogService(FuelLogRepository fuelLogRepository, VehicleRepository vehicleRepository,
                         TripRepository tripRepository) {
        this.fuelLogRepository = fuelLogRepository;
        this.vehicleRepository = vehicleRepository;
        this.tripRepository = tripRepository;
    }

    public FuelLogResponseDTO logFuel(FuelLogRequestDTO request) {
        Vehicle vehicle = vehicleRepository.findById(request.getVehicleId())
                .orElseThrow(() -> new IllegalArgumentException("Vehicle not found"));

        FuelLog fuelLog = new FuelLog();
        fuelLog.setVehicle(vehicle);
        fuelLog.setTrip(request.getTripId() != null ? 
            tripRepository.findById(request.getTripId()).orElse(null) : null);
        fuelLog.setLiters(request.getLiters());
        fuelLog.setCost(request.getCost());
        fuelLog.setLogDate(request.getLogDate());

        FuelLog saved = fuelLogRepository.save(fuelLog);
        return mapToResponse(saved);
    }

    public FuelLogResponseDTO getFuelLog(UUID id) {
        FuelLog fuelLog = fuelLogRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Fuel log not found with ID: " + id));
        return mapToResponse(fuelLog);
    }

    public List<FuelLogResponseDTO> getAllFuelLogs() {
        return fuelLogRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<FuelLogResponseDTO> getFuelLogsByVehicle(UUID vehicleId) {
        return fuelLogRepository.findAll().stream()
                .filter(f -> f.getVehicle().getId().equals(vehicleId))
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public void deleteFuelLog(UUID id) {
        if (!fuelLogRepository.existsById(id)) {
            throw new IllegalArgumentException("Fuel log not found with ID: " + id);
        }
        fuelLogRepository.deleteById(id);
    }

    private FuelLogResponseDTO mapToResponse(FuelLog fuelLog) {
        FuelLogResponseDTO dto = new FuelLogResponseDTO();
        dto.setId(fuelLog.getId());
        dto.setVehicleId(fuelLog.getVehicle().getId());
        dto.setVehicleName(fuelLog.getVehicle().getName());
        if (fuelLog.getTrip() != null) {
            dto.setTripId(fuelLog.getTrip().getId());
        }
        dto.setLiters(fuelLog.getLiters());
        dto.setCost(fuelLog.getCost());
        dto.setLogDate(fuelLog.getLogDate());
        return dto;
    }
}

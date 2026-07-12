package com.transitops.backend.service;

import com.transitops.backend.dto.vehicle.VehicleRequestDTO;
import com.transitops.backend.dto.vehicle.VehicleResponseDTO;
import com.transitops.backend.dto.vehicle.VehicleUpdateDTO;
import com.transitops.backend.model.Vehicle;
import com.transitops.backend.model.VehicleStatus;
import com.transitops.backend.repository.VehicleRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
public class VehicleService {

    private final VehicleRepository vehicleRepository;

    public VehicleService(VehicleRepository vehicleRepository) {
        this.vehicleRepository = vehicleRepository;
    }

    public VehicleResponseDTO createVehicle(VehicleRequestDTO request) {
        Vehicle vehicle = new Vehicle();
        vehicle.setRegistrationNumber(request.getRegistrationNumber().trim());
        vehicle.setName(request.getName().trim());
        vehicle.setType(request.getVehicleType());
        vehicle.setMaxLoadCapacity(request.getMaxLoadCapacity());
        vehicle.setOdometer(request.getOdometer());
        vehicle.setAcquisitionCost(request.getAcquisitionCost());
        vehicle.setStatus(request.getStatus() != null ? request.getStatus() : VehicleStatus.AVAILABLE);
        vehicle.setRegion(request.getRegion());

        Vehicle saved = vehicleRepository.save(vehicle);
        return mapToResponse(saved);
    }

    public VehicleResponseDTO getVehicle(UUID id) {
        Vehicle vehicle = vehicleRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Vehicle not found with ID: " + id));
        return mapToResponse(vehicle);
    }

    public List<VehicleResponseDTO> getAllVehicles() {
        return vehicleRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<VehicleResponseDTO> getVehiclesByStatus(VehicleStatus status) {
        return vehicleRepository.findAll().stream()
                .filter(v -> v.getStatus() == status)
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<VehicleResponseDTO> getVehiclesFiltered(VehicleStatus status, String type, String region) {
        return vehicleRepository.findAll().stream()
                .filter(v -> status == null || v.getStatus() == status)
                .filter(v -> type == null || type.isBlank() || type.equalsIgnoreCase(v.getType()))
                .filter(v -> region == null || region.isBlank() || region.equalsIgnoreCase(v.getRegion()))
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public VehicleResponseDTO updateVehicle(UUID id, VehicleUpdateDTO request) {
        Vehicle vehicle = vehicleRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Vehicle not found with ID: " + id));

        vehicle.setName(request.getName().trim());
        vehicle.setType(request.getVehicleType());
        vehicle.setMaxLoadCapacity(request.getMaxLoadCapacity());
        vehicle.setOdometer(request.getOdometer());
        vehicle.setAcquisitionCost(request.getAcquisitionCost());
        vehicle.setStatus(request.getStatus());
        vehicle.setRegion(request.getRegion());

        Vehicle updated = vehicleRepository.save(vehicle);
        return mapToResponse(updated);
    }

    public void deleteVehicle(UUID id) {
        if (!vehicleRepository.existsById(id)) {
            throw new IllegalArgumentException("Vehicle not found with ID: " + id);
        }
        vehicleRepository.deleteById(id);
    }

    private VehicleResponseDTO mapToResponse(Vehicle vehicle) {
        VehicleResponseDTO dto = new VehicleResponseDTO();
        dto.setId(vehicle.getId());
        dto.setRegistrationNumber(vehicle.getRegistrationNumber());
        dto.setName(vehicle.getName());
        dto.setVehicleType(vehicle.getType());
        dto.setMaxLoadCapacity(vehicle.getMaxLoadCapacity());
        dto.setOdometer(vehicle.getOdometer());
        dto.setAcquisitionCost(vehicle.getAcquisitionCost());
        dto.setStatus(vehicle.getStatus());
        dto.setRegion(vehicle.getRegion());
        return dto;
    }
}

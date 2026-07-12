package com.transitops.backend.service;

import com.transitops.backend.dto.driver.DriverRequestDTO;
import com.transitops.backend.dto.driver.DriverResponseDTO;
import com.transitops.backend.dto.driver.DriverUpdateDTO;
import com.transitops.backend.model.Driver;
import com.transitops.backend.model.DriverStatus;
import com.transitops.backend.repository.DriverRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
public class DriverService {

    private final DriverRepository driverRepository;

    public DriverService(DriverRepository driverRepository) {
        this.driverRepository = driverRepository;
    }

    public DriverResponseDTO createDriver(DriverRequestDTO request) {
        if (request.getLicenseExpiryDate().isBefore(LocalDate.now())) {
            throw new IllegalArgumentException("License expiry date cannot be in the past");
        }

        Driver driver = new Driver();
        driver.setName(request.getName().trim());
        driver.setLicenseNumber(request.getLicenseNumber().trim());
        driver.setLicenseCategory(request.getLicenseCategory().trim());
        driver.setLicenseExpiryDate(request.getLicenseExpiryDate());
        driver.setContactNumber(request.getContactNumber().trim());
        driver.setSafetyScore(request.getSafetyScore() != null ? request.getSafetyScore() : 100);
        driver.setStatus(request.getStatus() != null ? request.getStatus() : DriverStatus.AVAILABLE);

        Driver saved = driverRepository.save(driver);
        return mapToResponse(saved);
    }

    public DriverResponseDTO getDriver(UUID id) {
        Driver driver = driverRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Driver not found with ID: " + id));
        return mapToResponse(driver);
    }

    public List<DriverResponseDTO> getAllDrivers() {
        return driverRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<DriverResponseDTO> getDriversByStatus(DriverStatus status) {
        return driverRepository.findAll().stream()
                .filter(d -> d.getStatus() == status)
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public DriverResponseDTO updateDriver(UUID id, DriverUpdateDTO request) {
        Driver driver = driverRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Driver not found with ID: " + id));

        if (request.getLicenseExpiryDate().isBefore(LocalDate.now())) {
            throw new IllegalArgumentException("License expiry date cannot be in the past");
        }

        driver.setName(request.getName().trim());
        driver.setLicenseNumber(request.getLicenseNumber().trim());
        driver.setLicenseCategory(request.getLicenseCategory().trim());
        driver.setLicenseExpiryDate(request.getLicenseExpiryDate());
        driver.setContactNumber(request.getContactNumber().trim());
        driver.setSafetyScore(request.getSafetyScore());
        driver.setStatus(request.getStatus());

        Driver updated = driverRepository.save(driver);
        return mapToResponse(updated);
    }

    public void deleteDriver(UUID id) {
        if (!driverRepository.existsById(id)) {
            throw new IllegalArgumentException("Driver not found with ID: " + id);
        }
        driverRepository.deleteById(id);
    }

    private DriverResponseDTO mapToResponse(Driver driver) {
        DriverResponseDTO dto = new DriverResponseDTO();
        dto.setId(driver.getId());
        dto.setName(driver.getName());
        dto.setLicenseNumber(driver.getLicenseNumber());
        dto.setLicenseCategory(driver.getLicenseCategory());
        dto.setLicenseExpiryDate(driver.getLicenseExpiryDate());
        dto.setContactNumber(driver.getContactNumber());
        dto.setSafetyScore(driver.getSafetyScore());
        dto.setStatus(driver.getStatus());
        return dto;
    }
}

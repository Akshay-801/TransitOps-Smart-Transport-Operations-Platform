package com.transitops.backend.service;

import com.transitops.backend.dto.trip.TripRequestDTO;
import com.transitops.backend.dto.trip.TripResponseDTO;
import com.transitops.backend.dto.trip.TripCompleteDTO;
import com.transitops.backend.dto.trip.TripDispatchDTO;
import com.transitops.backend.model.*;
import com.transitops.backend.repository.AppUserRepository;
import com.transitops.backend.repository.DriverRepository;
import com.transitops.backend.repository.TripRepository;
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
public class TripService {

    private final TripRepository tripRepository;
    private final VehicleRepository vehicleRepository;
    private final DriverRepository driverRepository;
    private final AppUserRepository userRepository;

    public TripService(TripRepository tripRepository, VehicleRepository vehicleRepository,
                       DriverRepository driverRepository, AppUserRepository userRepository) {
        this.tripRepository = tripRepository;
        this.vehicleRepository = vehicleRepository;
        this.driverRepository = driverRepository;
        this.userRepository = userRepository;
    }

    public TripResponseDTO createTrip(TripRequestDTO request) {
        Vehicle vehicle = vehicleRepository.findById(request.getVehicleId())
                .orElseThrow(() -> new IllegalArgumentException("Vehicle not found"));
        Driver driver = driverRepository.findById(request.getDriverId())
                .orElseThrow(() -> new IllegalArgumentException("Driver not found"));
        AppUser createdBy = userRepository.findById(request.getCreatedById())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        if (request.getCargoWeight().compareTo(vehicle.getMaxLoadCapacity()) > 0) {
            throw new IllegalArgumentException("Cargo weight exceeds vehicle capacity");
        }

        Trip trip = new Trip();
        trip.setVehicle(vehicle);
        trip.setDriver(driver);
        trip.setCreatedBy(createdBy);
        trip.setSource(request.getSource().trim());
        trip.setDestination(request.getDestination().trim());
        trip.setCargoWeight(request.getCargoWeight());
        trip.setPlannedDistance(request.getPlannedDistance());
        trip.setStatus(request.getStatus() != null ? request.getStatus() : TripStatus.DRAFT);

        Trip saved = tripRepository.save(trip);
        return mapToResponse(saved);
    }

    public TripResponseDTO getTrip(UUID id) {
        Trip trip = tripRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Trip not found with ID: " + id));
        return mapToResponse(trip);
    }

    public List<TripResponseDTO> getAllTrips() {
        return tripRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<TripResponseDTO> getTripsByStatus(TripStatus status) {
        return tripRepository.findAll().stream()
                .filter(t -> t.getStatus() == status)
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public TripResponseDTO dispatchTrip(UUID tripId) {
        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new IllegalArgumentException("Trip not found with ID: " + tripId));

        if (!trip.getStatus().equals(TripStatus.DRAFT)) {
            throw new IllegalArgumentException("Only draft trips can be dispatched");
        }

        Vehicle vehicle = trip.getVehicle();
        if (!vehicle.getStatus().equals(VehicleStatus.AVAILABLE)) {
            throw new IllegalArgumentException("Vehicle is not available");
        }

        Driver driver = trip.getDriver();
        if (!driver.getStatus().equals(DriverStatus.AVAILABLE)) {
            throw new IllegalArgumentException("Driver is not available");
        }

        trip.setStatus(TripStatus.DISPATCHED);
        trip.setDispatchedAt(LocalDateTime.now());
        vehicle.setStatus(VehicleStatus.ON_TRIP);
        driver.setStatus(DriverStatus.ON_TRIP);

        vehicleRepository.save(vehicle);
        driverRepository.save(driver);
        Trip updated = tripRepository.save(trip);
        return mapToResponse(updated);
    }

    public TripResponseDTO completeTrip(UUID tripId, TripCompleteDTO request) {
        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new IllegalArgumentException("Trip not found with ID: " + tripId));

        if (!trip.getStatus().equals(TripStatus.DISPATCHED)) {
            throw new IllegalArgumentException("Only dispatched trips can be completed");
        }

        trip.setStatus(TripStatus.COMPLETED);
        trip.setActualDistance(request.getActualDistance());
        trip.setCompletedAt(LocalDateTime.now());

        Vehicle vehicle = trip.getVehicle();
        vehicle.setStatus(VehicleStatus.AVAILABLE);
        vehicle.setOdometer(vehicle.getOdometer().add(request.getActualDistance()));

        Driver driver = trip.getDriver();
        driver.setStatus(DriverStatus.AVAILABLE);

        vehicleRepository.save(vehicle);
        driverRepository.save(driver);
        Trip updated = tripRepository.save(trip);
        return mapToResponse(updated);
    }

    public void cancelTrip(UUID tripId) {
        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new IllegalArgumentException("Trip not found with ID: " + tripId));

        if (trip.getStatus().equals(TripStatus.COMPLETED) || trip.getStatus().equals(TripStatus.CANCELLED)) {
            throw new IllegalArgumentException("Cannot cancel a completed or already cancelled trip");
        }

        if (trip.getStatus().equals(TripStatus.DISPATCHED)) {
            Vehicle vehicle = trip.getVehicle();
            vehicle.setStatus(VehicleStatus.AVAILABLE);
            vehicleRepository.save(vehicle);

            Driver driver = trip.getDriver();
            driver.setStatus(DriverStatus.AVAILABLE);
            driverRepository.save(driver);
        }

        trip.setStatus(TripStatus.CANCELLED);
        tripRepository.save(trip);
    }

    private TripResponseDTO mapToResponse(Trip trip) {
        TripResponseDTO dto = new TripResponseDTO();
        dto.setId(trip.getId());
        dto.setSource(trip.getSource());
        dto.setDestination(trip.getDestination());
        dto.setVehicleId(trip.getVehicle().getId());
        dto.setVehicleName(trip.getVehicle().getName());
        dto.setDriverId(trip.getDriver().getId());
        dto.setDriverName(trip.getDriver().getName());
        dto.setCreatedById(trip.getCreatedBy().getId());
        dto.setCargoWeight(trip.getCargoWeight());
        dto.setPlannedDistance(trip.getPlannedDistance());
        dto.setActualDistance(trip.getActualDistance());
        dto.setTripStatus(trip.getStatus());
        dto.setDispatchedAt(trip.getDispatchedAt());
        dto.setCompletedAt(trip.getCompletedAt());
        return dto;
    }
}

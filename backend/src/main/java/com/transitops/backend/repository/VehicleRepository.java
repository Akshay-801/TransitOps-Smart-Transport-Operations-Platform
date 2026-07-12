package com.transitops.backend.repository;

import com.transitops.backend.model.Vehicle;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface VehicleRepository extends JpaRepository<Vehicle, UUID> {
}
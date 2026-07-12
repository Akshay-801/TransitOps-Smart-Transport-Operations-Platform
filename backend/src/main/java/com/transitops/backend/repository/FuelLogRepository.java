package com.transitops.backend.repository;

import com.transitops.backend.model.FuelLog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface FuelLogRepository extends JpaRepository<FuelLog, UUID> {
}
package com.transitops.backend.repository;

import com.transitops.backend.model.MaintenanceLog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface MaintenanceLogRepository extends JpaRepository<MaintenanceLog, UUID> {
}
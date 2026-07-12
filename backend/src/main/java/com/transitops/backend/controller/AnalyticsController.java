package com.transitops.backend.controller;

import com.transitops.backend.model.*;
import com.transitops.backend.repository.*;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/analytics")
public class AnalyticsController {

    private final VehicleRepository vehicleRepository;
    private final TripRepository tripRepository;
    private final FuelLogRepository fuelLogRepository;
    private final ExpenseRepository expenseRepository;
    private final MaintenanceLogRepository maintenanceRepository;

    public AnalyticsController(VehicleRepository vehicleRepository,
                                TripRepository tripRepository,
                                FuelLogRepository fuelLogRepository,
                                ExpenseRepository expenseRepository,
                                MaintenanceLogRepository maintenanceRepository) {
        this.vehicleRepository = vehicleRepository;
        this.tripRepository = tripRepository;
        this.fuelLogRepository = fuelLogRepository;
        this.expenseRepository = expenseRepository;
        this.maintenanceRepository = maintenanceRepository;
    }

    /** Fleet-wide KPI summary */
    @GetMapping("/summary")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, Object>> getSummary() {
        List<Vehicle> vehicles = vehicleRepository.findAll();
        List<Trip> trips = tripRepository.findAll();

        long activeVehicles = vehicles.stream().filter(v -> v.getStatus() == VehicleStatus.ON_TRIP).count();
        long availableVehicles = vehicles.stream().filter(v -> v.getStatus() == VehicleStatus.AVAILABLE).count();
        long inMaintenance = vehicles.stream().filter(v -> v.getStatus() == VehicleStatus.IN_SHOP).count();
        long activeTrips = trips.stream().filter(t -> t.getStatus() == TripStatus.DISPATCHED).count();
        long pendingTrips = trips.stream().filter(t -> t.getStatus() == TripStatus.DRAFT).count();
        long completedTrips = trips.stream().filter(t -> t.getStatus() == TripStatus.COMPLETED).count();

        double utilization = vehicles.isEmpty() ? 0 :
                (double) activeVehicles / vehicles.size() * 100;

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("totalVehicles", vehicles.size());
        result.put("activeVehicles", activeVehicles);
        result.put("availableVehicles", availableVehicles);
        result.put("inMaintenance", inMaintenance);
        result.put("activeTrips", activeTrips);
        result.put("pendingTrips", pendingTrips);
        result.put("completedTrips", completedTrips);
        result.put("fleetUtilizationPercent", BigDecimal.valueOf(utilization).setScale(1, RoundingMode.HALF_UP));

        return ResponseEntity.ok(result);
    }

    /** Per-vehicle ROI = (total trip revenue - (maintenance cost + fuel cost)) / acquisitionCost */
    @GetMapping("/vehicle-roi")
    @PreAuthorize("hasRole('FLEET_MANAGER') or hasRole('FINANCIAL_ANALYST')")
    public ResponseEntity<List<Map<String, Object>>> getVehicleRoi() {
        List<Vehicle> vehicles = vehicleRepository.findAll();
        List<Trip> trips = tripRepository.findAll();
        List<FuelLog> fuelLogs = fuelLogRepository.findAll();
        List<Expense> expenses = expenseRepository.findAll();

        List<Map<String, Object>> result = vehicles.stream().map(v -> {
            // Estimated revenue: planned distance * 3.5 per km for completed trips
            BigDecimal revenue = trips.stream()
                    .filter(t -> t.getVehicle().getId().equals(v.getId()) && t.getStatus() == TripStatus.COMPLETED)
                    .map(t -> t.getActualDistance() != null ? t.getActualDistance() : t.getPlannedDistance())
                    .map(d -> d.multiply(BigDecimal.valueOf(3.5)))
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            BigDecimal fuelCost = fuelLogs.stream()
                    .filter(f -> f.getVehicle().getId().equals(v.getId()))
                    .map(FuelLog::getCost)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            BigDecimal maintenanceCost = expenses.stream()
                    .filter(e -> e.getVehicle().getId().equals(v.getId()) && e.getCategory() == ExpenseCategory.MAINTENANCE)
                    .map(Expense::getAmount)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            BigDecimal totalCost = fuelCost.add(maintenanceCost);
            BigDecimal netProfit = revenue.subtract(totalCost);
            BigDecimal acquisitionCost = v.getAcquisitionCost();

            BigDecimal roi = acquisitionCost.compareTo(BigDecimal.ZERO) > 0
                    ? netProfit.divide(acquisitionCost, 4, RoundingMode.HALF_UP).multiply(BigDecimal.valueOf(100))
                    : BigDecimal.ZERO;

            Map<String, Object> row = new LinkedHashMap<>();
            row.put("vehicleId", v.getId());
            row.put("registrationNumber", v.getRegistrationNumber());
            row.put("name", v.getName());
            row.put("acquisitionCost", acquisitionCost);
            row.put("revenue", revenue.setScale(2, RoundingMode.HALF_UP));
            row.put("fuelCost", fuelCost.setScale(2, RoundingMode.HALF_UP));
            row.put("maintenanceCost", maintenanceCost.setScale(2, RoundingMode.HALF_UP));
            row.put("totalCost", totalCost.setScale(2, RoundingMode.HALF_UP));
            row.put("netProfit", netProfit.setScale(2, RoundingMode.HALF_UP));
            row.put("roiPercent", roi.setScale(2, RoundingMode.HALF_UP));
            return row;
        }).collect(Collectors.toList());

        return ResponseEntity.ok(result);
    }

    /** Per-vehicle fuel efficiency: total distance driven / total liters consumed */
    @GetMapping("/fuel-efficiency")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<Map<String, Object>>> getFuelEfficiency() {
        List<Vehicle> vehicles = vehicleRepository.findAll();
        List<Trip> trips = tripRepository.findAll();
        List<FuelLog> fuelLogs = fuelLogRepository.findAll();

        List<Map<String, Object>> result = vehicles.stream().map(v -> {
            BigDecimal totalKm = trips.stream()
                    .filter(t -> t.getVehicle().getId().equals(v.getId()) && t.getStatus() == TripStatus.COMPLETED)
                    .map(t -> t.getActualDistance() != null ? t.getActualDistance() : BigDecimal.ZERO)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            BigDecimal totalLiters = fuelLogs.stream()
                    .filter(f -> f.getVehicle().getId().equals(v.getId()))
                    .map(FuelLog::getLiters)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            BigDecimal efficiency = totalLiters.compareTo(BigDecimal.ZERO) > 0
                    ? totalKm.divide(totalLiters, 2, RoundingMode.HALF_UP)
                    : BigDecimal.ZERO;

            Map<String, Object> row = new LinkedHashMap<>();
            row.put("vehicleId", v.getId());
            row.put("registrationNumber", v.getRegistrationNumber());
            row.put("name", v.getName());
            row.put("totalKmDriven", totalKm.setScale(2, RoundingMode.HALF_UP));
            row.put("totalLitersFueled", totalLiters.setScale(2, RoundingMode.HALF_UP));
            row.put("kmPerLiter", efficiency);
            return row;
        }).collect(Collectors.toList());

        return ResponseEntity.ok(result);
    }

    /** Per-vehicle operational cost = total fuel cost + total expense amount */
    @GetMapping("/operational-cost")
    @PreAuthorize("hasRole('FLEET_MANAGER') or hasRole('FINANCIAL_ANALYST') or hasRole('DISPATCHER')")
    public ResponseEntity<List<Map<String, Object>>> getOperationalCost() {
        List<Vehicle> vehicles = vehicleRepository.findAll();
        List<FuelLog> fuelLogs = fuelLogRepository.findAll();
        List<Expense> expenses = expenseRepository.findAll();

        List<Map<String, Object>> result = vehicles.stream().map(v -> {
            BigDecimal fuelCost = fuelLogs.stream()
                    .filter(f -> f.getVehicle().getId().equals(v.getId()))
                    .map(FuelLog::getCost)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            BigDecimal otherCost = expenses.stream()
                    .filter(e -> e.getVehicle().getId().equals(v.getId()))
                    .map(Expense::getAmount)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            Map<String, Object> row = new LinkedHashMap<>();
            row.put("vehicleId", v.getId());
            row.put("registrationNumber", v.getRegistrationNumber());
            row.put("name", v.getName());
            row.put("fuelCost", fuelCost.setScale(2, RoundingMode.HALF_UP));
            row.put("otherExpenses", otherCost.setScale(2, RoundingMode.HALF_UP));
            row.put("totalOperationalCost", fuelCost.add(otherCost).setScale(2, RoundingMode.HALF_UP));
            return row;
        }).collect(Collectors.toList());

        return ResponseEntity.ok(result);
    }

    /** CSV export of all completed trips with key metrics */
    @GetMapping("/export/csv")
    @PreAuthorize("hasRole('FLEET_MANAGER') or hasRole('FINANCIAL_ANALYST')")
    public ResponseEntity<byte[]> exportCsv() {
        List<Trip> trips = tripRepository.findAll();
        List<FuelLog> fuelLogs = fuelLogRepository.findAll();

        StringBuilder csv = new StringBuilder();
        csv.append("Trip ID,Vehicle Reg,Driver Name,Source,Destination,Cargo Weight (kg),Planned Distance (km),Actual Distance (km),Status,Fuel Cost ($),Dispatched At,Completed At\n");

        for (Trip trip : trips) {
            BigDecimal fuelCost = fuelLogs.stream()
                    .filter(f -> f.getTrip() != null && f.getTrip().getId().equals(trip.getId()))
                    .map(FuelLog::getCost)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            csv.append(String.format("%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s\n",
                    trip.getId(),
                    trip.getVehicle().getRegistrationNumber(),
                    trip.getDriver().getName(),
                    escapeCsv(trip.getSource()),
                    escapeCsv(trip.getDestination()),
                    trip.getCargoWeight(),
                    trip.getPlannedDistance(),
                    trip.getActualDistance() != null ? trip.getActualDistance() : "",
                    trip.getStatus(),
                    fuelCost.setScale(2, RoundingMode.HALF_UP),
                    trip.getDispatchedAt() != null ? trip.getDispatchedAt().toLocalDate() : "",
                    trip.getCompletedAt() != null ? trip.getCompletedAt().toLocalDate() : ""
            ));
        }

        byte[] bytes = csv.toString().getBytes();
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"transitops-trips.csv\"")
                .contentType(MediaType.parseMediaType("text/csv"))
                .body(bytes);
    }

    private String escapeCsv(String value) {
        if (value == null) return "";
        if (value.contains(",") || value.contains("\"") || value.contains("\n")) {
            return "\"" + value.replace("\"", "\"\"") + "\"";
        }
        return value;
    }
}

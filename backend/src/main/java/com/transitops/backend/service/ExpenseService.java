package com.transitops.backend.service;

import com.transitops.backend.dto.expense.ExpenseRequestDTO;
import com.transitops.backend.dto.expense.ExpenseResponseDTO;
import com.transitops.backend.model.Expense;
import com.transitops.backend.model.Vehicle;
import com.transitops.backend.repository.ExpenseRepository;
import com.transitops.backend.repository.VehicleRepository;
import com.transitops.backend.repository.TripRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
public class ExpenseService {

    private final ExpenseRepository expenseRepository;
    private final VehicleRepository vehicleRepository;
    private final TripRepository tripRepository;

    public ExpenseService(ExpenseRepository expenseRepository, VehicleRepository vehicleRepository,
                         TripRepository tripRepository) {
        this.expenseRepository = expenseRepository;
        this.vehicleRepository = vehicleRepository;
        this.tripRepository = tripRepository;
    }

    public ExpenseResponseDTO createExpense(ExpenseRequestDTO request) {
        Vehicle vehicle = vehicleRepository.findById(request.getVehicleId())
                .orElseThrow(() -> new IllegalArgumentException("Vehicle not found"));

        Expense expense = new Expense();
        expense.setVehicle(vehicle);
        expense.setTrip(request.getTripId() != null ? 
            tripRepository.findById(request.getTripId()).orElse(null) : null);
        expense.setCategory(request.getCategory());
        expense.setAmount(request.getAmount());
        expense.setExpenseDate(request.getExpenseDate());
        expense.setDescription(request.getDescription() != null ? request.getDescription().trim() : null);

        Expense saved = expenseRepository.save(expense);
        return mapToResponse(saved);
    }

    public ExpenseResponseDTO getExpense(UUID id) {
        Expense expense = expenseRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Expense not found with ID: " + id));
        return mapToResponse(expense);
    }

    public List<ExpenseResponseDTO> getAllExpenses() {
        return expenseRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<ExpenseResponseDTO> getExpensesByVehicle(UUID vehicleId) {
        return expenseRepository.findAll().stream()
                .filter(e -> e.getVehicle().getId().equals(vehicleId))
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public void deleteExpense(UUID id) {
        if (!expenseRepository.existsById(id)) {
            throw new IllegalArgumentException("Expense not found with ID: " + id);
        }
        expenseRepository.deleteById(id);
    }

    private ExpenseResponseDTO mapToResponse(Expense expense) {
        ExpenseResponseDTO dto = new ExpenseResponseDTO();
        dto.setId(expense.getId());
        dto.setVehicleId(expense.getVehicle().getId());
        dto.setVehicleName(expense.getVehicle().getName());
        if (expense.getTrip() != null) {
            dto.setTripId(expense.getTrip().getId());
        }
        dto.setCategory(expense.getCategory());
        dto.setAmount(expense.getAmount());
        dto.setExpenseDate(expense.getExpenseDate());
        dto.setDescription(expense.getDescription());
        return dto;
    }
}

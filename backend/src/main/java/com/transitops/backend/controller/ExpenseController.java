package com.transitops.backend.controller;

import com.transitops.backend.dto.common.ApiResponse;
import com.transitops.backend.dto.expense.ExpenseRequestDTO;
import com.transitops.backend.dto.expense.ExpenseResponseDTO;
import com.transitops.backend.service.ExpenseService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/expenses")
public class ExpenseController {

    private final ExpenseService expenseService;

    public ExpenseController(ExpenseService expenseService) {
        this.expenseService = expenseService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ExpenseResponseDTO>> createExpense(@Valid @RequestBody ExpenseRequestDTO request) {
        ExpenseResponseDTO expense = expenseService.createExpense(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Expense created successfully", expense));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ExpenseResponseDTO>> getExpense(@PathVariable UUID id) {
        ExpenseResponseDTO expense = expenseService.getExpense(id);
        return ResponseEntity.ok(ApiResponse.success("Expense retrieved successfully", expense));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<ExpenseResponseDTO>>> getAllExpenses(
            @RequestParam(required = false) UUID vehicleId) {
        List<ExpenseResponseDTO> expenses = vehicleId != null ? 
            expenseService.getExpensesByVehicle(vehicleId) : 
            expenseService.getAllExpenses();
        return ResponseEntity.ok(ApiResponse.success("Expenses retrieved successfully", expenses));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteExpense(@PathVariable UUID id) {
        expenseService.deleteExpense(id);
        return ResponseEntity.ok(ApiResponse.success("Expense deleted successfully"));
    }
}

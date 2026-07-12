package com.transitops.backend.dto.expense;

import com.transitops.backend.model.ExpenseCategory;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExpenseResponseDTO {

    private UUID id;

    private UUID vehicleId;

    private UUID tripId;

    private String vehicleName;

    private ExpenseCategory category;

    private String description;

    private BigDecimal amount;

    private LocalDate expenseDate;
}

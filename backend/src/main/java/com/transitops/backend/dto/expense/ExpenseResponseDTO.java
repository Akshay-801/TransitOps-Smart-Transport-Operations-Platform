package com.transitops.backend.dto.expense;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExpenseResponseDTO {

    private Long id;

    private String vehicleName;

    private String expenseType;

    private String description;

    private BigDecimal amount;

    private LocalDate expenseDate;
}

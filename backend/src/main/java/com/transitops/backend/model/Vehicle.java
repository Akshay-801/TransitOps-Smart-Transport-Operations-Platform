package com.transitops.backend.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(name = "vehicles")
@Getter
@Setter
@NoArgsConstructor
public class Vehicle {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @NotBlank
    @Size(max = 50)
    @Column(nullable = false, unique = true, length = 50)
    private String registrationNumber;

    @NotBlank
    @Size(max = 100)
    @Column(nullable = false, length = 100)
    private String name;

    @Size(max = 100)
    @Column(length = 100)
    private String type;

    @NotNull
    @Positive
    @Column(nullable = false, precision = 19, scale = 2)
    private BigDecimal maxLoadCapacity;

    @NotNull
    @PositiveOrZero
    @Column(nullable = false, precision = 19, scale = 2)
    private BigDecimal odometer;

    @NotNull
    @Positive
    @Column(nullable = false, precision = 19, scale = 2)
    private BigDecimal acquisitionCost;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 32)
    private VehicleStatus status;

    @Size(max = 100)
    @Column(length = 100)
    private String region;

    @PrePersist
    void applyDefaults() {
        if (odometer == null) {
            odometer = BigDecimal.ZERO;
        }

        if (status == null) {
            status = VehicleStatus.AVAILABLE;
        }

        if (registrationNumber != null) {
            registrationNumber = registrationNumber.trim();
        }

        if (name != null) {
            name = name.trim();
        }

        if (type != null) {
            type = type.trim();
        }

        if (region != null) {
            region = region.trim();
        }
    }
}
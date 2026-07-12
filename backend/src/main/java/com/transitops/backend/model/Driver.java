package com.transitops.backend.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "drivers")
@Getter
@Setter
@NoArgsConstructor
public class Driver {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @NotBlank
    @Size(max = 100)
    @Column(nullable = false, length = 100)
    private String name;

    @NotBlank
    @Size(max = 100)
    @Column(nullable = false, unique = true, length = 100)
    private String licenseNumber;

    @NotBlank
    @Size(max = 50)
    @Column(nullable = false, length = 50)
    private String licenseCategory;

    @NotNull
    @FutureOrPresent
    @Column(nullable = false)
    private LocalDate licenseExpiryDate;

    @NotBlank
    @Size(max = 30)
    @Column(nullable = false, length = 30)
    private String contactNumber;

    @NotNull
    @Min(0)
    @Column(nullable = false)
    private Integer safetyScore;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 32)
    private DriverStatus status;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private AppUser user;

    @PrePersist
    void applyDefaults() {
        if (safetyScore == null) {
            safetyScore = 100;
        }

        if (status == null) {
            status = DriverStatus.AVAILABLE;
        }

        if (name != null) {
            name = name.trim();
        }

        if (licenseNumber != null) {
            licenseNumber = licenseNumber.trim();
        }

        if (licenseCategory != null) {
            licenseCategory = licenseCategory.trim();
        }

        if (contactNumber != null) {
            contactNumber = contactNumber.trim();
        }
    }
}
package com.healthcare.patient.dto;

import com.healthcare.patient.enums.PrescriptionStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PrescriptionDTO {
    private Integer id;

    @NotBlank(message = "Medication name is required")
    private String medicationName;

    @NotBlank(message = "Dosage is required")
    private String dosage;

    @NotBlank(message = "Frequency is required")
    private String frequency;

    private PrescriptionStatus status;

    private LocalDate startDate;

    private LocalDate endDate;

    private LocalDate lastRefillDate;

    private LocalDate nextRefillDate;

    @NotNull(message = "Patient ID is required")
    private Integer patientId;

    private Integer prescribingDoctorId;

    private String notes;
}




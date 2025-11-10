package com.healthcare.patient.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class HealthMetricDTO {
    private Integer id;

    @NotNull(message = "Patient ID is required")
    private Integer patientId;

    @NotNull(message = "Recorded date is required")
    private LocalDate recordedAt;

    private Integer systolicBloodPressure;

    private Integer diastolicBloodPressure;

    private Integer heartRate;

    private Double bloodSugarMgDl;

    private Double temperatureCelsius;

    private Integer oxygenSaturation;

    private Double weightKg;
}




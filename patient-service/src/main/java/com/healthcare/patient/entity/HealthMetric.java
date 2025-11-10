package com.healthcare.patient.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
@Entity
@Table(name = "health_metrics")
public class HealthMetric extends BaseAuditableEntity {

    @Column(nullable = false)
    private Integer patientId;

    @Column(nullable = false)
    private LocalDate recordedAt;

    private Integer systolicBloodPressure;

    private Integer diastolicBloodPressure;

    private Integer heartRate;

    private Double bloodSugarMgDl;

    private Double temperatureCelsius;

    private Integer oxygenSaturation;

    private Double weightKg;
}




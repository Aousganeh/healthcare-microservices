package com.healthcare.patient.entity;

import com.healthcare.patient.enums.PrescriptionStatus;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
@Entity
@Table(name = "prescriptions")
public class Prescription extends BaseAuditableEntity {

    @Column(nullable = false)
    private String medicationName;

    @Column(nullable = false)
    private String dosage;

    @Column(nullable = false)
    private String frequency;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PrescriptionStatus status = PrescriptionStatus.ACTIVE;

    private LocalDate startDate;

    private LocalDate endDate;

    private LocalDate lastRefillDate;

    private LocalDate nextRefillDate;

    @Column(nullable = false)
    private Integer patientId;

    private Integer prescribingDoctorId;

    private String notes;
}




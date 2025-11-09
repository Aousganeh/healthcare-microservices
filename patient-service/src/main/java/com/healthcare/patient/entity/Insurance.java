package com.healthcare.patient.entity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "insurances")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Insurance extends BaseEntity {
    @Column(name = "provider_name")
    private String providerName;
    
    @Column(name = "policy_number")
    private String policyNumber;
    
    @Column(name = "coverage_start_date")
    private LocalDate coverageStartDate;
    
    @Column(name = "coverage_end_date")
    private LocalDate coverageEndDate;
    
    @Column(name = "coverage_details", columnDefinition = "TEXT")
    private String coverageDetails;
    
    @Column(name = "coverage_percentage")
    private BigDecimal coveragePercentage;
    
    @Column(name = "patient_id", nullable = false)
    private Integer patientId;
    
    @Column(name = "is_active")
    private Boolean isActive = true;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id", insertable = false, updatable = false)
    private Patient patient;
}


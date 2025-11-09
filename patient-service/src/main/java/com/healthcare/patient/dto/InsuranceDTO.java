package com.healthcare.patient.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class InsuranceDTO {
    private Integer id;
    
    @NotBlank(message = "Provider name is required")
    private String providerName;
    
    @NotBlank(message = "Policy number is required")
    private String policyNumber;
    
    @NotNull(message = "Coverage start date is required")
    private LocalDate coverageStartDate;
    
    private LocalDate coverageEndDate;
    
    private String coverageDetails;
    
    private BigDecimal coveragePercentage;
    
    @NotNull(message = "Patient ID is required")
    private Integer patientId;
    
    private Boolean isActive;
}


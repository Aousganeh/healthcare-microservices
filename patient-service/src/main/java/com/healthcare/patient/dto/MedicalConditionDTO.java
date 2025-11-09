package com.healthcare.patient.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MedicalConditionDTO {
    private Integer id;
    
    @NotBlank(message = "Condition name is required")
    private String name;
    
    private String description;
    
    @NotNull(message = "Diagnosis date is required")
    private LocalDate diagnosisDate;
    
    private String severity;
    
    @NotNull(message = "Patient ID is required")
    private Integer patientId;
}


package com.healthcare.patient.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MedicalRecordDTO {
    private Integer id;
    
    @NotBlank(message = "Diagnosis is required")
    private String diagnosis;
    
    @NotNull(message = "Record date is required")
    private LocalDateTime recordDate;
    
    private String notes;
    
    @NotNull(message = "Patient ID is required")
    private Integer patientId;
}


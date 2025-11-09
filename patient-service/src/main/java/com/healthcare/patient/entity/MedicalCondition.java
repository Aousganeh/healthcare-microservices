package com.healthcare.patient.entity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "medical_conditions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class MedicalCondition extends BaseAuditableEntity {
    private String name;
    
    @Column(columnDefinition = "TEXT")
    private String description;
    
    @Column(name = "diagnosis_date")
    private java.time.LocalDate diagnosisDate;
    
    private String severity;
    
    @Column(name = "patient_id", nullable = false)
    private Integer patientId;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id", insertable = false, updatable = false)
    private Patient patient;
}


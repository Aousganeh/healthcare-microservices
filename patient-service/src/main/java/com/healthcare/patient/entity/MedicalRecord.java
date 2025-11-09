package com.healthcare.patient.entity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "medical_records")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class MedicalRecord extends BaseAuditableEntity {
    private String diagnosis;
    
    @Column(name = "record_date")
    private LocalDateTime recordDate;
    
    @Column(columnDefinition = "TEXT")
    private String notes;
    
    @Column(name = "patient_id", nullable = false)
    private Integer patientId;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id", insertable = false, updatable = false)
    private Patient patient;
}


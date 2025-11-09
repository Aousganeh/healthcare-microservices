package com.healthcare.appointment.entity;

import com.healthcare.appointment.enums.AppointmentStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "appointments")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Appointment extends BaseAuditableEntity {
    @Column(name = "patient_id", nullable = false)
    private Integer patientId;
    
    @Column(name = "doctor_id", nullable = false)
    private Integer doctorId;
    
    @Column(name = "appointment_date", nullable = false)
    private LocalDateTime appointmentDate;
    
    @Column(name = "duration_minutes")
    private Integer durationMinutes;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    private AppointmentStatus status;
    
    @Column(columnDefinition = "TEXT")
    private String notes;
    
    @Column(name = "reason")
    private String reason;
}


package com.healthcare.appointment.dto;

import com.healthcare.appointment.enums.AppointmentStatus;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AppointmentDTO {
    private Integer id;
    
    @NotNull(message = "Patient ID is required")
    private Integer patientId;
    
    @NotNull(message = "Doctor ID is required")
    private Integer doctorId;
    
    @NotNull(message = "Appointment date is required")
    private LocalDateTime appointmentDate;
    
    private Integer durationMinutes;
    
    private AppointmentStatus status;
    
    private String notes;
    
    private String reason;
}


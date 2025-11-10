package com.healthcare.appointment.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RescheduleRequest {
    @NotNull(message = "New appointment date is required")
    private LocalDateTime newAppointmentDate;
    
    private Integer durationMinutes;
}


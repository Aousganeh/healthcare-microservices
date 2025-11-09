package com.healthcare.appointment.dto;

import com.healthcare.appointment.enums.AppointmentStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AppointmentDetailDTO {
    private Integer id;
    private Integer patientId;
    private String patientName;
    private String patientEmail;
    private Integer doctorId;
    private String doctorName;
    private String doctorSpecialization;
    private LocalDateTime appointmentDate;
    private Integer durationMinutes;
    private AppointmentStatus status;
    private String notes;
    private String reason;
}


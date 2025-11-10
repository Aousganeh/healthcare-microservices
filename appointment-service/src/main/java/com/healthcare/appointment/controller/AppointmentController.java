package com.healthcare.appointment.controller;

import com.healthcare.appointment.dto.AppointmentDTO;
import com.healthcare.appointment.dto.AppointmentDetailDTO;
import com.healthcare.appointment.dto.RescheduleRequest;
import com.healthcare.appointment.dto.TimeSlotDTO;
import com.healthcare.appointment.service.AppointmentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/appointments")
@Tag(name = "Appointment Management", description = "APIs for managing appointments")
@RequiredArgsConstructor
public class AppointmentController {
    private final AppointmentService appointmentService;
    
    @Operation(summary = "Get all appointments", description = "Retrieves a list of all appointments")
    @GetMapping
    public ResponseEntity<List<AppointmentDTO>> getAllAppointments() {
        return ResponseEntity.ok(appointmentService.getAllAppointments());
    }
    
    @Operation(summary = "Get appointment by ID", description = "Retrieves a specific appointment by its ID")
    @GetMapping("/{id}")
    public ResponseEntity<AppointmentDTO> getAppointmentById(@PathVariable Integer id) {
        return ResponseEntity.ok(appointmentService.getAppointmentById(id));
    }
    
    @Operation(summary = "Create appointment", description = "Creates a new appointment")
    @PostMapping
    public ResponseEntity<AppointmentDTO> createAppointment(@Valid @RequestBody AppointmentDTO appointmentDTO) {
        AppointmentDTO created = appointmentService.createAppointment(appointmentDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }
    
    @Operation(summary = "Update appointment", description = "Updates an existing appointment")
    @PutMapping("/{id}")
    public ResponseEntity<AppointmentDTO> updateAppointment(@PathVariable Integer id, @Valid @RequestBody AppointmentDTO appointmentDTO) {
        return ResponseEntity.ok(appointmentService.updateAppointment(id, appointmentDTO));
    }
    
    @Operation(summary = "Delete appointment", description = "Deletes an appointment by ID")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAppointment(@PathVariable Integer id) {
        appointmentService.deleteAppointment(id);
        return ResponseEntity.noContent().build();
    }
    
    @Operation(summary = "Get appointments by patient", description = "Retrieves all appointments for a specific patient")
    @GetMapping("/patient/{patientId}")
    public ResponseEntity<List<AppointmentDTO>> getAppointmentsByPatientId(@PathVariable Integer patientId) {
        return ResponseEntity.ok(appointmentService.getAppointmentsByPatientId(patientId));
    }
    
    @Operation(summary = "Get appointments by doctor", description = "Retrieves all appointments for a specific doctor")
    @GetMapping("/doctor/{doctorId}")
    public ResponseEntity<List<AppointmentDTO>> getAppointmentsByDoctorId(@PathVariable Integer doctorId) {
        return ResponseEntity.ok(appointmentService.getAppointmentsByDoctorId(doctorId));
    }
    
    @Operation(summary = "Get appointments by status", description = "Retrieves all appointments with a specific status")
    @GetMapping("/status/{status}")
    public ResponseEntity<List<AppointmentDTO>> getAppointmentsByStatus(@PathVariable String status) {
        return ResponseEntity.ok(appointmentService.getAppointmentsByStatus(status));
    }
    
    @Operation(summary = "Get appointment details with patient and doctor info", description = "Retrieves appointment with full patient and doctor details")
    @GetMapping("/{id}/details")
    public ResponseEntity<AppointmentDetailDTO> getAppointmentDetailById(@PathVariable Integer id) {
        return ResponseEntity.ok(appointmentService.getAppointmentDetailById(id));
    }
    
    @Operation(summary = "Get doctor's appointments with patient details", description = "Retrieves all appointments for a doctor with patient information")
    @GetMapping("/doctor/{doctorId}/details")
    public ResponseEntity<List<AppointmentDetailDTO>> getAppointmentDetailsByDoctorId(@PathVariable Integer doctorId) {
        return ResponseEntity.ok(appointmentService.getAppointmentDetailsByDoctorId(doctorId));
    }
    
    @Operation(summary = "Get patient's appointments with doctor details", description = "Retrieves all appointments for a patient with doctor information")
    @GetMapping("/patient/{patientId}/details")
    public ResponseEntity<List<AppointmentDetailDTO>> getAppointmentDetailsByPatientId(@PathVariable Integer patientId) {
        return ResponseEntity.ok(appointmentService.getAppointmentDetailsByPatientId(patientId));
    }
    
    @Operation(summary = "Reschedule appointment", description = "Reschedules an appointment to a new date and time")
    @PatchMapping("/{id}/reschedule")
    public ResponseEntity<AppointmentDTO> rescheduleAppointment(
            @PathVariable Integer id,
            @Valid @RequestBody RescheduleRequest request) {
        return ResponseEntity.ok(appointmentService.rescheduleAppointment(id, request));
    }
    
    @Operation(summary = "Get available time slots", description = "Retrieves available 30-minute time slots for a doctor on a specific date")
    @GetMapping("/doctors/{doctorId}/available-slots")
    public ResponseEntity<List<TimeSlotDTO>> getAvailableTimeSlots(
            @PathVariable Integer doctorId,
            @RequestParam LocalDate date,
            @RequestParam(required = false) Integer excludeAppointmentId) {
        return ResponseEntity.ok(appointmentService.getAvailableTimeSlots(doctorId, date, excludeAppointmentId));
    }
    
    @Operation(summary = "Approve appointment", description = "Approves a pending appointment")
    @PatchMapping("/{id}/approve")
    public ResponseEntity<AppointmentDTO> approveAppointment(@PathVariable Integer id) {
        return ResponseEntity.ok(appointmentService.approveAppointment(id));
    }
    
    @Operation(summary = "Reject appointment", description = "Rejects a pending appointment")
    @PatchMapping("/{id}/reject")
    public ResponseEntity<AppointmentDTO> rejectAppointment(
            @PathVariable Integer id,
            @RequestBody(required = false) java.util.Map<String, String> request) {
        String reason = request != null ? request.get("reason") : null;
        return ResponseEntity.ok(appointmentService.rejectAppointment(id, reason));
    }
}

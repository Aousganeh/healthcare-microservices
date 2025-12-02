package com.healthcare.doctor.controller;

import com.healthcare.doctor.dto.DoctorDTO;
import com.healthcare.doctor.service.DoctorService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/doctors")
@Tag(name = "Doctor Management", description = "APIs for managing doctors")
@RequiredArgsConstructor
public class DoctorController {
    private final DoctorService doctorService;
    
    @Operation(summary = "Get all doctors", description = "Retrieves a list of all doctors")
    @GetMapping
    public ResponseEntity<List<DoctorDTO>> getAllDoctors() {
        return ResponseEntity.ok(doctorService.getAllDoctors());
    }

    @Operation(summary = "Get doctors (paged)", description = "Retrieves a paginated list of doctors")
    @GetMapping("/paged")
    public ResponseEntity<Page<DoctorDTO>> getDoctorsPaged(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "asc") String direction) {
        return ResponseEntity.ok(doctorService.getDoctorsPaged(page, size, sortBy, direction));
    }
    
    @Operation(summary = "Get doctor by ID", description = "Retrieves a specific doctor by their ID")
    @GetMapping("/{id}")
    public ResponseEntity<DoctorDTO> getDoctorById(
            @PathVariable Integer id,
            @RequestParam(defaultValue = "false") boolean includeInactive) {
        return ResponseEntity.ok(doctorService.getDoctorById(id, includeInactive));
    }
    
    @Operation(summary = "Get doctor by email", description = "Retrieves a specific doctor by their email")
    @GetMapping("/email/{email}")
    public ResponseEntity<DoctorDTO> getDoctorByEmail(
            @PathVariable String email,
            @RequestParam(defaultValue = "false") boolean includeInactive) {
        return ResponseEntity.ok(doctorService.getDoctorByEmail(email, includeInactive));
    }
    
    @Operation(summary = "Create doctor", description = "Creates a new doctor")
    @PostMapping
    public ResponseEntity<DoctorDTO> createDoctor(@Valid @RequestBody DoctorDTO doctorDTO) {
        DoctorDTO created = doctorService.createDoctor(doctorDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }
    
    @Operation(summary = "Update doctor", description = "Updates an existing doctor")
    @PutMapping("/{id}")
    public ResponseEntity<DoctorDTO> updateDoctor(@PathVariable Integer id, @Valid @RequestBody DoctorDTO doctorDTO) {
        return ResponseEntity.ok(doctorService.updateDoctor(id, doctorDTO));
    }
    
    @Operation(summary = "Delete doctor", description = "Deletes a doctor by ID")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDoctor(@PathVariable Integer id) {
        doctorService.deleteDoctor(id);
        return ResponseEntity.noContent().build();
    }
    
    @Operation(summary = "Update doctor status", description = "Enables or disables a doctor profile")
    @PatchMapping("/email/{email}/status")
    public ResponseEntity<Void> updateDoctorStatus(
            @PathVariable String email,
            @RequestParam boolean active) {
        doctorService.updateDoctorStatusByEmail(email, active);
        return ResponseEntity.noContent().build();
    }
    
    @Operation(summary = "Search doctors", description = "Searches doctors by name or surname")
    @GetMapping("/search")
    public ResponseEntity<List<DoctorDTO>> searchDoctors(@RequestParam String q) {
        return ResponseEntity.ok(doctorService.searchDoctors(q));
    }
    
    @Operation(summary = "Get doctors by specialization", description = "Retrieves all doctors with a specific specialization")
    @GetMapping("/specialization/{specialization}")
    public ResponseEntity<List<DoctorDTO>> getDoctorsBySpecialization(@PathVariable String specialization) {
        return ResponseEntity.ok(doctorService.getDoctorsBySpecialization(specialization));
    }
    
    @Operation(summary = "Get doctors by department", description = "Retrieves all doctors in a specific department")
    @GetMapping("/department/{department}")
    public ResponseEntity<List<DoctorDTO>> getDoctorsByDepartment(@PathVariable String department) {
        return ResponseEntity.ok(doctorService.getDoctorsByDepartment(department));
    }
    
    @Operation(summary = "Get doctor's appointments", description = "Retrieves all appointments for this doctor (via Appointment Service)")
    @GetMapping("/{id}/appointments")
    public ResponseEntity<?> getDoctorAppointments(@PathVariable Integer id) {
        return ResponseEntity.ok(Map.of(
            "message", "Use Appointment Service: GET /api/appointments/doctor/" + id,
            "endpoint", "/api/appointments/doctor/" + id,
            "note", "This endpoint fetches appointments from the Appointment Service"
        ));
    }
}


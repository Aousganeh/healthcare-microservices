package com.healthcare.patient.controller;

import com.healthcare.patient.dto.PatientDTO;
import com.healthcare.patient.service.PatientService;
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
@RequestMapping("/patients")
@Tag(name = "Patient Management", description = "APIs for managing patients")
@RequiredArgsConstructor
public class PatientController {
    private final PatientService patientService;
    
    @Operation(summary = "Get all patients", description = "Retrieves a list of all patients")
    @GetMapping
    public ResponseEntity<List<PatientDTO>> getAllPatients() {
        return ResponseEntity.ok(patientService.getAllPatients());
    }

    @Operation(summary = "Get patients (paged)", description = "Retrieves a paginated list of patients")
    @GetMapping("/paged")
    public ResponseEntity<Page<PatientDTO>> getPatientsPaged(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "asc") String direction) {
        return ResponseEntity.ok(patientService.getPatientsPaged(page, size, sortBy, direction));
    }
    
    @Operation(summary = "Get patient by ID", description = "Retrieves a specific patient by their ID")
    @GetMapping("/{id}")
    public ResponseEntity<PatientDTO> getPatientById(@PathVariable Integer id) {
        return ResponseEntity.ok(patientService.getPatientById(id));
    }
    
    @Operation(summary = "Create patient", description = "Creates a new patient")
    @PostMapping
    public ResponseEntity<PatientDTO> createPatient(@Valid @RequestBody PatientDTO patientDTO) {
        PatientDTO created = patientService.createPatient(patientDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }
    
    @Operation(summary = "Update patient", description = "Updates an existing patient")
    @PutMapping("/{id}")
    public ResponseEntity<PatientDTO> updatePatient(@PathVariable Integer id, @Valid @RequestBody PatientDTO patientDTO) {
        return ResponseEntity.ok(patientService.updatePatient(id, patientDTO));
    }
    
    @Operation(summary = "Delete patient", description = "Deletes a patient by ID")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePatient(@PathVariable Integer id) {
        patientService.deletePatient(id);
        return ResponseEntity.noContent().build();
    }
    
    @Operation(summary = "Search patients", description = "Searches patients by name or surname")
    @GetMapping("/search")
    public ResponseEntity<List<PatientDTO>> searchPatients(@RequestParam String q) {
        return ResponseEntity.ok(patientService.searchPatients(q));
    }
    
    @Operation(summary = "Get patients by room", description = "Retrieves all patients in a specific room")
    @GetMapping("/room/{roomId}")
    public ResponseEntity<List<PatientDTO>> getPatientsByRoomId(@PathVariable Integer roomId) {
        return ResponseEntity.ok(patientService.getPatientsByRoomId(roomId));
    }
    
    @Operation(summary = "Get patient by email", description = "Retrieves a patient by their email address")
    @GetMapping("/email/{email}")
    public ResponseEntity<PatientDTO> getPatientByEmail(@PathVariable String email) {
        return ResponseEntity.ok(patientService.getPatientByEmail(email));
    }
    
    @Operation(summary = "Get patient by serial number", description = "Retrieves a patient by their serial number (fincode)")
    @GetMapping("/serial/{serialNumber}")
    public ResponseEntity<PatientDTO> getPatientBySerialNumber(@PathVariable String serialNumber) {
        return ResponseEntity.ok(patientService.getPatientBySerialNumber(serialNumber));
    }
    
    @Operation(summary = "Get patient's appointments", description = "Retrieves all appointments for this patient (via Appointment Service)")
    @GetMapping("/{id}/appointments")
    public ResponseEntity<?> getPatientAppointments(@PathVariable Integer id) {
        return ResponseEntity.ok(Map.of(
            "message", "Use Appointment Service: GET /api/appointments/patient/" + id,
            "endpoint", "/api/appointments/patient/" + id,
            "note", "This endpoint fetches appointments from the Appointment Service"
        ));
    }
}


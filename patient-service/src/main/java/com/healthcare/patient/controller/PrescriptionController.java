package com.healthcare.patient.controller;

import com.healthcare.patient.dto.PrescriptionDTO;
import com.healthcare.patient.service.PrescriptionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/prescriptions")
@Tag(name = "Prescription Management", description = "APIs for managing patient prescriptions")
@RequiredArgsConstructor
public class PrescriptionController {

    private final PrescriptionService prescriptionService;

    @Operation(summary = "Get all prescriptions")
    @GetMapping
    public ResponseEntity<List<PrescriptionDTO>> getAllPrescriptions() {
        return ResponseEntity.ok(prescriptionService.getAllPrescriptions());
    }

    @Operation(summary = "Get prescription by ID")
    @GetMapping("/{id}")
    public ResponseEntity<PrescriptionDTO> getPrescriptionById(@PathVariable Integer id) {
        return ResponseEntity.ok(prescriptionService.getPrescriptionById(id));
    }

    @Operation(summary = "Get prescriptions by patient ID")
    @GetMapping("/patient/{patientId}")
    public ResponseEntity<List<PrescriptionDTO>> getPrescriptionsByPatient(@PathVariable Integer patientId) {
        return ResponseEntity.ok(prescriptionService.getPrescriptionsByPatientId(patientId));
    }

    @Operation(summary = "Get active prescriptions by patient ID")
    @GetMapping("/patient/{patientId}/active")
    public ResponseEntity<List<PrescriptionDTO>> getActivePrescriptionsByPatient(@PathVariable Integer patientId) {
        return ResponseEntity.ok(prescriptionService.getActivePrescriptionsByPatientId(patientId));
    }

    @Operation(summary = "Create prescription")
    @PostMapping
    public ResponseEntity<PrescriptionDTO> createPrescription(@Valid @RequestBody PrescriptionDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(prescriptionService.createPrescription(dto));
    }

    @Operation(summary = "Update prescription")
    @PutMapping("/{id}")
    public ResponseEntity<PrescriptionDTO> updatePrescription(@PathVariable Integer id,
                                                              @Valid @RequestBody PrescriptionDTO dto) {
        return ResponseEntity.ok(prescriptionService.updatePrescription(id, dto));
    }

    @Operation(summary = "Delete prescription")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePrescription(@PathVariable Integer id) {
        prescriptionService.deletePrescription(id);
        return ResponseEntity.noContent().build();
    }
}


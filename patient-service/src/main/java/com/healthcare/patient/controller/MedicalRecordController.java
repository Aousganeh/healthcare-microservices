package com.healthcare.patient.controller;

import com.healthcare.patient.dto.MedicalRecordDTO;
import com.healthcare.patient.service.MedicalRecordService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/medical-records")
@Tag(name = "Medical Record Management", description = "APIs for managing medical records")
@RequiredArgsConstructor
public class MedicalRecordController {
    private final MedicalRecordService medicalRecordService;
    
    @Operation(summary = "Get all medical records", description = "Retrieves a list of all medical records")
    @GetMapping
    public ResponseEntity<List<MedicalRecordDTO>> getAllMedicalRecords() {
        return ResponseEntity.ok(medicalRecordService.getAllMedicalRecords());
    }
    
    @Operation(summary = "Get medical record by ID", description = "Retrieves a specific medical record by its ID")
    @GetMapping("/{id}")
    public ResponseEntity<MedicalRecordDTO> getMedicalRecordById(@PathVariable Integer id) {
        return ResponseEntity.ok(medicalRecordService.getMedicalRecordById(id));
    }
    
    @Operation(summary = "Get medical records by patient ID", description = "Retrieves all medical records for a specific patient")
    @GetMapping("/patient/{patientId}")
    public ResponseEntity<List<MedicalRecordDTO>> getMedicalRecordsByPatientId(@PathVariable Integer patientId) {
        return ResponseEntity.ok(medicalRecordService.getMedicalRecordsByPatientId(patientId));
    }
    
    @Operation(summary = "Create medical record", description = "Creates a new medical record")
    @PostMapping
    public ResponseEntity<MedicalRecordDTO> createMedicalRecord(@Valid @RequestBody MedicalRecordDTO recordDTO) {
        MedicalRecordDTO created = medicalRecordService.createMedicalRecord(recordDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }
    
    @Operation(summary = "Update medical record", description = "Updates an existing medical record")
    @PutMapping("/{id}")
    public ResponseEntity<MedicalRecordDTO> updateMedicalRecord(@PathVariable Integer id, @Valid @RequestBody MedicalRecordDTO recordDTO) {
        return ResponseEntity.ok(medicalRecordService.updateMedicalRecord(id, recordDTO));
    }
    
    @Operation(summary = "Delete medical record", description = "Deletes a medical record by ID")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMedicalRecord(@PathVariable Integer id) {
        medicalRecordService.deleteMedicalRecord(id);
        return ResponseEntity.noContent().build();
    }
}


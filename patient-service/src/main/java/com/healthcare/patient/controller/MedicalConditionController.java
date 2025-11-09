package com.healthcare.patient.controller;

import com.healthcare.patient.dto.MedicalConditionDTO;
import com.healthcare.patient.service.MedicalConditionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/medical-conditions")
@Tag(name = "Medical Condition Management", description = "APIs for managing medical conditions")
@RequiredArgsConstructor
public class MedicalConditionController {
    private final MedicalConditionService medicalConditionService;
    
    @Operation(summary = "Get all medical conditions", description = "Retrieves a list of all medical conditions")
    @GetMapping
    public ResponseEntity<List<MedicalConditionDTO>> getAllMedicalConditions() {
        return ResponseEntity.ok(medicalConditionService.getAllMedicalConditions());
    }
    
    @Operation(summary = "Get medical condition by ID", description = "Retrieves a specific medical condition by its ID")
    @GetMapping("/{id}")
    public ResponseEntity<MedicalConditionDTO> getMedicalConditionById(@PathVariable Integer id) {
        return ResponseEntity.ok(medicalConditionService.getMedicalConditionById(id));
    }
    
    @Operation(summary = "Get medical conditions by patient ID", description = "Retrieves all medical conditions for a specific patient")
    @GetMapping("/patient/{patientId}")
    public ResponseEntity<List<MedicalConditionDTO>> getMedicalConditionsByPatientId(@PathVariable Integer patientId) {
        return ResponseEntity.ok(medicalConditionService.getMedicalConditionsByPatientId(patientId));
    }
    
    @Operation(summary = "Create medical condition", description = "Creates a new medical condition")
    @PostMapping
    public ResponseEntity<MedicalConditionDTO> createMedicalCondition(@Valid @RequestBody MedicalConditionDTO conditionDTO) {
        MedicalConditionDTO created = medicalConditionService.createMedicalCondition(conditionDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }
    
    @Operation(summary = "Update medical condition", description = "Updates an existing medical condition")
    @PutMapping("/{id}")
    public ResponseEntity<MedicalConditionDTO> updateMedicalCondition(@PathVariable Integer id, @Valid @RequestBody MedicalConditionDTO conditionDTO) {
        return ResponseEntity.ok(medicalConditionService.updateMedicalCondition(id, conditionDTO));
    }
    
    @Operation(summary = "Delete medical condition", description = "Deletes a medical condition by ID")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMedicalCondition(@PathVariable Integer id) {
        medicalConditionService.deleteMedicalCondition(id);
        return ResponseEntity.noContent().build();
    }
}


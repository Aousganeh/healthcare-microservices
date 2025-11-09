package com.healthcare.patient.controller;

import com.healthcare.patient.dto.InsuranceDTO;
import com.healthcare.patient.service.InsuranceService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/insurances")
@Tag(name = "Insurance Management", description = "APIs for managing patient insurances")
@RequiredArgsConstructor
public class InsuranceController {
    private final InsuranceService insuranceService;
    
    @Operation(summary = "Get all insurances", description = "Retrieves a list of all insurances")
    @GetMapping
    public ResponseEntity<List<InsuranceDTO>> getAllInsurances() {
        return ResponseEntity.ok(insuranceService.getAllInsurances());
    }
    
    @Operation(summary = "Get insurance by ID", description = "Retrieves a specific insurance by its ID")
    @GetMapping("/{id}")
    public ResponseEntity<InsuranceDTO> getInsuranceById(@PathVariable Integer id) {
        return ResponseEntity.ok(insuranceService.getInsuranceById(id));
    }
    
    @Operation(summary = "Get insurances by patient ID", description = "Retrieves all insurances for a specific patient")
    @GetMapping("/patient/{patientId}")
    public ResponseEntity<List<InsuranceDTO>> getInsurancesByPatientId(@PathVariable Integer patientId) {
        return ResponseEntity.ok(insuranceService.getInsurancesByPatientId(patientId));
    }
    
    @Operation(summary = "Get active insurances by patient ID", description = "Retrieves all active insurances for a specific patient")
    @GetMapping("/patient/{patientId}/active")
    public ResponseEntity<List<InsuranceDTO>> getActiveInsurancesByPatientId(@PathVariable Integer patientId) {
        return ResponseEntity.ok(insuranceService.getActiveInsurancesByPatientId(patientId));
    }
    
    @Operation(summary = "Create insurance", description = "Creates a new insurance")
    @PostMapping
    public ResponseEntity<InsuranceDTO> createInsurance(@Valid @RequestBody InsuranceDTO insuranceDTO) {
        InsuranceDTO created = insuranceService.createInsurance(insuranceDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }
    
    @Operation(summary = "Update insurance", description = "Updates an existing insurance")
    @PutMapping("/{id}")
    public ResponseEntity<InsuranceDTO> updateInsurance(@PathVariable Integer id, @Valid @RequestBody InsuranceDTO insuranceDTO) {
        return ResponseEntity.ok(insuranceService.updateInsurance(id, insuranceDTO));
    }
    
    @Operation(summary = "Delete insurance", description = "Deletes an insurance by ID")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteInsurance(@PathVariable Integer id) {
        insuranceService.deleteInsurance(id);
        return ResponseEntity.noContent().build();
    }
}


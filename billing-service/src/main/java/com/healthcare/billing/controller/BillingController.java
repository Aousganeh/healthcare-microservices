package com.healthcare.billing.controller;

import com.healthcare.billing.dto.BillingDTO;
import com.healthcare.billing.service.BillingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/billings")
@Tag(name = "Billing Management", description = "APIs for managing billings")
@RequiredArgsConstructor
public class BillingController {
    private final BillingService billingService;
    
    @Operation(summary = "Get all billings", description = "Retrieves a list of all billings")
    @GetMapping
    public ResponseEntity<List<BillingDTO>> getAllBillings() {
        return ResponseEntity.ok(billingService.getAllBillings());
    }
    
    @Operation(summary = "Get billing by ID", description = "Retrieves a specific billing by its ID")
    @GetMapping("/{id}")
    public ResponseEntity<BillingDTO> getBillingById(@PathVariable Integer id) {
        return ResponseEntity.ok(billingService.getBillingById(id));
    }
    
    @Operation(summary = "Create billing", description = "Creates a new billing")
    @PostMapping
    public ResponseEntity<BillingDTO> createBilling(@Valid @RequestBody BillingDTO billingDTO) {
        BillingDTO created = billingService.createBilling(billingDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }
    
    @Operation(summary = "Update billing", description = "Updates an existing billing")
    @PutMapping("/{id}")
    public ResponseEntity<BillingDTO> updateBilling(@PathVariable Integer id, @Valid @RequestBody BillingDTO billingDTO) {
        return ResponseEntity.ok(billingService.updateBilling(id, billingDTO));
    }
    
    @Operation(summary = "Delete billing", description = "Deletes a billing by ID")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBilling(@PathVariable Integer id) {
        billingService.deleteBilling(id);
        return ResponseEntity.noContent().build();
    }
    
    @Operation(summary = "Get billings by patient", description = "Retrieves all billings for a specific patient")
    @GetMapping("/patient/{patientId}")
    public ResponseEntity<List<BillingDTO>> getBillingsByPatientId(@PathVariable Integer patientId) {
        return ResponseEntity.ok(billingService.getBillingsByPatientId(patientId));
    }
    
    @Operation(summary = "Get billings by status", description = "Retrieves all billings with a specific status")
    @GetMapping("/status/{status}")
    public ResponseEntity<List<BillingDTO>> getBillingsByStatus(@PathVariable String status) {
        return ResponseEntity.ok(billingService.getBillingsByStatus(status));
    }
}

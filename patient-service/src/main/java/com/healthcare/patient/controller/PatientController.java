package com.healthcare.patient.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/patients")
@Tag(name = "Patient Management", description = "APIs for managing patients")
public class PatientController {
    
    @Operation(summary = "Get all patients", description = "Retrieves a list of all patients")
    @GetMapping
    public ResponseEntity<Map<String, String>> getAllPatients() {
        Map<String, String> response = new HashMap<>();
        response.put("message", "Patient service is running");
        response.put("status", "OK");
        return ResponseEntity.ok(response);
    }
    
    @Operation(summary = "Get patient by ID", description = "Retrieves a specific patient by their ID")
    @GetMapping("/{id}")
    public ResponseEntity<Map<String, String>> getPatientById(@PathVariable Integer id) {
        Map<String, String> response = new HashMap<>();
        response.put("message", "Patient service is running");
        response.put("id", String.valueOf(id));
        return ResponseEntity.ok(response);
    }
}


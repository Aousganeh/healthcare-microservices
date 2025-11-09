package com.healthcare.doctor.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/doctors")
@Tag(name = "Doctor Management", description = "APIs for managing doctors")
public class DoctorController {
    
    @Operation(summary = "Get all doctors", description = "Retrieves a list of all doctors")
    @GetMapping
    public ResponseEntity<Map<String, String>> getAllDoctors() {
        Map<String, String> response = new HashMap<>();
        response.put("message", "Doctor service is running");
        response.put("status", "OK");
        return ResponseEntity.ok(response);
    }
    
    @Operation(summary = "Get doctor by ID", description = "Retrieves a specific doctor by their ID")
    @GetMapping("/{id}")
    public ResponseEntity<Map<String, String>> getDoctorById(@PathVariable Integer id) {
        Map<String, String> response = new HashMap<>();
        response.put("message", "Doctor service is running");
        response.put("id", String.valueOf(id));
        return ResponseEntity.ok(response);
    }
}


package com.healthcare.equipment.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/equipment")
public class EquipmentController {
    
    @GetMapping
    public ResponseEntity<Map<String, String>> getAllEquipment() {
        Map<String, String> response = new HashMap<>();
        response.put("message", "Equipment service is running");
        response.put("status", "OK");
        return ResponseEntity.ok(response);
    }
}


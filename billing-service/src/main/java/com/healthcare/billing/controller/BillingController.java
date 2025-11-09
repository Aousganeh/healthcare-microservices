package com.healthcare.billing.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/billings")
public class BillingController {
    
    @GetMapping
    public ResponseEntity<Map<String, String>> getAllBillings() {
        Map<String, String> response = new HashMap<>();
        response.put("message", "Billing service is running");
        response.put("status", "OK");
        return ResponseEntity.ok(response);
    }
}


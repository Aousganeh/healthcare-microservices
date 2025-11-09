package com.healthcare.appointment.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/appointments")
public class AppointmentController {
    
    @GetMapping
    public ResponseEntity<Map<String, String>> getAllAppointments() {
        Map<String, String> response = new HashMap<>();
        response.put("message", "Appointment service is running");
        response.put("status", "OK");
        return ResponseEntity.ok(response);
    }
}


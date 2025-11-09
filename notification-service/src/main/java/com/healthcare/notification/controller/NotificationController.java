package com.healthcare.notification.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/notifications")
public class NotificationController {
    
    @GetMapping
    public ResponseEntity<Map<String, String>> getAllNotifications() {
        Map<String, String> response = new HashMap<>();
        response.put("message", "Notification service is running");
        response.put("status", "OK");
        return ResponseEntity.ok(response);
    }
}


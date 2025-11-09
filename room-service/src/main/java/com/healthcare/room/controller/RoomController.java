package com.healthcare.room.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/rooms")
public class RoomController {
    
    @GetMapping
    public ResponseEntity<Map<String, String>> getAllRooms() {
        Map<String, String> response = new HashMap<>();
        response.put("message", "Room service is running");
        response.put("status", "OK");
        return ResponseEntity.ok(response);
    }
}


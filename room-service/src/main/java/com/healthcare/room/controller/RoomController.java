package com.healthcare.room.controller;

import com.healthcare.room.dto.RoomDTO;
import com.healthcare.room.service.RoomService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/rooms")
@Tag(name = "Room Management", description = "APIs for managing rooms")
@RequiredArgsConstructor
public class RoomController {
    private final RoomService roomService;
    
    @Operation(summary = "Get all rooms", description = "Retrieves a list of all rooms")
    @GetMapping
    public ResponseEntity<List<RoomDTO>> getAllRooms() {
        return ResponseEntity.ok(roomService.getAllRooms());
    }
    
    @Operation(summary = "Get room by ID", description = "Retrieves a specific room by its ID")
    @GetMapping("/{id}")
    public ResponseEntity<RoomDTO> getRoomById(@PathVariable Integer id) {
        return ResponseEntity.ok(roomService.getRoomById(id));
    }
    
    @Operation(summary = "Create room", description = "Creates a new room")
    @PostMapping
    public ResponseEntity<RoomDTO> createRoom(@Valid @RequestBody RoomDTO roomDTO) {
        RoomDTO created = roomService.createRoom(roomDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }
    
    @Operation(summary = "Update room", description = "Updates an existing room")
    @PutMapping("/{id}")
    public ResponseEntity<RoomDTO> updateRoom(@PathVariable Integer id, @Valid @RequestBody RoomDTO roomDTO) {
        return ResponseEntity.ok(roomService.updateRoom(id, roomDTO));
    }
    
    @Operation(summary = "Delete room", description = "Deletes a room by ID")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRoom(@PathVariable Integer id) {
        roomService.deleteRoom(id);
        return ResponseEntity.noContent().build();
    }
    
    @Operation(summary = "Get available rooms", description = "Retrieves all available rooms")
    @GetMapping("/available")
    public ResponseEntity<List<RoomDTO>> getAvailableRooms() {
        return ResponseEntity.ok(roomService.getAvailableRooms());
    }
    
    @Operation(summary = "Get rooms by type", description = "Retrieves all rooms of a specific type")
    @GetMapping("/type/{type}")
    public ResponseEntity<List<RoomDTO>> getRoomsByType(@PathVariable String type) {
        return ResponseEntity.ok(roomService.getRoomsByType(type));
    }
}

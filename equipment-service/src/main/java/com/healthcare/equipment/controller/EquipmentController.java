package com.healthcare.equipment.controller;

import com.healthcare.equipment.dto.EquipmentDTO;
import com.healthcare.equipment.service.EquipmentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/equipment")
@Tag(name = "Equipment Management", description = "APIs for managing medical equipment")
@RequiredArgsConstructor
public class EquipmentController {
    private final EquipmentService equipmentService;
    
    @Operation(summary = "Get all equipment", description = "Retrieves a list of all equipment")
    @GetMapping
    public ResponseEntity<List<EquipmentDTO>> getAllEquipment() {
        return ResponseEntity.ok(equipmentService.getAllEquipment());
    }
    
    @Operation(summary = "Get equipment by ID", description = "Retrieves a specific equipment by its ID")
    @GetMapping("/{id}")
    public ResponseEntity<EquipmentDTO> getEquipmentById(@PathVariable Integer id) {
        return ResponseEntity.ok(equipmentService.getEquipmentById(id));
    }
    
    @Operation(summary = "Create equipment", description = "Creates a new equipment")
    @PostMapping
    public ResponseEntity<EquipmentDTO> createEquipment(@Valid @RequestBody EquipmentDTO equipmentDTO) {
        EquipmentDTO created = equipmentService.createEquipment(equipmentDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }
    
    @Operation(summary = "Update equipment", description = "Updates an existing equipment")
    @PutMapping("/{id}")
    public ResponseEntity<EquipmentDTO> updateEquipment(@PathVariable Integer id, @Valid @RequestBody EquipmentDTO equipmentDTO) {
        return ResponseEntity.ok(equipmentService.updateEquipment(id, equipmentDTO));
    }
    
    @Operation(summary = "Delete equipment", description = "Deletes an equipment by ID")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteEquipment(@PathVariable Integer id) {
        equipmentService.deleteEquipment(id);
        return ResponseEntity.noContent().build();
    }
    
    @Operation(summary = "Get equipment by status", description = "Retrieves all equipment with a specific status")
    @GetMapping("/status/{status}")
    public ResponseEntity<List<EquipmentDTO>> getEquipmentByStatus(@PathVariable String status) {
        return ResponseEntity.ok(equipmentService.getEquipmentByStatus(status));
    }
    
    @Operation(summary = "Get equipment by room", description = "Retrieves all equipment in a specific room")
    @GetMapping("/room/{roomId}")
    public ResponseEntity<List<EquipmentDTO>> getEquipmentByRoomId(@PathVariable Integer roomId) {
        return ResponseEntity.ok(equipmentService.getEquipmentByRoomId(roomId));
    }
    
    @Operation(summary = "Get equipment due for maintenance", description = "Retrieves all equipment that needs maintenance")
    @GetMapping("/maintenance/due")
    public ResponseEntity<List<EquipmentDTO>> getEquipmentDueForMaintenance() {
        return ResponseEntity.ok(equipmentService.getEquipmentDueForMaintenance());
    }
}

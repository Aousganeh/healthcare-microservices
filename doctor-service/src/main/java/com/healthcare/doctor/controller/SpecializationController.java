package com.healthcare.doctor.controller;

import com.healthcare.doctor.dto.SpecializationDTO;
import com.healthcare.doctor.service.SpecializationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/specializations")
@RequiredArgsConstructor
public class SpecializationController {
    private final SpecializationService specializationService;
    
    @GetMapping
    public ResponseEntity<List<SpecializationDTO>> getAllSpecializations() {
        return ResponseEntity.ok(specializationService.getAllSpecializations());
    }
    
    @GetMapping("/active")
    public ResponseEntity<List<SpecializationDTO>> getActiveSpecializations() {
        return ResponseEntity.ok(specializationService.getActiveSpecializations());
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<SpecializationDTO> getSpecializationById(@PathVariable Integer id) {
        return ResponseEntity.ok(specializationService.getSpecializationById(id));
    }
    
    @PostMapping
    public ResponseEntity<SpecializationDTO> createSpecialization(@Valid @RequestBody SpecializationDTO specializationDTO) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(specializationService.createSpecialization(specializationDTO));
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<SpecializationDTO> updateSpecialization(
            @PathVariable Integer id,
            @Valid @RequestBody SpecializationDTO specializationDTO) {
        return ResponseEntity.ok(specializationService.updateSpecialization(id, specializationDTO));
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSpecialization(@PathVariable Integer id) {
        specializationService.deleteSpecialization(id);
        return ResponseEntity.noContent().build();
    }
}


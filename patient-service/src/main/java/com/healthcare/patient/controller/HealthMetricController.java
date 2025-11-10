package com.healthcare.patient.controller;

import com.healthcare.patient.dto.HealthMetricDTO;
import com.healthcare.patient.service.HealthMetricService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/health-metrics")
@Tag(name = "Health Metric Management", description = "APIs for tracking patient health metrics")
@RequiredArgsConstructor
public class HealthMetricController {

    private final HealthMetricService healthMetricService;

    @Operation(summary = "Get all health metrics")
    @GetMapping
    public ResponseEntity<List<HealthMetricDTO>> getAllMetrics() {
        return ResponseEntity.ok(healthMetricService.getAllMetrics());
    }

    @Operation(summary = "Get health metric by ID")
    @GetMapping("/{id}")
    public ResponseEntity<HealthMetricDTO> getMetricById(@PathVariable Integer id) {
        return ResponseEntity.ok(healthMetricService.getMetricById(id));
    }

    @Operation(summary = "Get health metrics by patient ID")
    @GetMapping("/patient/{patientId}")
    public ResponseEntity<List<HealthMetricDTO>> getMetricsByPatient(@PathVariable Integer patientId) {
        return ResponseEntity.ok(healthMetricService.getMetricsByPatientId(patientId));
    }

    @Operation(summary = "Get health metrics by patient ID within date range")
    @GetMapping("/patient/{patientId}/range")
    public ResponseEntity<List<HealthMetricDTO>> getMetricsByPatientAndDateRange(
            @PathVariable Integer patientId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate end) {
        return ResponseEntity.ok(healthMetricService.getMetricsByPatientAndDateRange(patientId, start, end));
    }

    @Operation(summary = "Create health metric")
    @PostMapping
    public ResponseEntity<HealthMetricDTO> createMetric(@Valid @RequestBody HealthMetricDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(healthMetricService.createMetric(dto));
    }

    @Operation(summary = "Update health metric")
    @PutMapping("/{id}")
    public ResponseEntity<HealthMetricDTO> updateMetric(@PathVariable Integer id,
                                                        @Valid @RequestBody HealthMetricDTO dto) {
        return ResponseEntity.ok(healthMetricService.updateMetric(id, dto));
    }

    @Operation(summary = "Delete health metric")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMetric(@PathVariable Integer id) {
        healthMetricService.deleteMetric(id);
        return ResponseEntity.noContent().build();
    }
}




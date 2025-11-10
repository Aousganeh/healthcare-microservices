package com.healthcare.patient.service;

import com.healthcare.patient.dto.HealthMetricDTO;
import com.healthcare.patient.entity.HealthMetric;
import com.healthcare.patient.repository.HealthMetricRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class HealthMetricService {

    private final HealthMetricRepository healthMetricRepository;

    public List<HealthMetricDTO> getAllMetrics() {
        return healthMetricRepository.findAll().stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public HealthMetricDTO getMetricById(Integer id) {
        return healthMetricRepository.findById(id)
                .map(this::toDto)
                .orElseThrow(() -> new IllegalArgumentException("Health metric not found"));
    }

    public List<HealthMetricDTO> getMetricsByPatientId(Integer patientId) {
        return healthMetricRepository.findByPatientId(patientId).stream()
                .sorted(Comparator.comparing(HealthMetric::getRecordedAt).reversed())
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public List<HealthMetricDTO> getMetricsByPatientAndDateRange(Integer patientId, LocalDate start, LocalDate end) {
        return healthMetricRepository.findByPatientIdAndRecordedAtBetween(patientId, start, end).stream()
                .sorted(Comparator.comparing(HealthMetric::getRecordedAt).reversed())
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public HealthMetricDTO createMetric(HealthMetricDTO dto) {
        HealthMetric metric = toEntity(dto);
        metric.setId(null);
        return toDto(healthMetricRepository.save(metric));
    }

    public HealthMetricDTO updateMetric(Integer id, HealthMetricDTO dto) {
        HealthMetric existing = healthMetricRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Health metric not found"));

        existing.setPatientId(dto.getPatientId());
        existing.setRecordedAt(dto.getRecordedAt());
        existing.setSystolicBloodPressure(dto.getSystolicBloodPressure());
        existing.setDiastolicBloodPressure(dto.getDiastolicBloodPressure());
        existing.setHeartRate(dto.getHeartRate());
        existing.setBloodSugarMgDl(dto.getBloodSugarMgDl());
        existing.setTemperatureCelsius(dto.getTemperatureCelsius());
        existing.setOxygenSaturation(dto.getOxygenSaturation());
        existing.setWeightKg(dto.getWeightKg());

        return toDto(healthMetricRepository.save(existing));
    }

    public void deleteMetric(Integer id) {
        if (!healthMetricRepository.existsById(id)) {
            throw new IllegalArgumentException("Health metric not found");
        }
        healthMetricRepository.deleteById(id);
    }

    private HealthMetricDTO toDto(HealthMetric metric) {
        return new HealthMetricDTO(
                metric.getId(),
                metric.getPatientId(),
                metric.getRecordedAt(),
                metric.getSystolicBloodPressure(),
                metric.getDiastolicBloodPressure(),
                metric.getHeartRate(),
                metric.getBloodSugarMgDl(),
                metric.getTemperatureCelsius(),
                metric.getOxygenSaturation(),
                metric.getWeightKg()
        );
    }

    private HealthMetric toEntity(HealthMetricDTO dto) {
        HealthMetric metric = new HealthMetric();
        metric.setId(dto.getId());
        metric.setPatientId(dto.getPatientId());
        metric.setRecordedAt(dto.getRecordedAt());
        metric.setSystolicBloodPressure(dto.getSystolicBloodPressure());
        metric.setDiastolicBloodPressure(dto.getDiastolicBloodPressure());
        metric.setHeartRate(dto.getHeartRate());
        metric.setBloodSugarMgDl(dto.getBloodSugarMgDl());
        metric.setTemperatureCelsius(dto.getTemperatureCelsius());
        metric.setOxygenSaturation(dto.getOxygenSaturation());
        metric.setWeightKg(dto.getWeightKg());
        return metric;
    }
}




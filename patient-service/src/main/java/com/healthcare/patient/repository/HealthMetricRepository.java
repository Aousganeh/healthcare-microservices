package com.healthcare.patient.repository;

import com.healthcare.patient.entity.HealthMetric;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface HealthMetricRepository extends JpaRepository<HealthMetric, Integer> {
    List<HealthMetric> findByPatientId(Integer patientId);
    List<HealthMetric> findByPatientIdAndRecordedAtBetween(Integer patientId, LocalDate start, LocalDate end);
}




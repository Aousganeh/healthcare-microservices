package com.healthcare.patient.repository;

import com.healthcare.patient.entity.Prescription;
import com.healthcare.patient.enums.PrescriptionStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PrescriptionRepository extends JpaRepository<Prescription, Integer> {
    List<Prescription> findByPatientId(Integer patientId);
    List<Prescription> findByPatientIdAndStatus(Integer patientId, PrescriptionStatus status);
}




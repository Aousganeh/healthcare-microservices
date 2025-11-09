package com.healthcare.patient.repository;

import com.healthcare.patient.entity.MedicalRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MedicalRecordRepository extends JpaRepository<MedicalRecord, Integer> {
    List<MedicalRecord> findByPatientId(Integer patientId);
    
    List<MedicalRecord> findByPatientIdOrderByRecordDateDesc(Integer patientId);
}


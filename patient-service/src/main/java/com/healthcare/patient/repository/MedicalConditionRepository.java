package com.healthcare.patient.repository;

import com.healthcare.patient.entity.MedicalCondition;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MedicalConditionRepository extends JpaRepository<MedicalCondition, Integer> {
    List<MedicalCondition> findByPatientId(Integer patientId);
    
    List<MedicalCondition> findByPatientIdOrderByDiagnosisDateDesc(Integer patientId);
}


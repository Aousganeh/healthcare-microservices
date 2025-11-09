package com.healthcare.patient.repository;

import com.healthcare.patient.entity.Insurance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InsuranceRepository extends JpaRepository<Insurance, Integer> {
    List<Insurance> findByPatientId(Integer patientId);
    
    List<Insurance> findByPatientIdAndIsActiveTrue(Integer patientId);
    
    Optional<Insurance> findByPolicyNumber(String policyNumber);
}


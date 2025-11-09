package com.healthcare.patient.service;

import com.healthcare.patient.dto.InsuranceDTO;
import com.healthcare.patient.entity.Insurance;
import com.healthcare.patient.entity.Patient;
import com.healthcare.patient.repository.InsuranceRepository;
import com.healthcare.patient.repository.PatientRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class InsuranceService {
    private final InsuranceRepository insuranceRepository;
    private final PatientRepository patientRepository;
    
    public List<InsuranceDTO> getAllInsurances() {
        return insuranceRepository.findAll().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }
    
    public InsuranceDTO getInsuranceById(Integer id) {
        Insurance insurance = insuranceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Insurance not found with id: " + id));
        return toDTO(insurance);
    }
    
    public List<InsuranceDTO> getInsurancesByPatientId(Integer patientId) {
        if (!patientRepository.existsById(patientId)) {
            throw new RuntimeException("Patient not found with id: " + patientId);
        }
        return insuranceRepository.findByPatientId(patientId)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }
    
    public List<InsuranceDTO> getActiveInsurancesByPatientId(Integer patientId) {
        if (!patientRepository.existsById(patientId)) {
            throw new RuntimeException("Patient not found with id: " + patientId);
        }
        return insuranceRepository.findByPatientIdAndIsActiveTrue(patientId)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }
    
    public InsuranceDTO createInsurance(InsuranceDTO insuranceDTO) {
        Patient patient = patientRepository.findById(insuranceDTO.getPatientId())
                .orElseThrow(() -> new RuntimeException("Patient not found with id: " + insuranceDTO.getPatientId()));
        
        if (insuranceRepository.findByPolicyNumber(insuranceDTO.getPolicyNumber()).isPresent()) {
            throw new RuntimeException("Insurance with policy number already exists: " + insuranceDTO.getPolicyNumber());
        }
        
        Insurance insurance = toEntity(insuranceDTO);
        if (insurance.getIsActive() == null) {
            insurance.setIsActive(true);
        }
        
        insurance = insuranceRepository.save(insurance);
        return toDTO(insurance);
    }
    
    public InsuranceDTO updateInsurance(Integer id, InsuranceDTO insuranceDTO) {
        Insurance insurance = insuranceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Insurance not found with id: " + id));
        
        if (insuranceDTO.getPolicyNumber() != null && !insuranceDTO.getPolicyNumber().equals(insurance.getPolicyNumber())) {
            if (insuranceRepository.findByPolicyNumber(insuranceDTO.getPolicyNumber()).isPresent()) {
                throw new RuntimeException("Insurance with policy number already exists: " + insuranceDTO.getPolicyNumber());
            }
            insurance.setPolicyNumber(insuranceDTO.getPolicyNumber());
        }
        
        insurance.setProviderName(insuranceDTO.getProviderName());
        insurance.setCoverageStartDate(insuranceDTO.getCoverageStartDate());
        insurance.setCoverageEndDate(insuranceDTO.getCoverageEndDate());
        insurance.setCoverageDetails(insuranceDTO.getCoverageDetails());
        insurance.setCoveragePercentage(insuranceDTO.getCoveragePercentage());
        
        if (insuranceDTO.getIsActive() != null) {
            insurance.setIsActive(insuranceDTO.getIsActive());
        }
        
        if (insuranceDTO.getPatientId() != null && !insuranceDTO.getPatientId().equals(insurance.getPatientId())) {
            Patient patient = patientRepository.findById(insuranceDTO.getPatientId())
                    .orElseThrow(() -> new RuntimeException("Patient not found with id: " + insuranceDTO.getPatientId()));
            insurance.setPatientId(insuranceDTO.getPatientId());
        }
        
        insurance = insuranceRepository.save(insurance);
        return toDTO(insurance);
    }
    
    public void deleteInsurance(Integer id) {
        if (!insuranceRepository.existsById(id)) {
            throw new RuntimeException("Insurance not found with id: " + id);
        }
        insuranceRepository.deleteById(id);
    }
    
    private InsuranceDTO toDTO(Insurance insurance) {
        InsuranceDTO dto = new InsuranceDTO();
        dto.setId(insurance.getId());
        dto.setProviderName(insurance.getProviderName());
        dto.setPolicyNumber(insurance.getPolicyNumber());
        dto.setCoverageStartDate(insurance.getCoverageStartDate());
        dto.setCoverageEndDate(insurance.getCoverageEndDate());
        dto.setCoverageDetails(insurance.getCoverageDetails());
        dto.setCoveragePercentage(insurance.getCoveragePercentage());
        dto.setPatientId(insurance.getPatientId());
        dto.setIsActive(insurance.getIsActive());
        return dto;
    }
    
    private Insurance toEntity(InsuranceDTO dto) {
        Insurance insurance = new Insurance();
        insurance.setProviderName(dto.getProviderName());
        insurance.setPolicyNumber(dto.getPolicyNumber());
        insurance.setCoverageStartDate(dto.getCoverageStartDate());
        insurance.setCoverageEndDate(dto.getCoverageEndDate());
        insurance.setCoverageDetails(dto.getCoverageDetails());
        insurance.setCoveragePercentage(dto.getCoveragePercentage());
        insurance.setPatientId(dto.getPatientId());
        insurance.setIsActive(dto.getIsActive());
        return insurance;
    }
}


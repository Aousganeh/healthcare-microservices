package com.healthcare.patient.service;

import com.healthcare.patient.dto.MedicalConditionDTO;
import com.healthcare.patient.entity.MedicalCondition;
import com.healthcare.patient.entity.Patient;
import com.healthcare.patient.repository.MedicalConditionRepository;
import com.healthcare.patient.repository.PatientRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class MedicalConditionService {
    private final MedicalConditionRepository medicalConditionRepository;
    private final PatientRepository patientRepository;
    
    public List<MedicalConditionDTO> getAllMedicalConditions() {
        return medicalConditionRepository.findAll().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }
    
    public MedicalConditionDTO getMedicalConditionById(Integer id) {
        MedicalCondition condition = medicalConditionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Medical condition not found with id: " + id));
        return toDTO(condition);
    }
    
    public List<MedicalConditionDTO> getMedicalConditionsByPatientId(Integer patientId) {
        if (!patientRepository.existsById(patientId)) {
            throw new RuntimeException("Patient not found with id: " + patientId);
        }
        return medicalConditionRepository.findByPatientIdOrderByDiagnosisDateDesc(patientId)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }
    
    public MedicalConditionDTO createMedicalCondition(MedicalConditionDTO conditionDTO) {
        Patient patient = patientRepository.findById(conditionDTO.getPatientId())
                .orElseThrow(() -> new RuntimeException("Patient not found with id: " + conditionDTO.getPatientId()));
        
        MedicalCondition condition = toEntity(conditionDTO);
        if (condition.getDiagnosisDate() == null) {
            condition.setDiagnosisDate(java.time.LocalDate.now());
        }
        
        condition = medicalConditionRepository.save(condition);
        return toDTO(condition);
    }
    
    public MedicalConditionDTO updateMedicalCondition(Integer id, MedicalConditionDTO conditionDTO) {
        MedicalCondition condition = medicalConditionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Medical condition not found with id: " + id));
        
        condition.setName(conditionDTO.getName());
        condition.setDescription(conditionDTO.getDescription());
        condition.setDiagnosisDate(conditionDTO.getDiagnosisDate());
        condition.setSeverity(conditionDTO.getSeverity());
        
        if (conditionDTO.getPatientId() != null && !conditionDTO.getPatientId().equals(condition.getPatientId())) {
            Patient patient = patientRepository.findById(conditionDTO.getPatientId())
                    .orElseThrow(() -> new RuntimeException("Patient not found with id: " + conditionDTO.getPatientId()));
            condition.setPatientId(conditionDTO.getPatientId());
        }
        
        condition = medicalConditionRepository.save(condition);
        return toDTO(condition);
    }
    
    public void deleteMedicalCondition(Integer id) {
        if (!medicalConditionRepository.existsById(id)) {
            throw new RuntimeException("Medical condition not found with id: " + id);
        }
        medicalConditionRepository.deleteById(id);
    }
    
    private MedicalConditionDTO toDTO(MedicalCondition condition) {
        MedicalConditionDTO dto = new MedicalConditionDTO();
        dto.setId(condition.getId());
        dto.setName(condition.getName());
        dto.setDescription(condition.getDescription());
        dto.setDiagnosisDate(condition.getDiagnosisDate());
        dto.setSeverity(condition.getSeverity());
        dto.setPatientId(condition.getPatientId());
        return dto;
    }
    
    private MedicalCondition toEntity(MedicalConditionDTO dto) {
        MedicalCondition condition = new MedicalCondition();
        condition.setName(dto.getName());
        condition.setDescription(dto.getDescription());
        condition.setDiagnosisDate(dto.getDiagnosisDate());
        condition.setSeverity(dto.getSeverity());
        condition.setPatientId(dto.getPatientId());
        return condition;
    }
}


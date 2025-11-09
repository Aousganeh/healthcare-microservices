package com.healthcare.patient.service;

import com.healthcare.patient.dto.MedicalRecordDTO;
import com.healthcare.patient.entity.MedicalRecord;
import com.healthcare.patient.entity.Patient;
import com.healthcare.patient.repository.MedicalRecordRepository;
import com.healthcare.patient.repository.PatientRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class MedicalRecordService {
    private final MedicalRecordRepository medicalRecordRepository;
    private final PatientRepository patientRepository;
    
    public List<MedicalRecordDTO> getAllMedicalRecords() {
        return medicalRecordRepository.findAll().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }
    
    public MedicalRecordDTO getMedicalRecordById(Integer id) {
        MedicalRecord record = medicalRecordRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Medical record not found with id: " + id));
        return toDTO(record);
    }
    
    public List<MedicalRecordDTO> getMedicalRecordsByPatientId(Integer patientId) {
        if (!patientRepository.existsById(patientId)) {
            throw new RuntimeException("Patient not found with id: " + patientId);
        }
        return medicalRecordRepository.findByPatientIdOrderByRecordDateDesc(patientId)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }
    
    public MedicalRecordDTO createMedicalRecord(MedicalRecordDTO recordDTO) {
        Patient patient = patientRepository.findById(recordDTO.getPatientId())
                .orElseThrow(() -> new RuntimeException("Patient not found with id: " + recordDTO.getPatientId()));
        
        MedicalRecord record = toEntity(recordDTO);
        if (record.getRecordDate() == null) {
            record.setRecordDate(java.time.LocalDateTime.now());
        }
        
        record = medicalRecordRepository.save(record);
        return toDTO(record);
    }
    
    public MedicalRecordDTO updateMedicalRecord(Integer id, MedicalRecordDTO recordDTO) {
        MedicalRecord record = medicalRecordRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Medical record not found with id: " + id));
        
        record.setDiagnosis(recordDTO.getDiagnosis());
        record.setRecordDate(recordDTO.getRecordDate());
        record.setNotes(recordDTO.getNotes());
        
        if (recordDTO.getPatientId() != null && !recordDTO.getPatientId().equals(record.getPatientId())) {
            Patient patient = patientRepository.findById(recordDTO.getPatientId())
                    .orElseThrow(() -> new RuntimeException("Patient not found with id: " + recordDTO.getPatientId()));
            record.setPatientId(recordDTO.getPatientId());
        }
        
        record = medicalRecordRepository.save(record);
        return toDTO(record);
    }
    
    public void deleteMedicalRecord(Integer id) {
        if (!medicalRecordRepository.existsById(id)) {
            throw new RuntimeException("Medical record not found with id: " + id);
        }
        medicalRecordRepository.deleteById(id);
    }
    
    private MedicalRecordDTO toDTO(MedicalRecord record) {
        MedicalRecordDTO dto = new MedicalRecordDTO();
        dto.setId(record.getId());
        dto.setDiagnosis(record.getDiagnosis());
        dto.setRecordDate(record.getRecordDate());
        dto.setNotes(record.getNotes());
        dto.setPatientId(record.getPatientId());
        return dto;
    }
    
    private MedicalRecord toEntity(MedicalRecordDTO dto) {
        MedicalRecord record = new MedicalRecord();
        record.setDiagnosis(dto.getDiagnosis());
        record.setRecordDate(dto.getRecordDate());
        record.setNotes(dto.getNotes());
        record.setPatientId(dto.getPatientId());
        return record;
    }
}


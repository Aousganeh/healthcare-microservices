package com.healthcare.patient.service;

import com.healthcare.patient.dto.PatientDTO;
import com.healthcare.patient.entity.Patient;
import com.healthcare.patient.repository.PatientRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class PatientService {
    private final PatientRepository patientRepository;
    
    public List<PatientDTO> getAllPatients() {
        return patientRepository.findAll().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }
    
    public PatientDTO getPatientById(Integer id) {
        Patient patient = patientRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Patient not found with id: " + id));
        return toDTO(patient);
    }
    
    public PatientDTO createPatient(PatientDTO patientDTO) {
        if (patientDTO.getEmail() != null && patientRepository.findByEmail(patientDTO.getEmail()).isPresent()) {
            throw new RuntimeException("Patient with email already exists: " + patientDTO.getEmail());
        }
        
        Patient patient = toEntity(patientDTO);
        patient = patientRepository.save(patient);
        return toDTO(patient);
    }
    
    public PatientDTO updatePatient(Integer id, PatientDTO patientDTO) {
        Patient patient = patientRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Patient not found with id: " + id));
        
        patient.setName(patientDTO.getName());
        patient.setSurname(patientDTO.getSurname());
        patient.setDateOfBirth(patientDTO.getDateOfBirth());
        patient.setGender(patientDTO.getGender());
        patient.setEmail(patientDTO.getEmail());
        patient.setPhoneNumber(patientDTO.getPhoneNumber());
        patient.setSerialNumber(patientDTO.getSerialNumber());
        patient.setRegistrationAddress(patientDTO.getRegistrationAddress());
        patient.setCurrentAddress(patientDTO.getCurrentAddress());
        patient.setBloodGroup(patientDTO.getBloodGroup());
        patient.setRoomId(patientDTO.getRoomId());
        
        patient = patientRepository.save(patient);
        return toDTO(patient);
    }
    
    public void deletePatient(Integer id) {
        if (!patientRepository.existsById(id)) {
            throw new RuntimeException("Patient not found with id: " + id);
        }
        patientRepository.deleteById(id);
    }
    
    public List<PatientDTO> searchPatients(String searchTerm) {
        if (searchTerm == null || searchTerm.trim().isEmpty()) {
            return getAllPatients();
        }
        return patientRepository.searchPatients(searchTerm.trim())
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }
    
    public List<PatientDTO> getPatientsByRoomId(Integer roomId) {
        return patientRepository.findByRoomId(roomId)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }
    
    private PatientDTO toDTO(Patient patient) {
        PatientDTO dto = new PatientDTO();
        dto.setId(patient.getId());
        dto.setName(patient.getName());
        dto.setSurname(patient.getSurname());
        dto.setDateOfBirth(patient.getDateOfBirth());
        dto.setGender(patient.getGender());
        dto.setEmail(patient.getEmail());
        dto.setPhoneNumber(patient.getPhoneNumber());
        dto.setSerialNumber(patient.getSerialNumber());
        dto.setRegistrationAddress(patient.getRegistrationAddress());
        dto.setCurrentAddress(patient.getCurrentAddress());
        dto.setBloodGroup(patient.getBloodGroup());
        dto.setRoomId(patient.getRoomId());
        return dto;
    }
    
    private Patient toEntity(PatientDTO dto) {
        Patient patient = new Patient();
        patient.setName(dto.getName());
        patient.setSurname(dto.getSurname());
        patient.setDateOfBirth(dto.getDateOfBirth());
        patient.setGender(dto.getGender());
        patient.setEmail(dto.getEmail());
        patient.setPhoneNumber(dto.getPhoneNumber());
        patient.setSerialNumber(dto.getSerialNumber());
        patient.setRegistrationAddress(dto.getRegistrationAddress());
        patient.setCurrentAddress(dto.getCurrentAddress());
        patient.setBloodGroup(dto.getBloodGroup());
        patient.setRoomId(dto.getRoomId());
        return patient;
    }
}


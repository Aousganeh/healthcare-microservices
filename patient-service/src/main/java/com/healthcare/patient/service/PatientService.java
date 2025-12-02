package com.healthcare.patient.service;

import com.healthcare.patient.dto.PatientDTO;
import com.healthcare.patient.entity.Patient;
import com.healthcare.patient.repository.PatientRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheConfig;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
@CacheConfig(cacheNames = "patients")
public class PatientService {
    private final PatientRepository patientRepository;
    
    @Transactional(readOnly = true)
    public List<PatientDTO> getAllPatients() {
        return patientRepository.findByActiveTrue().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }
    
    @Transactional(readOnly = true)
    public Page<PatientDTO> getPatientsPaged(int page, int size, String sortBy, String direction) {
        Sort sort = "desc".equalsIgnoreCase(direction)
                ? Sort.by(sortBy).descending()
                : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);
        return patientRepository.findByActiveTrue(pageable).map(this::toDTO);
    }
    
    @Transactional(readOnly = true)
    public PatientDTO getPatientById(Integer id) {
        return getPatientById(id, false);
    }
    
    @Transactional(readOnly = true)
    @Cacheable(key = "'id:' + #id + ':includeInactive:' + #includeInactive")
    public PatientDTO getPatientById(Integer id, boolean includeInactive) {
        Patient patient = patientRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Patient not found with id: " + id));
        if (!includeInactive && Boolean.FALSE.equals(patient.getActive())) {
            throw new RuntimeException("Patient not found with id: " + id);
        }
        return toDTO(patient);
    }
    
    @CacheEvict(allEntries = true)
    public PatientDTO createPatient(PatientDTO patientDTO) {
        if (patientDTO.getEmail() != null && patientRepository.findByEmail(patientDTO.getEmail()).isPresent()) {
            throw new RuntimeException("Patient with email already exists: " + patientDTO.getEmail());
        }
        
        Patient patient = toEntity(patientDTO);
        patient = patientRepository.save(patient);
        return toDTO(patient);
    }
    
    @CacheEvict(allEntries = true)
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
    
    @CacheEvict(allEntries = true)
    public void deletePatient(Integer id) {
        Patient patient = patientRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Patient not found with id: " + id));
        patient.setActive(false);
        patientRepository.save(patient);
    }
    
    @Transactional(readOnly = true)
    @Cacheable(key = "'search:' + #searchTerm")
    public List<PatientDTO> searchPatients(String searchTerm) {
        if (searchTerm == null || searchTerm.trim().isEmpty()) {
            return getAllPatients();
        }
        return patientRepository.searchPatients(searchTerm.trim())
                .stream()
                .filter(Patient::getActive)
                .map(this::toDTO)
                .collect(Collectors.toList());
    }
    
    @Transactional(readOnly = true)
    @Cacheable(key = "'room:' + #roomId")
    public List<PatientDTO> getPatientsByRoomId(Integer roomId) {
        return patientRepository.findByRoomId(roomId)
                .stream()
                .filter(Patient::getActive)
                .map(this::toDTO)
                .collect(Collectors.toList());
    }
    
    @Transactional(readOnly = true)
    public PatientDTO getPatientByEmail(String email) {
        return getPatientByEmail(email, false);
    }
    
    @Transactional(readOnly = true)
    @Cacheable(key = "'email:' + #email + ':includeInactive:' + #includeInactive")
    public PatientDTO getPatientByEmail(String email, boolean includeInactive) {
        Patient patient = includeInactive
                ? patientRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("Patient not found with email: " + email))
                : patientRepository.findByEmailAndActiveTrue(email)
                    .orElseThrow(() -> new RuntimeException("Patient not found with email: " + email));
        if (!includeInactive && Boolean.FALSE.equals(patient.getActive())) {
            throw new RuntimeException("Patient not found with email: " + email);
        }
        return toDTO(patient);
    }
    
    @Transactional(readOnly = true)
    @Cacheable(key = "'serial:' + #serialNumber")
    public PatientDTO getPatientBySerialNumber(String serialNumber) {
        Patient patient = patientRepository.findBySerialNumber(serialNumber)
                .orElseThrow(() -> new RuntimeException("Patient not found with serial number: " + serialNumber));
        if (Boolean.FALSE.equals(patient.getActive())) {
            throw new RuntimeException("Patient not found with serial number: " + serialNumber);
        }
        return toDTO(patient);
    }
    
    @CacheEvict(allEntries = true)
    public void updatePatientStatusByEmail(String email, boolean active) {
        Patient patient = patientRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Patient not found with email: " + email));
        patient.setActive(active);
        patientRepository.save(patient);
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
        dto.setActive(patient.getActive());
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
        patient.setActive(dto.getActive() != null ? dto.getActive() : Boolean.TRUE);
        return patient;
    }
}


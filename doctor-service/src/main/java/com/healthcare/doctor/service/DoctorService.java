package com.healthcare.doctor.service;

import com.healthcare.doctor.dto.DoctorDTO;
import com.healthcare.doctor.entity.Department;
import com.healthcare.doctor.entity.Doctor;
import com.healthcare.doctor.entity.Specialization;
import com.healthcare.doctor.repository.DepartmentRepository;
import com.healthcare.doctor.repository.DoctorRepository;
import com.healthcare.doctor.repository.SpecializationRepository;
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
@CacheConfig(cacheNames = "doctors")
public class DoctorService {
    private final DoctorRepository doctorRepository;
    private final SpecializationRepository specializationRepository;
    private final DepartmentRepository departmentRepository;
    
    @Transactional(readOnly = true)
    @Cacheable(key = "'all'")
    public List<DoctorDTO> getAllDoctors() {
        return doctorRepository.findByActiveTrue().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }
    
    @Transactional(readOnly = true)
    public Page<DoctorDTO> getDoctorsPaged(int page, int size, String sortBy, String direction) {
        Sort sort = "desc".equalsIgnoreCase(direction)
                ? Sort.by(sortBy).descending()
                : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);
        return doctorRepository.findByActiveTrue(pageable).map(this::toDTO);
    }
    
    @Transactional(readOnly = true)
    public DoctorDTO getDoctorById(Integer id) {
        return getDoctorById(id, false);
    }
    
    @Transactional(readOnly = true)
    @Cacheable(key = "'id:' + #id + ':includeInactive:' + #includeInactive")
    public DoctorDTO getDoctorById(Integer id, boolean includeInactive) {
        Doctor doctor = doctorRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Doctor not found with id: " + id));
        if (!includeInactive && Boolean.FALSE.equals(doctor.getActive())) {
            throw new RuntimeException("Doctor not found with id: " + id);
        }
        return toDTO(doctor);
    }
    
    @Transactional(readOnly = true)
    public DoctorDTO getDoctorByEmail(String email) {
        return getDoctorByEmail(email, false);
    }
    
    @Transactional(readOnly = true)
    @Cacheable(key = "'email:' + #email + ':includeInactive:' + #includeInactive")
    public DoctorDTO getDoctorByEmail(String email, boolean includeInactive) {
        Doctor doctor = includeInactive
                ? doctorRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("Doctor not found with email: " + email))
                : doctorRepository.findByEmailAndActiveTrue(email)
                    .orElseThrow(() -> new RuntimeException("Doctor not found with email: " + email));
        if (!includeInactive && Boolean.FALSE.equals(doctor.getActive())) {
            throw new RuntimeException("Doctor not found with email: " + email);
        }
        return toDTO(doctor);
    }
    
    @CacheEvict(allEntries = true)
    public DoctorDTO createDoctor(DoctorDTO doctorDTO) {
        if (doctorDTO.getEmail() != null && doctorRepository.findByEmail(doctorDTO.getEmail()).isPresent()) {
            throw new RuntimeException("Doctor with email already exists: " + doctorDTO.getEmail());
        }
        if (doctorRepository.findByLicenseNumber(doctorDTO.getLicenseNumber()).isPresent()) {
            throw new RuntimeException("Doctor with license number already exists: " + doctorDTO.getLicenseNumber());
        }
        
        Specialization specialization;
        if (doctorDTO.getSpecializationId() == null || doctorDTO.getSpecializationId() == 0) {
            List<Specialization> activeSpecializations = specializationRepository.findByActiveTrue();
            if (activeSpecializations.isEmpty()) {
                throw new RuntimeException("No active specializations found. Please create at least one specialization first.");
            }
            specialization = activeSpecializations.get(0);
        } else {
            specialization = specializationRepository.findById(doctorDTO.getSpecializationId())
                    .orElseThrow(() -> new RuntimeException("Specialization not found with id: " + doctorDTO.getSpecializationId()));
        }
        
        Doctor doctor = toEntity(doctorDTO);
        doctor.setSpecialization(specialization);
        
        if (doctorDTO.getDepartmentId() != null) {
            Department department = departmentRepository.findById(doctorDTO.getDepartmentId())
                    .orElseThrow(() -> new RuntimeException("Department not found with id: " + doctorDTO.getDepartmentId()));
            doctor.setDepartment(department);
        }
        
        doctor = doctorRepository.save(doctor);
        return toDTO(doctor);
    }
    
    @CacheEvict(allEntries = true)
    public DoctorDTO updateDoctor(Integer id, DoctorDTO doctorDTO) {
        Doctor doctor = doctorRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Doctor not found with id: " + id));
        
        Specialization specialization = specializationRepository.findById(doctorDTO.getSpecializationId())
                .orElseThrow(() -> new RuntimeException("Specialization not found with id: " + doctorDTO.getSpecializationId()));
        
        doctor.setName(doctorDTO.getName());
        doctor.setSurname(doctorDTO.getSurname());
        doctor.setDateOfBirth(doctorDTO.getDateOfBirth());
        doctor.setGender(doctorDTO.getGender());
        doctor.setEmail(doctorDTO.getEmail());
        doctor.setPhoneNumber(doctorDTO.getPhoneNumber());
        doctor.setLicenseNumber(doctorDTO.getLicenseNumber());
        doctor.setSpecialization(specialization);
        
        if (doctorDTO.getDepartmentId() != null) {
            Department department = departmentRepository.findById(doctorDTO.getDepartmentId())
                    .orElseThrow(() -> new RuntimeException("Department not found with id: " + doctorDTO.getDepartmentId()));
            doctor.setDepartment(department);
        } else {
            doctor.setDepartment(null);
        }
        doctor.setDutyStatus(doctorDTO.getDutyStatus());
        doctor.setYearsOfExperience(doctorDTO.getYearsOfExperience());
        doctor.setQualifications(doctorDTO.getQualifications());
        doctor.setWorkingHoursStart(doctorDTO.getWorkingHoursStart());
        doctor.setWorkingHoursEnd(doctorDTO.getWorkingHoursEnd());
        doctor.setWorkingDays(doctorDTO.getWorkingDays());
        doctor.setPhotoUrl(doctorDTO.getPhotoUrl());
        
        doctor = doctorRepository.save(doctor);
        return toDTO(doctor);
    }
    
    @CacheEvict(allEntries = true)
    public void deleteDoctor(Integer id) {
        Doctor doctor = doctorRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Doctor not found with id: " + id));
        doctor.setActive(false);
        doctorRepository.save(doctor);
    }
    
    @CacheEvict(allEntries = true)
    public void updateDoctorStatusByEmail(String email, boolean active) {
        Doctor doctor = doctorRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Doctor not found with email: " + email));
        doctor.setActive(active);
        doctorRepository.save(doctor);
    }
    
    @Transactional(readOnly = true)
    @Cacheable(key = "'search:' + #searchTerm")
    public List<DoctorDTO> searchDoctors(String searchTerm) {
        return doctorRepository.findByNameContainingIgnoreCaseOrSurnameContainingIgnoreCaseAndActiveTrue(searchTerm, searchTerm)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }
    
    @Transactional(readOnly = true)
    @Cacheable(key = "'spec:' + #specialization")
    public List<DoctorDTO> getDoctorsBySpecialization(String specialization) {
        Specialization spec = specializationRepository.findByName(specialization)
                .orElseThrow(() -> new RuntimeException("Specialization not found: " + specialization));
        return doctorRepository.findBySpecializationAndActiveTrue(spec)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }
    
    @Transactional(readOnly = true)
    @Cacheable(key = "'dept:' + #department")
    public List<DoctorDTO> getDoctorsByDepartment(String department) {
        Department dept = departmentRepository.findByName(department)
                .orElseThrow(() -> new RuntimeException("Department not found: " + department));
        return doctorRepository.findByDepartmentAndActiveTrue(dept)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }
    
    private DoctorDTO toDTO(Doctor doctor) {
        DoctorDTO dto = new DoctorDTO();
        dto.setId(doctor.getId());
        dto.setName(doctor.getName());
        dto.setSurname(doctor.getSurname());
        dto.setDateOfBirth(doctor.getDateOfBirth());
        dto.setGender(doctor.getGender());
        dto.setEmail(doctor.getEmail());
        dto.setPhoneNumber(doctor.getPhoneNumber());
        dto.setLicenseNumber(doctor.getLicenseNumber());
        if (doctor.getSpecialization() != null) {
            dto.setSpecializationId(doctor.getSpecialization().getId());
            dto.setSpecializationName(doctor.getSpecialization().getName());
        }
        if (doctor.getDepartment() != null) {
            dto.setDepartmentId(doctor.getDepartment().getId());
            dto.setDepartmentName(doctor.getDepartment().getName());
        }
        dto.setDutyStatus(doctor.getDutyStatus());
        dto.setYearsOfExperience(doctor.getYearsOfExperience());
        dto.setQualifications(doctor.getQualifications());
        dto.setWorkingHoursStart(doctor.getWorkingHoursStart());
        dto.setWorkingHoursEnd(doctor.getWorkingHoursEnd());
        dto.setWorkingDays(doctor.getWorkingDays());
        dto.setPhotoUrl(doctor.getPhotoUrl());
        dto.setActive(doctor.getActive());
        return dto;
    }
    
    private Doctor toEntity(DoctorDTO dto) {
        Doctor doctor = new Doctor();
        doctor.setName(dto.getName());
        doctor.setSurname(dto.getSurname());
        doctor.setDateOfBirth(dto.getDateOfBirth());
        doctor.setGender(dto.getGender());
        doctor.setEmail(dto.getEmail());
        doctor.setPhoneNumber(dto.getPhoneNumber());
        doctor.setLicenseNumber(dto.getLicenseNumber());
        doctor.setDutyStatus(dto.getDutyStatus());
        doctor.setYearsOfExperience(dto.getYearsOfExperience());
        doctor.setQualifications(dto.getQualifications());
        doctor.setWorkingHoursStart(dto.getWorkingHoursStart());
        doctor.setWorkingHoursEnd(dto.getWorkingHoursEnd());
        doctor.setWorkingDays(dto.getWorkingDays());
        doctor.setPhotoUrl(dto.getPhotoUrl());
        doctor.setActive(dto.getActive() != null ? dto.getActive() : Boolean.TRUE);
        return doctor;
    }
}


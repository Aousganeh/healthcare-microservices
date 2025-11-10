package com.healthcare.doctor.service;

import com.healthcare.doctor.dto.DoctorDTO;
import com.healthcare.doctor.entity.Doctor;
import com.healthcare.doctor.repository.DoctorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class DoctorService {
    private final DoctorRepository doctorRepository;
    
    public List<DoctorDTO> getAllDoctors() {
        return doctorRepository.findAll().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }
    
    public DoctorDTO getDoctorById(Integer id) {
        Doctor doctor = doctorRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Doctor not found with id: " + id));
        return toDTO(doctor);
    }
    
    public DoctorDTO createDoctor(DoctorDTO doctorDTO) {
        if (doctorDTO.getEmail() != null && doctorRepository.findByEmail(doctorDTO.getEmail()).isPresent()) {
            throw new RuntimeException("Doctor with email already exists: " + doctorDTO.getEmail());
        }
        if (doctorRepository.findByLicenseNumber(doctorDTO.getLicenseNumber()).isPresent()) {
            throw new RuntimeException("Doctor with license number already exists: " + doctorDTO.getLicenseNumber());
        }
        
        Doctor doctor = toEntity(doctorDTO);
        doctor = doctorRepository.save(doctor);
        return toDTO(doctor);
    }
    
    public DoctorDTO updateDoctor(Integer id, DoctorDTO doctorDTO) {
        Doctor doctor = doctorRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Doctor not found with id: " + id));
        
        doctor.setName(doctorDTO.getName());
        doctor.setSurname(doctorDTO.getSurname());
        doctor.setDateOfBirth(doctorDTO.getDateOfBirth());
        doctor.setGender(doctorDTO.getGender());
        doctor.setEmail(doctorDTO.getEmail());
        doctor.setPhoneNumber(doctorDTO.getPhoneNumber());
        doctor.setLicenseNumber(doctorDTO.getLicenseNumber());
        doctor.setSpecialization(doctorDTO.getSpecialization());
        doctor.setDepartment(doctorDTO.getDepartment());
        doctor.setDutyStatus(doctorDTO.getDutyStatus());
        doctor.setYearsOfExperience(doctorDTO.getYearsOfExperience());
        doctor.setQualifications(doctorDTO.getQualifications());
        doctor.setWorkingHoursStart(doctorDTO.getWorkingHoursStart());
        doctor.setWorkingHoursEnd(doctorDTO.getWorkingHoursEnd());
        doctor.setWorkingDays(doctorDTO.getWorkingDays());
        
        doctor = doctorRepository.save(doctor);
        return toDTO(doctor);
    }
    
    public void deleteDoctor(Integer id) {
        if (!doctorRepository.existsById(id)) {
            throw new RuntimeException("Doctor not found with id: " + id);
        }
        doctorRepository.deleteById(id);
    }
    
    public List<DoctorDTO> searchDoctors(String searchTerm) {
        return doctorRepository.findByNameContainingIgnoreCaseOrSurnameContainingIgnoreCase(searchTerm, searchTerm)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }
    
    public List<DoctorDTO> getDoctorsBySpecialization(String specialization) {
        return doctorRepository.findBySpecialization(specialization)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }
    
    public List<DoctorDTO> getDoctorsByDepartment(String department) {
        return doctorRepository.findByDepartment(department)
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
        dto.setSpecialization(doctor.getSpecialization());
        dto.setDepartment(doctor.getDepartment());
        dto.setDutyStatus(doctor.getDutyStatus());
        dto.setYearsOfExperience(doctor.getYearsOfExperience());
        dto.setQualifications(doctor.getQualifications());
        dto.setWorkingHoursStart(doctor.getWorkingHoursStart());
        dto.setWorkingHoursEnd(doctor.getWorkingHoursEnd());
        dto.setWorkingDays(doctor.getWorkingDays());
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
        doctor.setSpecialization(dto.getSpecialization());
        doctor.setDepartment(dto.getDepartment());
        doctor.setDutyStatus(dto.getDutyStatus());
        doctor.setYearsOfExperience(dto.getYearsOfExperience());
        doctor.setQualifications(dto.getQualifications());
        doctor.setWorkingHoursStart(dto.getWorkingHoursStart());
        doctor.setWorkingHoursEnd(dto.getWorkingHoursEnd());
        doctor.setWorkingDays(dto.getWorkingDays());
        return doctor;
    }
}


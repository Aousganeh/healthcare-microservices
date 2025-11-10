package com.healthcare.doctor.service;

import com.healthcare.doctor.dto.SpecializationDTO;
import com.healthcare.doctor.entity.Specialization;
import com.healthcare.doctor.repository.SpecializationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class SpecializationService {
    private final SpecializationRepository specializationRepository;
    
    public List<SpecializationDTO> getAllSpecializations() {
        return specializationRepository.findAll().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }
    
    public List<SpecializationDTO> getActiveSpecializations() {
        return specializationRepository.findByActiveTrue().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }
    
    public SpecializationDTO getSpecializationById(Integer id) {
        Specialization specialization = specializationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Specialization not found with id: " + id));
        return toDTO(specialization);
    }
    
    public SpecializationDTO createSpecialization(SpecializationDTO specializationDTO) {
        if (specializationRepository.existsByName(specializationDTO.getName())) {
            throw new RuntimeException("Specialization with name already exists: " + specializationDTO.getName());
        }
        
        Specialization specialization = toEntity(specializationDTO);
        specialization = specializationRepository.save(specialization);
        return toDTO(specialization);
    }
    
    public SpecializationDTO updateSpecialization(Integer id, SpecializationDTO specializationDTO) {
        Specialization specialization = specializationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Specialization not found with id: " + id));
        
        if (!specialization.getName().equals(specializationDTO.getName()) && 
            specializationRepository.existsByName(specializationDTO.getName())) {
            throw new RuntimeException("Specialization with name already exists: " + specializationDTO.getName());
        }
        
        specialization.setName(specializationDTO.getName());
        specialization.setDescription(specializationDTO.getDescription());
        if (specializationDTO.getActive() != null) {
            specialization.setActive(specializationDTO.getActive());
        }
        
        specialization = specializationRepository.save(specialization);
        return toDTO(specialization);
    }
    
    public void deleteSpecialization(Integer id) {
        if (!specializationRepository.existsById(id)) {
            throw new RuntimeException("Specialization not found with id: " + id);
        }
        specializationRepository.deleteById(id);
    }
    
    private SpecializationDTO toDTO(Specialization specialization) {
        SpecializationDTO dto = new SpecializationDTO();
        dto.setId(specialization.getId());
        dto.setName(specialization.getName());
        dto.setDescription(specialization.getDescription());
        dto.setActive(specialization.getActive());
        return dto;
    }
    
    private Specialization toEntity(SpecializationDTO dto) {
        Specialization specialization = new Specialization();
        specialization.setName(dto.getName());
        specialization.setDescription(dto.getDescription());
        specialization.setActive(dto.getActive() != null ? dto.getActive() : true);
        return specialization;
    }
}


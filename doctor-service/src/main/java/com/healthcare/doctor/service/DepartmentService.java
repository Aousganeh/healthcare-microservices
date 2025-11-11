package com.healthcare.doctor.service;

import com.healthcare.doctor.dto.DepartmentDTO;
import com.healthcare.doctor.entity.Department;
import com.healthcare.doctor.repository.DepartmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class DepartmentService {
    private final DepartmentRepository departmentRepository;
    
    public List<DepartmentDTO> getAllDepartments() {
        return departmentRepository.findAll().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }
    
    public List<DepartmentDTO> getActiveDepartments() {
        return departmentRepository.findByActiveTrue().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }
    
    public DepartmentDTO getDepartmentById(Integer id) {
        Department department = departmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Department not found with id: " + id));
        return toDTO(department);
    }
    
    public DepartmentDTO createDepartment(DepartmentDTO departmentDTO) {
        if (departmentRepository.existsByName(departmentDTO.getName())) {
            throw new RuntimeException("Department with name already exists: " + departmentDTO.getName());
        }
        
        Department department = toEntity(departmentDTO);
        department = departmentRepository.save(department);
        return toDTO(department);
    }
    
    public DepartmentDTO updateDepartment(Integer id, DepartmentDTO departmentDTO) {
        Department department = departmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Department not found with id: " + id));
        
        department.setName(departmentDTO.getName());
        department.setDescription(departmentDTO.getDescription());
        department.setActive(departmentDTO.getActive());
        department = departmentRepository.save(department);
        return toDTO(department);
    }
    
    public void deleteDepartment(Integer id) {
        if (!departmentRepository.existsById(id)) {
            throw new RuntimeException("Department not found with id: " + id);
        }
        departmentRepository.deleteById(id);
    }
    
    private DepartmentDTO toDTO(Department department) {
        DepartmentDTO dto = new DepartmentDTO();
        dto.setId(department.getId());
        dto.setName(department.getName());
        dto.setDescription(department.getDescription());
        dto.setActive(department.getActive());
        return dto;
    }
    
    private Department toEntity(DepartmentDTO dto) {
        Department department = new Department();
        department.setName(dto.getName());
        department.setDescription(dto.getDescription());
        department.setActive(dto.getActive());
        return department;
    }
}


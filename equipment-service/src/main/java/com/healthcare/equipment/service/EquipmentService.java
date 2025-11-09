package com.healthcare.equipment.service;

import com.healthcare.equipment.dto.EquipmentDTO;
import com.healthcare.equipment.entity.Equipment;
import com.healthcare.equipment.enums.EquipmentStatus;
import com.healthcare.equipment.repository.EquipmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class EquipmentService {
    private final EquipmentRepository equipmentRepository;
    
    public List<EquipmentDTO> getAllEquipment() {
        return equipmentRepository.findAll().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }
    
    public EquipmentDTO getEquipmentById(Integer id) {
        Equipment equipment = equipmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Equipment not found with id: " + id));
        return toDTO(equipment);
    }
    
    public EquipmentDTO createEquipment(EquipmentDTO equipmentDTO) {
        if (equipmentDTO.getSerialNumber() != null && equipmentRepository.findBySerialNumber(equipmentDTO.getSerialNumber()).isPresent()) {
            throw new RuntimeException("Equipment with serial number already exists: " + equipmentDTO.getSerialNumber());
        }
        
        Equipment equipment = toEntity(equipmentDTO);
        if (equipment.getStatus() == null) {
            equipment.setStatus(EquipmentStatus.AVAILABLE);
        }
        
        equipment = equipmentRepository.save(equipment);
        return toDTO(equipment);
    }
    
    public EquipmentDTO updateEquipment(Integer id, EquipmentDTO equipmentDTO) {
        Equipment equipment = equipmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Equipment not found with id: " + id));
        
        equipment.setName(equipmentDTO.getName());
        equipment.setDescription(equipmentDTO.getDescription());
        equipment.setStatus(equipmentDTO.getStatus());
        equipment.setLastMaintenanceDate(equipmentDTO.getLastMaintenanceDate());
        equipment.setPurchaseDate(equipmentDTO.getPurchaseDate());
        equipment.setNextMaintenanceDueDate(equipmentDTO.getNextMaintenanceDueDate());
        equipment.setManufacturer(equipmentDTO.getManufacturer());
        equipment.setSerialNumber(equipmentDTO.getSerialNumber());
        equipment.setPrice(equipmentDTO.getPrice());
        equipment.setMaintenanceIntervalDays(equipmentDTO.getMaintenanceIntervalDays());
        equipment.setRoomId(equipmentDTO.getRoomId());
        
        equipment = equipmentRepository.save(equipment);
        return toDTO(equipment);
    }
    
    public void deleteEquipment(Integer id) {
        if (!equipmentRepository.existsById(id)) {
            throw new RuntimeException("Equipment not found with id: " + id);
        }
        equipmentRepository.deleteById(id);
    }
    
    public List<EquipmentDTO> getEquipmentByStatus(String status) {
        return equipmentRepository.findByStatus(status)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }
    
    public List<EquipmentDTO> getEquipmentByRoomId(Integer roomId) {
        return equipmentRepository.findByRoomId(roomId)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }
    
    public List<EquipmentDTO> getEquipmentDueForMaintenance() {
        return equipmentRepository.findEquipmentDueForMaintenance(LocalDate.now())
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }
    
    private EquipmentDTO toDTO(Equipment equipment) {
        EquipmentDTO dto = new EquipmentDTO();
        dto.setId(equipment.getId());
        dto.setName(equipment.getName());
        dto.setDescription(equipment.getDescription());
        dto.setStatus(equipment.getStatus());
        dto.setLastMaintenanceDate(equipment.getLastMaintenanceDate());
        dto.setPurchaseDate(equipment.getPurchaseDate());
        dto.setNextMaintenanceDueDate(equipment.getNextMaintenanceDueDate());
        dto.setManufacturer(equipment.getManufacturer());
        dto.setSerialNumber(equipment.getSerialNumber());
        dto.setPrice(equipment.getPrice());
        dto.setMaintenanceIntervalDays(equipment.getMaintenanceIntervalDays());
        dto.setRoomId(equipment.getRoomId());
        return dto;
    }
    
    private Equipment toEntity(EquipmentDTO dto) {
        Equipment equipment = new Equipment();
        equipment.setName(dto.getName());
        equipment.setDescription(dto.getDescription());
        equipment.setStatus(dto.getStatus());
        equipment.setLastMaintenanceDate(dto.getLastMaintenanceDate());
        equipment.setPurchaseDate(dto.getPurchaseDate());
        equipment.setNextMaintenanceDueDate(dto.getNextMaintenanceDueDate());
        equipment.setManufacturer(dto.getManufacturer());
        equipment.setSerialNumber(dto.getSerialNumber());
        equipment.setPrice(dto.getPrice());
        equipment.setMaintenanceIntervalDays(dto.getMaintenanceIntervalDays());
        equipment.setRoomId(dto.getRoomId());
        return equipment;
    }
}


package com.healthcare.equipment.repository;

import com.healthcare.equipment.entity.Equipment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface EquipmentRepository extends JpaRepository<Equipment, Integer> {
    Optional<Equipment> findBySerialNumber(String serialNumber);
    
    List<Equipment> findByStatus(String status);
    
    List<Equipment> findByRoomId(Integer roomId);
    
    @Query("SELECT e FROM Equipment e WHERE e.nextMaintenanceDueDate <= :date AND e.status != 'RETIRED'")
    List<Equipment> findEquipmentDueForMaintenance(@Param("date") LocalDate date);
    
    List<Equipment> findByNameContainingIgnoreCase(String name);
}


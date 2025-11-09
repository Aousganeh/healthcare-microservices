package com.healthcare.equipment.entity;

import com.healthcare.equipment.enums.EquipmentStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "equipment")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Equipment extends BaseEntity {
    @Column(nullable = false)
    private String name;
    
    @Column(columnDefinition = "TEXT")
    private String description;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    private EquipmentStatus status;
    
    @Column(name = "last_maintenance_date")
    private LocalDate lastMaintenanceDate;
    
    @Column(name = "purchase_date", nullable = false)
    private LocalDate purchaseDate;
    
    @Column(name = "next_maintenance_due_date")
    private LocalDate nextMaintenanceDueDate;
    
    private String manufacturer;
    
    @Column(name = "serial_number", unique = true)
    private String serialNumber;
    
    @Column(nullable = false)
    private BigDecimal price;
    
    @Column(name = "maintenance_interval_days")
    private Integer maintenanceIntervalDays;
    
    @Column(name = "room_id")
    private Integer roomId;
}


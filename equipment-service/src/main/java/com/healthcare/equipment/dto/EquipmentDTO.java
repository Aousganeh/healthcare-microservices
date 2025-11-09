package com.healthcare.equipment.dto;

import com.healthcare.equipment.enums.EquipmentStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EquipmentDTO {
    private Integer id;
    
    @NotBlank(message = "Name is required")
    private String name;
    
    private String description;
    
    private EquipmentStatus status;
    
    private LocalDate lastMaintenanceDate;
    
    @NotNull(message = "Purchase date is required")
    private LocalDate purchaseDate;
    
    private LocalDate nextMaintenanceDueDate;
    
    private String manufacturer;
    
    private String serialNumber;
    
    @NotNull(message = "Price is required")
    private BigDecimal price;
    
    private Integer maintenanceIntervalDays;
    
    private Integer roomId;
}


package com.healthcare.room.dto;

import com.healthcare.room.enums.RoomType;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RoomDTO {
    private Integer id;
    
    @NotBlank(message = "Room number is required")
    private String number;
    
    @NotNull(message = "Room type is required")
    private RoomType type;
    
    @NotNull(message = "Capacity is required")
    @Min(value = 1, message = "Capacity must be at least 1")
    private Integer capacity;
    
    private Integer floor;
    
    @Min(value = 0, message = "Current occupancy cannot be negative")
    private Integer currentOccupancy;
    
    private Boolean isAvailable;
    
    private Boolean isActive;
}


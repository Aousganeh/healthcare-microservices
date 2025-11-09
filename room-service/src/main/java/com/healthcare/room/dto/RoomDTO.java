package com.healthcare.room.dto;

import com.healthcare.room.enums.RoomType;
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
    private Integer capacity;
    
    private Integer floor;
    
    private Integer currentOccupancy;
    
    private Boolean isAvailable;
    
    private Boolean isActive;
}


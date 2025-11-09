package com.healthcare.room.entity;

import com.healthcare.room.enums.RoomType;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "rooms")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Room extends BaseAuditableEntity {
    @Column(name = "number", unique = true, nullable = false)
    private String number;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "type")
    private RoomType type;
    
    @Column(name = "capacity", nullable = false)
    private Integer capacity;
    
    @Column(name = "floor")
    private Integer floor;
    
    @Column(name = "current_occupancy")
    private Integer currentOccupancy = 0;
    
    @Column(name = "is_available")
    private Boolean isAvailable = true;
    
    @Column(name = "is_active")
    private Boolean isActive = true;
}


package com.healthcare.room.service;

import com.healthcare.room.dto.RoomDTO;
import com.healthcare.room.entity.Room;
import com.healthcare.room.enums.RoomType;
import com.healthcare.room.repository.RoomRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class RoomService {
    private final RoomRepository roomRepository;
    
    public List<RoomDTO> getAllRooms() {
        return roomRepository.findAll().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }
    
    public RoomDTO getRoomById(Integer id) {
        Room room = roomRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Room not found with id: " + id));
        return toDTO(room);
    }
    
    public RoomDTO createRoom(RoomDTO roomDTO) {
        validateRoomData(roomDTO);
        
        if (roomRepository.findByNumber(roomDTO.getNumber()).isPresent()) {
            throw new RuntimeException("Room with number already exists: " + roomDTO.getNumber());
        }
        
        Room room = toEntity(roomDTO);
        if (room.getCurrentOccupancy() == null) {
            room.setCurrentOccupancy(0);
        }
        if (room.getIsAvailable() == null) {
            room.setIsAvailable(room.getCurrentOccupancy() < room.getCapacity());
        }
        if (room.getIsActive() == null) {
            room.setIsActive(true);
        }
        
        validateRoomBusinessRules(room);
        
        room = roomRepository.save(room);
        return toDTO(room);
    }
    
    public RoomDTO updateRoom(Integer id, RoomDTO roomDTO) {
        validateRoomData(roomDTO);
        
        Room room = roomRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Room not found with id: " + id));
        
        if (roomDTO.getNumber() != null && !roomDTO.getNumber().equals(room.getNumber())) {
            if (roomRepository.findByNumber(roomDTO.getNumber()).isPresent()) {
                throw new RuntimeException("Room with number already exists: " + roomDTO.getNumber());
            }
            room.setNumber(roomDTO.getNumber());
        }
        
        if (roomDTO.getType() != null) {
            room.setType(roomDTO.getType());
        }
        if (roomDTO.getCapacity() != null) {
            room.setCapacity(roomDTO.getCapacity());
        }
        if (roomDTO.getFloor() != null) {
            room.setFloor(roomDTO.getFloor());
        }
        if (roomDTO.getCurrentOccupancy() != null) {
            room.setCurrentOccupancy(roomDTO.getCurrentOccupancy());
        }
        if (roomDTO.getIsAvailable() != null) {
            room.setIsAvailable(roomDTO.getIsAvailable());
        }
        if (roomDTO.getIsActive() != null) {
            room.setIsActive(roomDTO.getIsActive());
        }
        
        validateRoomBusinessRules(room);
        
        room = roomRepository.save(room);
        return toDTO(room);
    }
    
    public void deleteRoom(Integer id) {
        if (!roomRepository.existsById(id)) {
            throw new RuntimeException("Room not found with id: " + id);
        }
        roomRepository.deleteById(id);
    }
    
    public List<RoomDTO> getAvailableRooms() {
        return roomRepository.findAvailableRooms()
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }
    
    public List<RoomDTO> getRoomsByType(String type) {
        try {
            com.healthcare.room.enums.RoomType roomType = com.healthcare.room.enums.RoomType.valueOf(type.toUpperCase());
            return roomRepository.findByType(roomType)
                    .stream()
                    .map(this::toDTO)
                    .collect(Collectors.toList());
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Invalid room type: " + type);
        }
    }
    
    public List<Integer> getAllFloors() {
        return roomRepository.findDistinctFloors();
    }
    
    public List<RoomDTO> getAvailableRoomsByFloor(Integer floor) {
        return roomRepository.findAvailableRoomsByFloor(floor)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }
    
    public List<RoomDTO> getAvailablePatientRoomsByFloor(Integer floor) {
        List<RoomType> patientRoomTypes = List.of(
                RoomType.PATIENT_ROOM,
                RoomType.ICU,
                RoomType.WARD,
                RoomType.PRIVATE,
                RoomType.SEMI_PRIVATE,
                RoomType.EMERGENCY
        );
        
        return roomRepository.findAvailableRoomsByFloor(floor)
                .stream()
                .filter(room -> patientRoomTypes.contains(room.getType()))
                .map(this::toDTO)
                .collect(Collectors.toList());
    }
    
    private RoomDTO toDTO(Room room) {
        RoomDTO dto = new RoomDTO();
        dto.setId(room.getId());
        dto.setNumber(room.getNumber());
        dto.setType(room.getType());
        dto.setCapacity(room.getCapacity());
        dto.setFloor(room.getFloor());
        dto.setCurrentOccupancy(room.getCurrentOccupancy());
        dto.setIsAvailable(room.getIsAvailable());
        dto.setIsActive(room.getIsActive());
        return dto;
    }
    
    private void validateRoomData(RoomDTO roomDTO) {
        if (requiresCapacity(roomDTO.getType())) {
            if (roomDTO.getCapacity() == null) {
                throw new IllegalArgumentException("Room capacity is required for " + roomDTO.getType() + " room type");
            }
            if (roomDTO.getCapacity() < 1) {
                throw new IllegalArgumentException("Room capacity must be at least 1");
            }
        }
        
        if (roomDTO.getCurrentOccupancy() != null && roomDTO.getCurrentOccupancy() < 0) {
            throw new IllegalArgumentException("Current occupancy cannot be negative");
        }
        
        if (roomDTO.getCapacity() != null && roomDTO.getCurrentOccupancy() != null) {
            if (roomDTO.getCurrentOccupancy() > roomDTO.getCapacity()) {
                throw new IllegalArgumentException("Current occupancy (" + roomDTO.getCurrentOccupancy() + 
                    ") cannot exceed capacity (" + roomDTO.getCapacity() + ")");
            }
        }
        
        if (roomDTO.getType() != null && roomDTO.getCapacity() != null) {
            validateRoomTypeCapacity(roomDTO.getType(), roomDTO.getCapacity());
        }
    }
    
    private void validateRoomBusinessRules(Room room) {
        if (requiresCapacity(room.getType())) {
            if (room.getCapacity() == null || room.getCapacity() < 1) {
                throw new IllegalArgumentException("Room capacity must be at least 1 for " + room.getType() + " room type");
            }
            
            if (room.getCurrentOccupancy() == null) {
                room.setCurrentOccupancy(0);
            }
            
            if (room.getCurrentOccupancy() < 0) {
                throw new IllegalArgumentException("Current occupancy cannot be negative");
            }
            
            if (room.getCurrentOccupancy() > room.getCapacity()) {
                throw new IllegalArgumentException("Current occupancy (" + room.getCurrentOccupancy() + 
                    ") cannot exceed capacity (" + room.getCapacity() + ")");
            }
            
            if (room.getIsAvailable() == null) {
                room.setIsAvailable(room.getCurrentOccupancy() < room.getCapacity());
            } else if (room.getIsAvailable() && room.getCurrentOccupancy() >= room.getCapacity()) {
                room.setIsAvailable(false);
            }
        } else {
            if (room.getCurrentOccupancy() != null && room.getCurrentOccupancy() != 0) {
                throw new IllegalArgumentException("Current occupancy should be 0 or null for " + room.getType() + " room type");
            }
            room.setCurrentOccupancy(0);
            if (room.getIsAvailable() == null) {
                room.setIsAvailable(true);
            }
        }
        
        if (room.getType() != null && room.getCapacity() != null) {
            validateRoomTypeCapacity(room.getType(), room.getCapacity());
        }
    }
    
    private boolean requiresCapacity(com.healthcare.room.enums.RoomType roomType) {
        if (roomType == null) {
            return true;
        }
        return switch (roomType) {
            case STORAGE_ROOM, UTILITY_ROOM, OFFICE, MEETING_ROOM, LABORATORY, PHARMACY, KITCHEN, LAUNDRY -> false;
            default -> true;
        };
    }
    
    private void validateRoomTypeCapacity(com.healthcare.room.enums.RoomType roomType, Integer capacity) {
        if (capacity < 1) {
            throw new IllegalArgumentException(roomType + " room type must have capacity of at least 1, but got: " + capacity);
        }
    }
    
    private Room toEntity(RoomDTO dto) {
        Room room = new Room();
        room.setNumber(dto.getNumber());
        room.setType(dto.getType());
        room.setCapacity(dto.getCapacity());
        room.setFloor(dto.getFloor());
        room.setCurrentOccupancy(dto.getCurrentOccupancy());
        room.setIsAvailable(dto.getIsAvailable());
        room.setIsActive(dto.getIsActive());
        return room;
    }
}


package com.healthcare.room.service;

import com.healthcare.room.dto.RoomDTO;
import com.healthcare.room.entity.Room;
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
        if (roomRepository.findByNumber(roomDTO.getNumber()).isPresent()) {
            throw new RuntimeException("Room with number already exists: " + roomDTO.getNumber());
        }
        
        Room room = toEntity(roomDTO);
        if (room.getCurrentOccupancy() == null) {
            room.setCurrentOccupancy(0);
        }
        if (room.getIsAvailable() == null) {
            room.setIsAvailable(true);
        }
        if (room.getIsActive() == null) {
            room.setIsActive(true);
        }
        
        room = roomRepository.save(room);
        return toDTO(room);
    }
    
    public RoomDTO updateRoom(Integer id, RoomDTO roomDTO) {
        Room room = roomRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Room not found with id: " + id));
        
        room.setNumber(roomDTO.getNumber());
        room.setType(roomDTO.getType());
        room.setCapacity(roomDTO.getCapacity());
        room.setFloor(roomDTO.getFloor());
        room.setCurrentOccupancy(roomDTO.getCurrentOccupancy());
        room.setIsAvailable(roomDTO.getIsAvailable());
        room.setIsActive(roomDTO.getIsActive());
        
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


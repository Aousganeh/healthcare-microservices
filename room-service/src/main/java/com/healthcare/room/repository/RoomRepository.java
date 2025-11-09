package com.healthcare.room.repository;

import com.healthcare.room.entity.Room;
import com.healthcare.room.enums.RoomType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RoomRepository extends JpaRepository<Room, Integer> {
    Optional<Room> findByNumber(String number);
    
    List<Room> findByType(RoomType type);
    
    List<Room> findByFloor(Integer floor);
    
    List<Room> findByIsAvailable(Boolean isAvailable);
    
    @Query("SELECT r FROM Room r WHERE r.currentOccupancy < r.capacity AND r.isAvailable = true")
    List<Room> findAvailableRooms();
    
    @Query("SELECT DISTINCT r.floor FROM Room r WHERE r.floor IS NOT NULL ORDER BY r.floor")
    List<Integer> findDistinctFloors();
    
    @Query("SELECT r FROM Room r WHERE r.floor = :floor AND r.isAvailable = true AND r.isActive = true")
    List<Room> findAvailableRoomsByFloor(Integer floor);
    
    @Query("SELECT r FROM Room r WHERE r.floor = :floor AND r.isAvailable = true AND r.isActive = true " +
           "AND r.type IN (com.healthcare.room.enums.RoomType.PATIENT_ROOM, " +
           "com.healthcare.room.enums.RoomType.ICU, " +
           "com.healthcare.room.enums.RoomType.WARD, " +
           "com.healthcare.room.enums.RoomType.PRIVATE, " +
           "com.healthcare.room.enums.RoomType.SEMI_PRIVATE, " +
           "com.healthcare.room.enums.RoomType.EMERGENCY)")
    List<Room> findAvailablePatientRoomsByFloor(Integer floor);
}


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
}


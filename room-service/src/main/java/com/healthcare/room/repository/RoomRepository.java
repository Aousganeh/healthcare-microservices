package com.healthcare.room.repository;

import com.healthcare.room.entity.Room;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RoomRepository extends JpaRepository<Room, Integer> {
    Optional<Room> findByNumber(String number);
    
    List<Room> findByType(String type);
    
    List<Room> findByFloor(Integer floor);
    
    List<Room> findByIsAvailable(Boolean isAvailable);
    
    @Query("SELECT r FROM Room r WHERE r.currentOccupancy < r.capacity AND r.isAvailable = true")
    List<Room> findAvailableRooms();
}


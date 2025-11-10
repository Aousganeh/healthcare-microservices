package com.healthcare.doctor.repository;

import com.healthcare.doctor.entity.Specialization;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SpecializationRepository extends JpaRepository<Specialization, Integer> {
    Optional<Specialization> findByName(String name);
    
    List<Specialization> findByActiveTrue();
    
    boolean existsByName(String name);
}


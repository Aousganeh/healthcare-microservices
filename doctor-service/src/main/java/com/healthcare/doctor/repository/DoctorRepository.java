package com.healthcare.doctor.repository;

import com.healthcare.doctor.entity.Doctor;
import com.healthcare.doctor.entity.Specialization;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DoctorRepository extends JpaRepository<Doctor, Integer> {
    Optional<Doctor> findByEmail(String email);
    
    Optional<Doctor> findByEmailAndActiveTrue(String email);
    
    Optional<Doctor> findByLicenseNumber(String licenseNumber);
    
    List<Doctor> findByActiveTrue();
    
    List<Doctor> findBySpecializationAndActiveTrue(Specialization specialization);
    
    List<Doctor> findByDepartmentAndActiveTrue(com.healthcare.doctor.entity.Department department);
    
    List<Doctor> findByNameContainingIgnoreCaseOrSurnameContainingIgnoreCaseAndActiveTrue(String name, String surname);
    
    Page<Doctor> findByActiveTrue(Pageable pageable);
    
    @Query("SELECT d FROM Doctor d WHERE d.dutyStatus = :dutyStatus")
    List<Doctor> findByDutyStatus(@Param("dutyStatus") String dutyStatus);
}


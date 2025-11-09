package com.healthcare.billing.repository;

import com.healthcare.billing.entity.Billing;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface BillingRepository extends JpaRepository<Billing, Integer> {
    Optional<Billing> findByInvoiceNumber(String invoiceNumber);
    
    List<Billing> findByPatientId(Integer patientId);
    
    List<Billing> findByStatus(String status);
    
    @Query("SELECT b FROM Billing b WHERE b.billingDate BETWEEN :startDate AND :endDate")
    List<Billing> findByDateRange(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);
    
    @Query("SELECT b FROM Billing b WHERE b.patientId = :patientId AND b.status = :status")
    List<Billing> findByPatientIdAndStatus(@Param("patientId") Integer patientId, @Param("status") String status);
}


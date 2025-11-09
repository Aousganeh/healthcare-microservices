package com.healthcare.billing.entity;

import com.healthcare.billing.enums.CurrencyCode;
import com.healthcare.billing.enums.PaymentMethod;
import com.healthcare.billing.enums.PaymentStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "billings")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Billing extends BaseAuditableEntity {
    @Column(nullable = false)
    private BigDecimal amount;
    
    @Column(name = "billing_date", nullable = false)
    private LocalDateTime billingDate;
    
    @Column(name = "due_date")
    private LocalDateTime dueDate;
    
    @Column(name = "paid_date")
    private LocalDateTime paidDate;
    
    @Column(name = "invoice_number", unique = true)
    private String invoiceNumber;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "payment_method")
    private PaymentMethod paymentMethod;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    private PaymentStatus status;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "currency")
    private CurrencyCode currency;
    
    @Column(name = "tax")
    private BigDecimal tax;
    
    @Column(name = "discount")
    private BigDecimal discount;
    
    @Column(name = "insurance_id")
    private Integer insuranceId;
    
    @Column(name = "patient_id", nullable = false)
    private Integer patientId;
    
    @Column(name = "total_amount", nullable = false)
    private BigDecimal totalAmount;
}


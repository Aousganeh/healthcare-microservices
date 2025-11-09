package com.healthcare.billing.dto;

import com.healthcare.billing.enums.CurrencyCode;
import com.healthcare.billing.enums.PaymentMethod;
import com.healthcare.billing.enums.PaymentStatus;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BillingDTO {
    private Integer id;
    
    @NotNull(message = "Amount is required")
    private BigDecimal amount;
    
    @NotNull(message = "Billing date is required")
    private LocalDateTime billingDate;
    
    private LocalDateTime dueDate;
    
    private LocalDateTime paidDate;
    
    private String invoiceNumber;
    
    private PaymentMethod paymentMethod;
    
    private PaymentStatus status;
    
    private CurrencyCode currency;
    
    private BigDecimal tax;
    
    private BigDecimal discount;
    
    private Integer insuranceId;
    
    @NotNull(message = "Patient ID is required")
    private Integer patientId;
    
    @NotNull(message = "Total amount is required")
    private BigDecimal totalAmount;
}


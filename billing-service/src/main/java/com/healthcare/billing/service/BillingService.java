package com.healthcare.billing.service;

import com.healthcare.billing.dto.BillingDTO;
import com.healthcare.billing.entity.Billing;
import com.healthcare.billing.enums.CurrencyCode;
import com.healthcare.billing.enums.PaymentStatus;
import com.healthcare.billing.repository.BillingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class BillingService {
    private final BillingRepository billingRepository;
    
    public List<BillingDTO> getAllBillings() {
        return billingRepository.findAll().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }
    
    public BillingDTO getBillingById(Integer id) {
        Billing billing = billingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Billing not found with id: " + id));
        return toDTO(billing);
    }
    
    public BillingDTO createBilling(BillingDTO billingDTO) {
        if (billingDTO.getInvoiceNumber() != null && billingRepository.findByInvoiceNumber(billingDTO.getInvoiceNumber()).isPresent()) {
            throw new RuntimeException("Billing with invoice number already exists: " + billingDTO.getInvoiceNumber());
        }
        
        Billing billing = toEntity(billingDTO);
        if (billing.getStatus() == null) {
            billing.setStatus(PaymentStatus.PENDING);
        }
        if (billing.getCurrency() == null) {
            billing.setCurrency(CurrencyCode.USD);
        }
        if (billing.getTax() == null) {
            billing.setTax(BigDecimal.ZERO);
        }
        if (billing.getDiscount() == null) {
            billing.setDiscount(BigDecimal.ZERO);
        }
        if (billing.getTotalAmount() == null) {
            billing.setTotalAmount(billing.getAmount().add(billing.getTax()).subtract(billing.getDiscount()));
        }
        
        billing = billingRepository.save(billing);
        return toDTO(billing);
    }
    
    public BillingDTO updateBilling(Integer id, BillingDTO billingDTO) {
        Billing billing = billingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Billing not found with id: " + id));
        
        billing.setAmount(billingDTO.getAmount());
        billing.setBillingDate(billingDTO.getBillingDate());
        billing.setDueDate(billingDTO.getDueDate());
        billing.setPaidDate(billingDTO.getPaidDate());
        billing.setInvoiceNumber(billingDTO.getInvoiceNumber());
        billing.setPaymentMethod(billingDTO.getPaymentMethod());
        billing.setStatus(billingDTO.getStatus());
        billing.setCurrency(billingDTO.getCurrency());
        billing.setTax(billingDTO.getTax());
        billing.setDiscount(billingDTO.getDiscount());
        billing.setInsuranceId(billingDTO.getInsuranceId());
        billing.setPatientId(billingDTO.getPatientId());
        billing.setTotalAmount(billingDTO.getTotalAmount());
        
        billing = billingRepository.save(billing);
        return toDTO(billing);
    }
    
    public void deleteBilling(Integer id) {
        if (!billingRepository.existsById(id)) {
            throw new RuntimeException("Billing not found with id: " + id);
        }
        billingRepository.deleteById(id);
    }
    
    public List<BillingDTO> getBillingsByPatientId(Integer patientId) {
        return billingRepository.findByPatientId(patientId)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }
    
    public List<BillingDTO> getBillingsByStatus(String status) {
        return billingRepository.findByStatus(status)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }
    
    private BillingDTO toDTO(Billing billing) {
        BillingDTO dto = new BillingDTO();
        dto.setId(billing.getId());
        dto.setAmount(billing.getAmount());
        dto.setBillingDate(billing.getBillingDate());
        dto.setDueDate(billing.getDueDate());
        dto.setPaidDate(billing.getPaidDate());
        dto.setInvoiceNumber(billing.getInvoiceNumber());
        dto.setPaymentMethod(billing.getPaymentMethod());
        dto.setStatus(billing.getStatus());
        dto.setCurrency(billing.getCurrency());
        dto.setTax(billing.getTax());
        dto.setDiscount(billing.getDiscount());
        dto.setInsuranceId(billing.getInsuranceId());
        dto.setPatientId(billing.getPatientId());
        dto.setTotalAmount(billing.getTotalAmount());
        return dto;
    }
    
    private Billing toEntity(BillingDTO dto) {
        Billing billing = new Billing();
        billing.setAmount(dto.getAmount());
        billing.setBillingDate(dto.getBillingDate());
        billing.setDueDate(dto.getDueDate());
        billing.setPaidDate(dto.getPaidDate());
        billing.setInvoiceNumber(dto.getInvoiceNumber());
        billing.setPaymentMethod(dto.getPaymentMethod());
        billing.setStatus(dto.getStatus());
        billing.setCurrency(dto.getCurrency());
        billing.setTax(dto.getTax());
        billing.setDiscount(dto.getDiscount());
        billing.setInsuranceId(dto.getInsuranceId());
        billing.setPatientId(dto.getPatientId());
        billing.setTotalAmount(dto.getTotalAmount());
        return billing;
    }
}


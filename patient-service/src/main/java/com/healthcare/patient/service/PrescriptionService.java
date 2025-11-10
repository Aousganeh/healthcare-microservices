package com.healthcare.patient.service;

import com.healthcare.patient.dto.PrescriptionDTO;
import com.healthcare.patient.entity.Prescription;
import com.healthcare.patient.enums.PrescriptionStatus;
import com.healthcare.patient.repository.PrescriptionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PrescriptionService {

    private final PrescriptionRepository prescriptionRepository;

    public List<PrescriptionDTO> getAllPrescriptions() {
        return prescriptionRepository.findAll().stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public PrescriptionDTO getPrescriptionById(Integer id) {
        return prescriptionRepository.findById(id)
                .map(this::toDto)
                .orElseThrow(() -> new IllegalArgumentException("Prescription not found"));
    }

    public List<PrescriptionDTO> getPrescriptionsByPatientId(Integer patientId) {
        return prescriptionRepository.findByPatientId(patientId).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public List<PrescriptionDTO> getActivePrescriptionsByPatientId(Integer patientId) {
        return prescriptionRepository.findByPatientIdAndStatus(patientId, PrescriptionStatus.ACTIVE).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public PrescriptionDTO createPrescription(PrescriptionDTO dto) {
        Prescription prescription = toEntity(dto);
        if (prescription.getStatus() == null) {
            prescription.setStatus(PrescriptionStatus.ACTIVE);
        }
        prescription.setId(null);
        return toDto(prescriptionRepository.save(prescription));
    }

    public PrescriptionDTO updatePrescription(Integer id, PrescriptionDTO dto) {
        Prescription existing = prescriptionRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Prescription not found"));

        existing.setMedicationName(dto.getMedicationName());
        existing.setDosage(dto.getDosage());
        existing.setFrequency(dto.getFrequency());
        existing.setStatus(dto.getStatus() != null ? dto.getStatus() : PrescriptionStatus.ACTIVE);
        existing.setStartDate(dto.getStartDate());
        existing.setEndDate(dto.getEndDate());
        existing.setLastRefillDate(dto.getLastRefillDate());
        existing.setNextRefillDate(dto.getNextRefillDate());
        existing.setPatientId(dto.getPatientId());
        existing.setPrescribingDoctorId(dto.getPrescribingDoctorId());
        existing.setNotes(dto.getNotes());

        return toDto(prescriptionRepository.save(existing));
    }

    public void deletePrescription(Integer id) {
        if (!prescriptionRepository.existsById(id)) {
            throw new IllegalArgumentException("Prescription not found");
        }
        prescriptionRepository.deleteById(id);
    }

    private PrescriptionDTO toDto(Prescription prescription) {
        return new PrescriptionDTO(
                prescription.getId(),
                prescription.getMedicationName(),
                prescription.getDosage(),
                prescription.getFrequency(),
                prescription.getStatus(),
                prescription.getStartDate(),
                prescription.getEndDate(),
                prescription.getLastRefillDate(),
                prescription.getNextRefillDate(),
                prescription.getPatientId(),
                prescription.getPrescribingDoctorId(),
                prescription.getNotes()
        );
    }

    private Prescription toEntity(PrescriptionDTO dto) {
        Prescription prescription = new Prescription();
        prescription.setId(dto.getId());
        prescription.setMedicationName(dto.getMedicationName());
        prescription.setDosage(dto.getDosage());
        prescription.setFrequency(dto.getFrequency());
        prescription.setStatus(dto.getStatus() != null ? dto.getStatus() : PrescriptionStatus.ACTIVE);
        prescription.setStartDate(dto.getStartDate());
        prescription.setEndDate(dto.getEndDate());
        prescription.setLastRefillDate(dto.getLastRefillDate());
        prescription.setNextRefillDate(dto.getNextRefillDate());
        prescription.setPatientId(dto.getPatientId());
        prescription.setPrescribingDoctorId(dto.getPrescribingDoctorId());
        prescription.setNotes(dto.getNotes());
        return prescription;
    }
}


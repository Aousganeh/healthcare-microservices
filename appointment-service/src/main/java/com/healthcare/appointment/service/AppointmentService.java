package com.healthcare.appointment.service;

import com.healthcare.appointment.dto.AppointmentDTO;
import com.healthcare.appointment.dto.AppointmentDetailDTO;
import com.healthcare.appointment.entity.Appointment;
import com.healthcare.appointment.enums.AppointmentStatus;
import com.healthcare.appointment.feign.DoctorServiceClient;
import com.healthcare.appointment.feign.PatientServiceClient;
import com.healthcare.appointment.repository.AppointmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class AppointmentService {
    private final AppointmentRepository appointmentRepository;
    private final PatientServiceClient patientServiceClient;
    private final DoctorServiceClient doctorServiceClient;
    
    public List<AppointmentDTO> getAllAppointments() {
        return appointmentRepository.findAll().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }
    
    public AppointmentDTO getAppointmentById(Integer id) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Appointment not found with id: " + id));
        return toDTO(appointment);
    }
    
    public AppointmentDTO createAppointment(AppointmentDTO appointmentDTO) {
        Appointment appointment = toEntity(appointmentDTO);
        if (appointment.getStatus() == null) {
            appointment.setStatus(AppointmentStatus.SCHEDULED);
        }
        if (appointment.getDurationMinutes() == null) {
            appointment.setDurationMinutes(30);
        }
        appointment = appointmentRepository.save(appointment);
        return toDTO(appointment);
    }
    
    public AppointmentDTO updateAppointment(Integer id, AppointmentDTO appointmentDTO) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Appointment not found with id: " + id));
        
        appointment.setPatientId(appointmentDTO.getPatientId());
        appointment.setDoctorId(appointmentDTO.getDoctorId());
        appointment.setAppointmentDate(appointmentDTO.getAppointmentDate());
        appointment.setDurationMinutes(appointmentDTO.getDurationMinutes());
        appointment.setStatus(appointmentDTO.getStatus());
        appointment.setNotes(appointmentDTO.getNotes());
        appointment.setReason(appointmentDTO.getReason());
        
        appointment = appointmentRepository.save(appointment);
        return toDTO(appointment);
    }
    
    public void deleteAppointment(Integer id) {
        if (!appointmentRepository.existsById(id)) {
            throw new RuntimeException("Appointment not found with id: " + id);
        }
        appointmentRepository.deleteById(id);
    }
    
    public List<AppointmentDTO> getAppointmentsByPatientId(Integer patientId) {
        return appointmentRepository.findByPatientId(patientId)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }
    
    public List<AppointmentDTO> getAppointmentsByDoctorId(Integer doctorId) {
        return appointmentRepository.findByDoctorId(doctorId)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }
    
    public List<AppointmentDTO> getAppointmentsByStatus(String status) {
        return appointmentRepository.findByStatus(status)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }
    
    public AppointmentDetailDTO getAppointmentDetailById(Integer id) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Appointment not found with id: " + id));
        
        AppointmentDetailDTO detailDTO = new AppointmentDetailDTO();
        detailDTO.setId(appointment.getId());
        detailDTO.setPatientId(appointment.getPatientId());
        detailDTO.setDoctorId(appointment.getDoctorId());
        detailDTO.setAppointmentDate(appointment.getAppointmentDate());
        detailDTO.setDurationMinutes(appointment.getDurationMinutes());
        detailDTO.setStatus(appointment.getStatus());
        detailDTO.setNotes(appointment.getNotes());
        detailDTO.setReason(appointment.getReason());
        
        try {
            Map<String, Object> patient = patientServiceClient.getPatientById(appointment.getPatientId());
            detailDTO.setPatientName(patient.get("name") + " " + patient.get("surname"));
            detailDTO.setPatientEmail((String) patient.get("email"));
        } catch (Exception e) {
            detailDTO.setPatientName("Patient not found");
            detailDTO.setPatientEmail("N/A");
        }
        
        try {
            Map<String, Object> doctor = doctorServiceClient.getDoctorById(appointment.getDoctorId());
            detailDTO.setDoctorName(doctor.get("name") + " " + doctor.get("surname"));
            detailDTO.setDoctorSpecialization((String) doctor.get("specialization"));
        } catch (Exception e) {
            detailDTO.setDoctorName("Doctor not found");
            detailDTO.setDoctorSpecialization("N/A");
        }
        
        return detailDTO;
    }
    
    public List<AppointmentDetailDTO> getAppointmentDetailsByDoctorId(Integer doctorId) {
        return appointmentRepository.findByDoctorId(doctorId)
                .stream()
                .map(appointment -> {
                    AppointmentDetailDTO detailDTO = new AppointmentDetailDTO();
                    detailDTO.setId(appointment.getId());
                    detailDTO.setPatientId(appointment.getPatientId());
                    detailDTO.setDoctorId(appointment.getDoctorId());
                    detailDTO.setAppointmentDate(appointment.getAppointmentDate());
                    detailDTO.setDurationMinutes(appointment.getDurationMinutes());
                    detailDTO.setStatus(appointment.getStatus());
                    detailDTO.setNotes(appointment.getNotes());
                    detailDTO.setReason(appointment.getReason());
                    
                    try {
                        Map<String, Object> patient = patientServiceClient.getPatientById(appointment.getPatientId());
                        detailDTO.setPatientName(patient.get("name") + " " + patient.get("surname"));
                        detailDTO.setPatientEmail((String) patient.get("email"));
                    } catch (Exception e) {
                        detailDTO.setPatientName("Patient not found");
                        detailDTO.setPatientEmail("N/A");
                    }
                    
                    detailDTO.setDoctorName("Current Doctor");
                    detailDTO.setDoctorSpecialization("N/A");
                    
                    return detailDTO;
                })
                .collect(Collectors.toList());
    }
    
    public List<AppointmentDetailDTO> getAppointmentDetailsByPatientId(Integer patientId) {
        Map<String, Object> patientDetails = null;
        try {
            patientDetails = patientServiceClient.getPatientById(patientId);
        } catch (Exception ignored) {
        }

        Map<String, Object> finalPatientDetails = patientDetails;

        return appointmentRepository.findByPatientId(patientId)
            .stream()
            .map(appointment -> {
                AppointmentDetailDTO detailDTO = new AppointmentDetailDTO();
                detailDTO.setId(appointment.getId());
                detailDTO.setPatientId(appointment.getPatientId());
                detailDTO.setDoctorId(appointment.getDoctorId());
                detailDTO.setAppointmentDate(appointment.getAppointmentDate());
                detailDTO.setDurationMinutes(appointment.getDurationMinutes());
                detailDTO.setStatus(appointment.getStatus());
                detailDTO.setNotes(appointment.getNotes());
                detailDTO.setReason(appointment.getReason());

                if (finalPatientDetails != null) {
                    detailDTO.setPatientName(finalPatientDetails.get("name") + " " + finalPatientDetails.get("surname"));
                    detailDTO.setPatientEmail((String) finalPatientDetails.get("email"));
                } else {
                    detailDTO.setPatientName("Patient not found");
                    detailDTO.setPatientEmail("N/A");
                }

                try {
                    Map<String, Object> doctor = doctorServiceClient.getDoctorById(appointment.getDoctorId());
                    detailDTO.setDoctorName(doctor.get("name") + " " + doctor.get("surname"));
                    detailDTO.setDoctorSpecialization((String) doctor.get("specialization"));
                } catch (Exception e) {
                    detailDTO.setDoctorName("Doctor not found");
                    detailDTO.setDoctorSpecialization("N/A");
                }

                return detailDTO;
            })
            .collect(Collectors.toList());
    }
    
    private AppointmentDTO toDTO(Appointment appointment) {
        AppointmentDTO dto = new AppointmentDTO();
        dto.setId(appointment.getId());
        dto.setPatientId(appointment.getPatientId());
        dto.setDoctorId(appointment.getDoctorId());
        dto.setAppointmentDate(appointment.getAppointmentDate());
        dto.setDurationMinutes(appointment.getDurationMinutes());
        dto.setStatus(appointment.getStatus());
        dto.setNotes(appointment.getNotes());
        dto.setReason(appointment.getReason());
        return dto;
    }
    
    private Appointment toEntity(AppointmentDTO dto) {
        Appointment appointment = new Appointment();
        appointment.setPatientId(dto.getPatientId());
        appointment.setDoctorId(dto.getDoctorId());
        appointment.setAppointmentDate(dto.getAppointmentDate());
        appointment.setDurationMinutes(dto.getDurationMinutes());
        appointment.setStatus(dto.getStatus());
        appointment.setNotes(dto.getNotes());
        appointment.setReason(dto.getReason());
        return appointment;
    }
}


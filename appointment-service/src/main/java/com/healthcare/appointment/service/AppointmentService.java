package com.healthcare.appointment.service;

import com.healthcare.appointment.dto.AppointmentDTO;
import com.healthcare.appointment.dto.AppointmentDetailDTO;
import com.healthcare.appointment.dto.RescheduleRequest;
import com.healthcare.appointment.dto.TimeSlotDTO;
import com.healthcare.appointment.entity.Appointment;
import com.healthcare.appointment.enums.AppointmentStatus;
import com.healthcare.appointment.feign.DoctorServiceClient;
import com.healthcare.appointment.feign.PatientServiceClient;
import com.healthcare.appointment.repository.AppointmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Arrays;
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
    
    public AppointmentDTO rescheduleAppointment(Integer id, RescheduleRequest request) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Appointment not found with id: " + id));
        
        // Validate new date is in the future
        if (request.getNewAppointmentDate().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("New appointment date must be in the future");
        }
        
        appointment.setAppointmentDate(request.getNewAppointmentDate());
        if (request.getDurationMinutes() != null) {
            appointment.setDurationMinutes(request.getDurationMinutes());
        }
        // Reset status to SCHEDULED when rescheduling
        appointment.setStatus(AppointmentStatus.SCHEDULED);
        
        appointment = appointmentRepository.save(appointment);
        return toDTO(appointment);
    }
    
    public List<TimeSlotDTO> getAvailableTimeSlots(Integer doctorId, LocalDate date, Integer excludeAppointmentId) {
        // Get doctor information
        Map<String, Object> doctor = doctorServiceClient.getDoctorById(doctorId);
        
        // Default working hours if not set
        LocalTime startTime = LocalTime.of(9, 0); // 9:00 AM
        LocalTime endTime = LocalTime.of(17, 0); // 5:00 PM
        
        try {
            if (doctor.get("workingHoursStart") != null) {
                Object startObj = doctor.get("workingHoursStart");
                if (startObj instanceof String) {
                    startTime = LocalTime.parse((String) startObj);
                } else if (startObj instanceof Map) {
                    // If it's a JSON object with hour and minute
                    Map<String, Object> timeMap = (Map<String, Object>) startObj;
                    Integer hour = (Integer) timeMap.get("hour");
                    Integer minute = (Integer) timeMap.get("minute");
                    if (hour != null && minute != null) {
                        startTime = LocalTime.of(hour, minute);
                    }
                }
            }
            if (doctor.get("workingHoursEnd") != null) {
                Object endObj = doctor.get("workingHoursEnd");
                if (endObj instanceof String) {
                    endTime = LocalTime.parse((String) endObj);
                } else if (endObj instanceof Map) {
                    // If it's a JSON object with hour and minute
                    Map<String, Object> timeMap = (Map<String, Object>) endObj;
                    Integer hour = (Integer) timeMap.get("hour");
                    Integer minute = (Integer) timeMap.get("minute");
                    if (hour != null && minute != null) {
                        endTime = LocalTime.of(hour, minute);
                    }
                }
            }
        } catch (Exception e) {
            // Use defaults if parsing fails
        }
        
        // Check if doctor works on this day
        String workingDays = (String) doctor.get("workingDays");
        if (workingDays != null && !workingDays.isEmpty()) {
            DayOfWeek dayOfWeek = date.getDayOfWeek();
            List<String> days = Arrays.asList(workingDays.split(","));
            if (!days.contains(dayOfWeek.name())) {
                return new ArrayList<>(); // Doctor doesn't work on this day
            }
        }
        
        // Get existing appointments for this doctor on this date
        List<Appointment> existingAppointments = appointmentRepository.findByDoctorId(doctorId).stream()
                .filter(apt -> {
                    LocalDate aptDate = apt.getAppointmentDate().toLocalDate();
                    return aptDate.equals(date) && 
                           !apt.getStatus().equals(AppointmentStatus.CANCELLED) &&
                           (excludeAppointmentId == null || !apt.getId().equals(excludeAppointmentId));
                })
                .collect(Collectors.toList());
        
        // Generate 30-minute time slots
        List<TimeSlotDTO> slots = new ArrayList<>();
        LocalDateTime slotStart = LocalDateTime.of(date, startTime);
        LocalDateTime slotEnd = slotStart.plusMinutes(30);
        LocalDateTime dayEnd = LocalDateTime.of(date, endTime);
        
        DateTimeFormatter timeFormatter = DateTimeFormatter.ofPattern("HH:mm");
        
        while (slotEnd.isBefore(dayEnd) || slotEnd.isEqual(dayEnd)) {
            TimeSlotDTO slot = new TimeSlotDTO();
            slot.setStartTime(slotStart);
            slot.setEndTime(slotEnd);
            slot.setDisplayTime(slotStart.toLocalTime().format(timeFormatter));
            
            // Check if this slot conflicts with existing appointments
            boolean isAvailable = true;
            for (Appointment apt : existingAppointments) {
                LocalDateTime aptStart = apt.getAppointmentDate();
                LocalDateTime aptEnd = aptStart.plusMinutes(apt.getDurationMinutes() != null ? apt.getDurationMinutes() : 30);
                
                // Check for overlap
                if (slotStart.isBefore(aptEnd) && slotEnd.isAfter(aptStart)) {
                    isAvailable = false;
                    break;
                }
            }
            
            // Don't show past slots
            if (slotStart.isBefore(LocalDateTime.now())) {
                isAvailable = false;
            }
            
            slot.setAvailable(isAvailable);
            slots.add(slot);
            
            slotStart = slotStart.plusMinutes(30);
            slotEnd = slotEnd.plusMinutes(30);
        }
        
        return slots;
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


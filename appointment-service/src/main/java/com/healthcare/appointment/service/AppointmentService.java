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
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
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
    
    @Transactional(readOnly = true)
    public List<AppointmentDTO> getAllAppointments() {
        return appointmentRepository.findAll().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Page<AppointmentDTO> getAppointmentsPaged(int page, int size, String sortBy, String direction) {
        Sort sort = "desc".equalsIgnoreCase(direction)
                ? Sort.by(sortBy).descending()
                : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);
        return appointmentRepository.findAll(pageable).map(this::toDTO);
    }
    
    @Transactional(readOnly = true)
    public AppointmentDTO getAppointmentById(Integer id) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Appointment not found with id: " + id));
        return toDTO(appointment);
    }
    
    public AppointmentDTO createAppointment(AppointmentDTO appointmentDTO) {
        Appointment appointment = toEntity(appointmentDTO);
        if (appointment.getStatus() == null) {
            appointment.setStatus(AppointmentStatus.PENDING);
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
    
    @Transactional(readOnly = true)
    public List<AppointmentDTO> getAppointmentsByPatientId(Integer patientId) {
        return appointmentRepository.findByPatientId(patientId)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }
    
    @Transactional(readOnly = true)
    public List<AppointmentDTO> getAppointmentsByDoctorId(Integer doctorId) {
        return appointmentRepository.findByDoctorId(doctorId)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }
    
    @Transactional(readOnly = true)
    public List<AppointmentDTO> getAppointmentsByStatus(String status) {
        return appointmentRepository.findByStatus(status)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }
    
    @Transactional(readOnly = true)
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
    
    @Transactional(readOnly = true)
    public List<AppointmentDetailDTO> getAppointmentDetailsByDoctorId(Integer doctorId) {
        List<Appointment> appointments = appointmentRepository.findByDoctorId(doctorId);

        Map<Integer, Map<String, Object>> patientCache = new HashMap<>();

        return appointments.stream()
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

                    Integer patientId = appointment.getPatientId();
                    if (patientId != null) {
                        Map<String, Object> patient = patientCache.computeIfAbsent(patientId, id -> {
                            try {
                                return patientServiceClient.getPatientById(id);
                            } catch (Exception ignored) {
                                return null;
                            }
                        });

                        if (patient != null) {
                            detailDTO.setPatientName(patient.get("name") + " " + patient.get("surname"));
                            detailDTO.setPatientEmail((String) patient.get("email"));
                        } else {
                            detailDTO.setPatientName("Patient not found");
                            detailDTO.setPatientEmail("N/A");
                        }
                    } else {
                        detailDTO.setPatientName("Patient not found");
                        detailDTO.setPatientEmail("N/A");
                    }

                    detailDTO.setDoctorName("Current Doctor");
                    detailDTO.setDoctorSpecialization("N/A");

                    return detailDTO;
                })
                .collect(Collectors.toList());
    }
    
    @Transactional(readOnly = true)
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
        
        if (request.getNewAppointmentDate().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("New appointment date must be in the future");
        }
        
        appointment.setAppointmentDate(request.getNewAppointmentDate());
        if (request.getDurationMinutes() != null) {
            appointment.setDurationMinutes(request.getDurationMinutes());
        }
        appointment.setStatus(AppointmentStatus.SCHEDULED);
        
        appointment = appointmentRepository.save(appointment);
        return toDTO(appointment);
    }
    
    public AppointmentDTO approveAppointment(Integer id) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Appointment not found with id: " + id));
        
        if (appointment.getStatus() != AppointmentStatus.PENDING) {
            throw new RuntimeException("Only pending appointments can be approved");
        }
        
        appointment.setStatus(AppointmentStatus.SCHEDULED);
        appointment = appointmentRepository.save(appointment);
        return toDTO(appointment);
    }
    
    public AppointmentDTO rejectAppointment(Integer id, String reason) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Appointment not found with id: " + id));
        
        if (appointment.getStatus() != AppointmentStatus.PENDING) {
            throw new RuntimeException("Only pending appointments can be rejected");
        }
        
        appointment.setStatus(AppointmentStatus.REJECTED);
        if (reason != null && !reason.isEmpty()) {
            appointment.setNotes((appointment.getNotes() != null ? appointment.getNotes() + "\n" : "") + "Rejection reason: " + reason);
        }
        appointment = appointmentRepository.save(appointment);
        return toDTO(appointment);
    }
    
    @Transactional(readOnly = true)
    public List<TimeSlotDTO> getAvailableTimeSlots(Integer doctorId, LocalDate date, Integer excludeAppointmentId) {
        Map<String, Object> doctor = doctorServiceClient.getDoctorById(doctorId);
        
        LocalTime startTime = LocalTime.of(9, 0);
        LocalTime endTime = LocalTime.of(17, 0);
        
        try {
            startTime = resolveTime(doctor.get("workingHoursStart"), startTime);
            endTime = resolveTime(doctor.get("workingHoursEnd"), endTime);
        } catch (Exception ignored) {
        }
        
        String workingDays = (String) doctor.get("workingDays");
        if (!isDoctorWorkingOnDate(workingDays, date)) {
            return new ArrayList<>();
        }
        
        LocalDateTime dayStart = LocalDateTime.of(date, startTime);
        LocalDateTime dayEnd = LocalDateTime.of(date, endTime);

        List<Appointment> existingAppointments = appointmentRepository
                .findByDoctorIdAndDateRange(doctorId, dayStart, dayEnd)
                .stream()
                .filter(apt -> !AppointmentStatus.CANCELLED.equals(apt.getStatus())
                        && (excludeAppointmentId == null || !apt.getId().equals(excludeAppointmentId)))
                .collect(Collectors.toList());
        
        List<TimeSlotDTO> slots = new ArrayList<>();
        LocalDateTime slotStart = dayStart;
        LocalDateTime slotEnd = slotStart.plusMinutes(30);
        
        DateTimeFormatter timeFormatter = DateTimeFormatter.ofPattern("HH:mm");
        
        while (slotEnd.isBefore(dayEnd) || slotEnd.isEqual(dayEnd)) {
            TimeSlotDTO slot = new TimeSlotDTO();
            slot.setStartTime(slotStart);
            slot.setEndTime(slotEnd);
            slot.setDisplayTime(slotStart.toLocalTime().format(timeFormatter));
            
            boolean isAvailable = true;
            for (Appointment apt : existingAppointments) {
                LocalDateTime aptStart = apt.getAppointmentDate();
                LocalDateTime aptEnd = aptStart.plusMinutes(apt.getDurationMinutes() != null ? apt.getDurationMinutes() : 30);
                
                if (slotStart.isBefore(aptEnd) && slotEnd.isAfter(aptStart)) {
                    isAvailable = false;
                    break;
                }
            }
            
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

    @SuppressWarnings("unchecked")
    private LocalTime resolveTime(Object raw, LocalTime defaultTime) {
        if (raw == null) {
            return defaultTime;
        }
        if (raw instanceof String) {
            return LocalTime.parse((String) raw);
        }
        if (raw instanceof Map) {
            Map<String, Object> timeMap = (Map<String, Object>) raw;
            Integer hour = (Integer) timeMap.get("hour");
            Integer minute = (Integer) timeMap.get("minute");
            if (hour != null && minute != null) {
                return LocalTime.of(hour, minute);
            }
        }
        return defaultTime;
    }

    private boolean isDoctorWorkingOnDate(String workingDays, LocalDate date) {
        if (workingDays == null || workingDays.isEmpty()) {
            return true;
        }

        DayOfWeek dayOfWeek = date.getDayOfWeek();
        String dayName = dayOfWeek.name();

        List<String> days = new ArrayList<>();
        String[] parts = workingDays.split(",");
        for (String part : parts) {
            String trimmed = part.trim().toUpperCase();
            if (trimmed.equals("MON-FRI") || trimmed.equals("MONDAY-FRIDAY")) {
                days.addAll(Arrays.asList("MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"));
                continue;
            }
            days.add(trimmed);
        }

        return days.contains(dayName);
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


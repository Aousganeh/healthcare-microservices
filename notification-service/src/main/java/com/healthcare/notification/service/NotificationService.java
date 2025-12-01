package com.healthcare.notification.service;

import com.healthcare.notification.event.AppointmentEvent;
import com.healthcare.notification.model.Notification;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.concurrent.atomic.AtomicLong;
import java.util.stream.Collectors;

@Service
public class NotificationService {

    private final List<Notification> notifications = Collections.synchronizedList(new ArrayList<>());
    private final AtomicLong idGenerator = new AtomicLong(1);

    public void createFromAppointmentEvent(AppointmentEvent event) {
        if (event == null) {
            return;
        }
        Notification notification = new Notification();
        notification.setId(idGenerator.getAndIncrement());
        notification.setPatientId(event.getPatientId());
        notification.setDoctorId(event.getDoctorId());
        notification.setType(event.getType());
        notification.setMessage(buildMessage(event));
        notification.setCreatedAt(LocalDateTime.now());
        notification.setRead(false);
        notifications.add(notification);
    }

    public List<Notification> getByPatient(Integer patientId) {
        if (patientId == null) {
            return List.of();
        }
        return notifications.stream()
                .filter(n -> patientId.equals(n.getPatientId()))
                .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
                .collect(Collectors.toList());
    }

    public List<Notification> getByDoctor(Integer doctorId) {
        if (doctorId == null) {
            return List.of();
        }
        return notifications.stream()
                .filter(n -> doctorId.equals(n.getDoctorId()))
                .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
                .collect(Collectors.toList());
    }

    public void markAsRead(Long id) {
        if (id == null) {
            return;
        }
        notifications.stream()
                .filter(n -> id.equals(n.getId()))
                .findFirst()
                .ifPresent(n -> n.setRead(true));
    }

    private String buildMessage(AppointmentEvent event) {
        String base = "Appointment on " + event.getAppointmentDate();
        String type = event.getType();
        if ("CREATED".equalsIgnoreCase(type)) {
            return base + " has been created.";
        }
        if ("APPROVED".equalsIgnoreCase(type)) {
            return base + " has been approved.";
        }
        if ("REJECTED".equalsIgnoreCase(type)) {
            return base + " has been rejected.";
        }
        if ("RESCHEDULED".equalsIgnoreCase(type)) {
            return base + " has been rescheduled.";
        }
        return base;
    }
}



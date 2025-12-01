package com.healthcare.notification.controller;

import com.healthcare.notification.model.Notification;
import com.healthcare.notification.service.NotificationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/notifications")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @GetMapping("/patient/{patientId}")
    public ResponseEntity<List<Notification>> getPatientNotifications(@PathVariable Integer patientId) {
        return ResponseEntity.ok(notificationService.getByPatient(patientId));
    }

    @GetMapping("/doctor/{doctorId}")
    public ResponseEntity<List<Notification>> getDoctorNotifications(@PathVariable Integer doctorId) {
        return ResponseEntity.ok(notificationService.getByDoctor(doctorId));
    }

    @PatchMapping("/{id}/read")
    public ResponseEntity<Void> markNotificationRead(@PathVariable Long id) {
        notificationService.markAsRead(id);
        return ResponseEntity.noContent().build();
    }
}


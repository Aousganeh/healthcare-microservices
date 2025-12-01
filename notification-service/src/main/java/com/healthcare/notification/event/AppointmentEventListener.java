package com.healthcare.notification.event;

import com.healthcare.notification.service.NotificationService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Component
public class AppointmentEventListener {

    private static final Logger log = LoggerFactory.getLogger(AppointmentEventListener.class);

    private final NotificationService notificationService;

    public AppointmentEventListener(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @KafkaListener(topics = "${app.kafka.topics.appointments:appointments-events}")
    public void handleAppointmentEvent(AppointmentEvent event) {
        if (event == null) {
            return;
        }

        log.info("Received appointment event type={} id={} patientId={} doctorId={} date={}",
                event.getType(), event.getId(), event.getPatientId(), event.getDoctorId(), event.getAppointmentDate());

        notificationService.createFromAppointmentEvent(event);
    }
}



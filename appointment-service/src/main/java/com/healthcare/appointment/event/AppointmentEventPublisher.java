package com.healthcare.appointment.event;

import com.healthcare.appointment.entity.Appointment;
import com.healthcare.appointment.enums.AppointmentStatus;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

@Component
public class AppointmentEventPublisher {

    private final KafkaTemplate<String, AppointmentEvent> kafkaTemplate;
    private final String topic;

    public AppointmentEventPublisher(
            KafkaTemplate<String, AppointmentEvent> kafkaTemplate,
            @Value("${app.kafka.topics.appointments:appointments-events}") String topic) {
        this.kafkaTemplate = kafkaTemplate;
        this.topic = topic;
    }

    public void publishCreated(Appointment appointment) {
        publish(appointment, "CREATED");
    }

    public void publishApproved(Appointment appointment) {
        publish(appointment, "APPROVED");
    }

    public void publishRejected(Appointment appointment) {
        publish(appointment, "REJECTED");
    }

    public void publishRescheduled(Appointment appointment) {
        publish(appointment, "RESCHEDULED");
    }

    private void publish(Appointment appointment, String type) {
        if (appointment == null) {
            return;
        }
        AppointmentEvent event = new AppointmentEvent();
        event.setId(appointment.getId());
        event.setPatientId(appointment.getPatientId());
        event.setDoctorId(appointment.getDoctorId());
        event.setAppointmentDate(appointment.getAppointmentDate());
        event.setDurationMinutes(appointment.getDurationMinutes());
        event.setStatus(appointment.getStatus() != null ? appointment.getStatus() : AppointmentStatus.PENDING);
        event.setType(type);

        String key = appointment.getId() != null ? appointment.getId().toString() : type;
        kafkaTemplate.send(topic, key, event);
    }
}



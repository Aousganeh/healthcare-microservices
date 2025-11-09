package com.healthcare.appointment.feign;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.Map;

@FeignClient(name = "doctor-service")
public interface DoctorServiceClient {
    @GetMapping("/doctors/{id}")
    Map<String, Object> getDoctorById(@PathVariable Integer id);
}


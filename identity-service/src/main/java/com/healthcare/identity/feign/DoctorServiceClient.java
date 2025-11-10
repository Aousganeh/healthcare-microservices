package com.healthcare.identity.feign;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.Map;

@FeignClient(name = "doctor-service")
public interface DoctorServiceClient {
    @GetMapping("/doctors/email/{email}")
    Map<String, Object> getDoctorByEmail(@PathVariable String email);
}


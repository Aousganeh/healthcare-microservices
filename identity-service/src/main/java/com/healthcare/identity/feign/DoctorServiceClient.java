package com.healthcare.identity.feign;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.DeleteMapping;

import java.util.Map;

@FeignClient(name = "doctor-service")
public interface DoctorServiceClient {
    @GetMapping("/doctors/email/{email}")
    Map<String, Object> getDoctorByEmail(@PathVariable String email);
    
    @PostMapping("/doctors")
    Map<String, Object> createDoctor(@RequestBody Map<String, Object> doctorDTO);

    @DeleteMapping("/doctors/{id}")
    void deleteDoctor(@PathVariable Integer id);
}


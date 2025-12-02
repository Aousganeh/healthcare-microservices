package com.healthcare.identity.feign;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@FeignClient(name = "doctor-service")
public interface DoctorServiceClient {
    @GetMapping("/doctors/email/{email}")
    Map<String, Object> getDoctorByEmail(@PathVariable String email,
                                         @RequestParam(value = "includeInactive", defaultValue = "false") boolean includeInactive);
    
    @PostMapping("/doctors")
    Map<String, Object> createDoctor(@RequestBody Map<String, Object> doctorDTO);

    @DeleteMapping("/doctors/{id}")
    void deleteDoctor(@PathVariable Integer id);
    
    @PatchMapping("/doctors/email/{email}/status")
    void updateDoctorStatus(@PathVariable String email, @RequestParam("active") boolean active);
}


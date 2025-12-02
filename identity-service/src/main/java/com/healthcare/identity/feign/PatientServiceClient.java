package com.healthcare.identity.feign;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@FeignClient(name = "patient-service")
public interface PatientServiceClient {
    @GetMapping("/patients/email/{email}")
    Map<String, Object> getPatientByEmail(@PathVariable String email,
                                          @RequestParam(value = "includeInactive", defaultValue = "false") boolean includeInactive);
    
    @GetMapping("/patients/serial/{serialNumber}")
    Map<String, Object> getPatientBySerialNumber(@PathVariable String serialNumber);

    @PostMapping("/patients")
    Map<String, Object> createPatient(@RequestBody Map<String, Object> patientDTO);
    
    @PatchMapping("/patients/email/{email}/status")
    void updatePatientStatus(@PathVariable String email, @RequestParam("active") boolean active);
}


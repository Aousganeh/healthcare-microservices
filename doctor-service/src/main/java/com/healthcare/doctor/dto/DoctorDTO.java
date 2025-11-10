package com.healthcare.doctor.dto;

import com.healthcare.doctor.enums.DutyStatus;
import com.healthcare.doctor.enums.Gender;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DoctorDTO {
    private Integer id;
    
    @NotBlank(message = "Name is required")
    private String name;
    
    @NotBlank(message = "Surname is required")
    private String surname;
    
    private LocalDate dateOfBirth;
    
    private Gender gender;
    
    @Email(message = "Invalid email format")
    private String email;
    
    private String phoneNumber;
    
    @NotBlank(message = "License number is required")
    private String licenseNumber;
    
    @NotNull(message = "Specialization is required")
    private Integer specializationId;
    
    private String specializationName;
    
    private String department;
    
    private DutyStatus dutyStatus;
    
    private Integer yearsOfExperience;
    
    private String qualifications;
    
    private LocalTime workingHoursStart;
    
    private LocalTime workingHoursEnd;
    
    private String workingDays;
    
    private String photoUrl;
}


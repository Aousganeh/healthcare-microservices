package com.healthcare.patient.dto;

import com.healthcare.patient.enums.BloodGroup;
import com.healthcare.patient.enums.Gender;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PatientDTO {
    private Integer id;
    
    @NotBlank(message = "Name is required")
    private String name;
    
    @NotBlank(message = "Surname is required")
    private String surname;
    
    @NotNull(message = "Date of birth is required")
    private LocalDate dateOfBirth;
    
    @NotNull(message = "Gender is required")
    private Gender gender;
    
    @Email(message = "Invalid email format")
    private String email;
    
    private String phoneNumber;
    
    private String serialNumber;
    
    private String registrationAddress;
    
    private String currentAddress;
    
    private BloodGroup bloodGroup;
    
    private Integer roomId;

    private Boolean active;
}


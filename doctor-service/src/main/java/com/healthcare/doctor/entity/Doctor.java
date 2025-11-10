package com.healthcare.doctor.entity;

import com.healthcare.doctor.enums.DutyStatus;
import com.healthcare.doctor.enums.Gender;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalTime;

@Entity
@Table(name = "doctors")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Doctor extends BaseAuditableEntity {
    private String name;
    private String surname;
    
    @Column(name = "date_of_birth")
    private LocalDate dateOfBirth;
    
    @Enumerated(EnumType.STRING)
    private Gender gender;
    
    private String email;
    
    @Column(name = "phone_number")
    private String phoneNumber;
    
    @Column(name = "license_number", unique = true)
    private String licenseNumber;
    
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "specialization_id", nullable = false)
    private Specialization specialization;
    
    @Column(name = "department")
    private String department;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "duty_status")
    private DutyStatus dutyStatus;
    
    @Column(name = "years_of_experience")
    private Integer yearsOfExperience;
    
    @Column(columnDefinition = "TEXT")
    private String qualifications;
    
    @Column(name = "working_hours_start")
    private LocalTime workingHoursStart;
    
    @Column(name = "working_hours_end")
    private LocalTime workingHoursEnd;
    
    @Column(name = "working_days", length = 100)
    private String workingDays;

    @Column(name = "photo_url", columnDefinition = "TEXT")
    private String photoUrl;
}


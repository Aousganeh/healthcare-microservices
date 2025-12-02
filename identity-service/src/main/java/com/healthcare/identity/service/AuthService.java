package com.healthcare.identity.service;

import com.healthcare.identity.dto.AuthResponse;
import com.healthcare.identity.dto.LoginRequest;
import com.healthcare.identity.dto.RegisterRequest;
import com.healthcare.identity.entity.Role;
import com.healthcare.identity.entity.User;
import com.healthcare.identity.feign.PatientServiceClient;
import com.healthcare.identity.feign.DoctorServiceClient;
import com.healthcare.identity.repository.RoleRepository;
import com.healthcare.identity.repository.UserRepository;
import com.healthcare.identity.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AuthService {
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;
    private final PatientServiceClient patientServiceClient;
    private final DoctorServiceClient doctorServiceClient;
    private final RefreshTokenService refreshTokenService;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already exists");
        }

        User user = new User();
        user.setUsername(request.getEmail());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());

        Role patientRole = roleRepository.findByName("ROLE_PATIENT")
                .orElseGet(() -> {
                    Role role = new Role();
                    role.setName("ROLE_PATIENT");
                    return roleRepository.save(role);
                });
        user.getRoles().add(patientRole);

        user = userRepository.save(user);
        
        // Automatically create a basic patient profile on registration
        createPatientProfileIfNotExists(user);
        
        return generateAuthResponse(user, null);
    }

    public AuthResponse login(LoginRequest request) {
        String loginIdentifier = request.getUsername();
        User user = null;
        String emailForAuth = null;
        boolean isDoctor = false;
        
        user = userRepository.findByEmail(loginIdentifier)
                .orElse(null);
        
        if (user != null) {
            emailForAuth = user.getEmail();
        } else {
            try {
                Map<String, Object> patient = patientServiceClient.getPatientBySerialNumber(loginIdentifier);
                String patientEmail = (String) patient.get("email");
                if (patientEmail != null) {
                    user = userRepository.findByEmail(patientEmail)
                            .orElse(null);
                    if (user != null) {
                        emailForAuth = user.getEmail();
                    }
                }
            } catch (Exception e) {
            }
            
            if (user == null) {
                try {
                Map<String, Object> doctor = doctorServiceClient.getDoctorByEmail(loginIdentifier, false);
                    String doctorEmail = (String) doctor.get("email");
                    if (doctorEmail != null) {
                        user = userRepository.findByEmail(doctorEmail)
                                .orElse(null);
                        if (user != null) {
                            emailForAuth = user.getEmail();
                        } else {
                            isDoctor = true;
                            emailForAuth = doctorEmail;
                        }
                    }
                } catch (Exception e) {
                }
            }
        }
        
        if (user == null && isDoctor) {
            throw new UsernameNotFoundException("Doctor account not registered. Please register first with email: " + emailForAuth);
        }
        
        if (user == null || emailForAuth == null) {
            throw new UsernameNotFoundException("User not found with email or fincode: " + loginIdentifier);
        }
        
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(emailForAuth, request.getPassword())
        );

        return generateAuthResponse(user, null);
    }
    
    @Transactional
    public AuthResponse registerDoctor(String email, String password, String firstName, String lastName) {
        if (userRepository.existsByEmail(email)) {
            throw new RuntimeException("Email already exists");
        }

        User user = new User();
        user.setUsername(email);
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(password));
        user.setFirstName(firstName);
        user.setLastName(lastName);

        Role doctorRole = roleRepository.findByName("ROLE_DOCTOR")
                .orElseGet(() -> {
                    Role role = new Role();
                    role.setName("ROLE_DOCTOR");
                    return roleRepository.save(role);
                });
        user.getRoles().add(doctorRole);

        user = userRepository.save(user);
        return generateAuthResponse(user, null);
    }
    
    @Transactional
    public User updateUserRole(String email, String roleName) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found with email: " + email));
        
        Role role = roleRepository.findByName(roleName)
                .orElseGet(() -> {
                    Role newRole = new Role();
                    newRole.setName(roleName);
                    return roleRepository.save(newRole);
                });
        
        user.getRoles().clear();
        user.getRoles().add(role);
        
        user = userRepository.save(user);
        
        if ("ROLE_DOCTOR".equals(roleName)) {
            createDoctorProfileIfNotExists(user);
            setPatientProfileActive(user, false);
        } else if ("ROLE_PATIENT".equals(roleName)) {
            createPatientProfileIfNotExists(user);
            setDoctorProfileActive(user, false);
        } else {
            setDoctorProfileActive(user, false);
            setPatientProfileActive(user, false);
        }
        
        return user;
    }
    
    @Transactional
    public User addRoleToUser(String email, String roleName) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found with email: " + email));
        
        Role role = roleRepository.findByName(roleName)
                .orElseGet(() -> {
                    Role newRole = new Role();
                    newRole.setName(roleName);
                    return roleRepository.save(newRole);
                });
        
        if (!user.getRoles().contains(role)) {
            user.getRoles().add(role);
        }
        
        user = userRepository.save(user);
        
        if ("ROLE_DOCTOR".equals(roleName)) {
            createDoctorProfileIfNotExists(user);
        } else if ("ROLE_PATIENT".equals(roleName)) {
            createPatientProfileIfNotExists(user);
        }
        
        return user;
    }
    
    private void createDoctorProfileIfNotExists(User user) {
        try {
            doctorServiceClient.getDoctorByEmail(user.getEmail(), true);
            doctorServiceClient.updateDoctorStatus(user.getEmail(), true);
            return;
        } catch (Exception ignored) {
        }
        
        Map<String, Object> doctorDTO = new java.util.HashMap<>();
        doctorDTO.put("name", user.getFirstName() != null ? user.getFirstName() : "");
        doctorDTO.put("surname", user.getLastName() != null ? user.getLastName() : "");
        doctorDTO.put("email", user.getEmail());
        doctorDTO.put("licenseNumber", "LIC-" + System.currentTimeMillis());
        doctorDTO.put("specializationId", 0);
        doctorDTO.put("dutyStatus", "ON_DUTY");
        doctorDTO.put("workingHoursStart", "09:00");
        doctorDTO.put("workingHoursEnd", "17:00");
        doctorDTO.put("workingDays", "MONDAY,TUESDAY,WEDNESDAY,THURSDAY,FRIDAY");
        doctorDTO.put("gender", "MALE");
        doctorDTO.put("dateOfBirth", "1980-01-01");
        
        try {
            doctorServiceClient.createDoctor(doctorDTO);
        } catch (Exception ex) {
            throw new RuntimeException("Failed to create doctor profile: " + ex.getMessage());
        }
    }

    private void createPatientProfileIfNotExists(User user) {
        try {
            patientServiceClient.getPatientByEmail(user.getEmail(), true);
            patientServiceClient.updatePatientStatus(user.getEmail(), true);
            return;
        } catch (Exception ignored) {
        }
        
        Map<String, Object> patientDTO = new java.util.HashMap<>();
        patientDTO.put("name", user.getFirstName() != null ? user.getFirstName() : ""); 
        patientDTO.put("surname", user.getLastName() != null ? user.getLastName() : "");
        patientDTO.put("email", user.getEmail());
        patientDTO.put("dateOfBirth", "1990-01-01");
        patientDTO.put("gender", "MALE");
        try {
            patientServiceClient.createPatient(patientDTO);
        } catch (Exception ex) {
            throw new RuntimeException("Failed to create patient profile: " + ex.getMessage());
        }
    }
    
    private void setDoctorProfileActive(User user, boolean active) {
        try {
            doctorServiceClient.updateDoctorStatus(user.getEmail(), active);
        } catch (Exception ignored) {
        }
    }
    
    private void setPatientProfileActive(User user, boolean active) {
        try {
            patientServiceClient.updatePatientStatus(user.getEmail(), active);
        } catch (Exception ignored) {
        }
    }
    
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    private AuthResponse generateAuthResponse(User user, String refreshTokenOverride) {
        String token = jwtUtil.generateToken(user);
        String refreshToken;
        if (refreshTokenOverride != null) {
            refreshToken = refreshTokenOverride;
        } else {
            try {
                refreshToken = refreshTokenService.issue(String.valueOf(user.getId()), null, null);
            } catch (Exception ex) {
                refreshToken = null;
            }
        }
        Set<String> roles = user.getRoles().stream()
                .map(Role::getName)
                .collect(Collectors.toSet());

        return new AuthResponse(token, "Bearer", refreshToken, user.getUsername(), user.getEmail(), user.getFirstName(), user.getLastName(), roles);
    }

    public User findUserById(Integer id) {
        return userRepository.findById(id).orElse(null);
    }

    public AuthResponse privateGenerateForExistingUser(User user, String refreshTokenOverride) {
        return generateAuthResponse(user, refreshTokenOverride);
    }
}



package com.healthcare.identity.service;

import com.healthcare.identity.dto.AuthResponse;
import com.healthcare.identity.dto.LoginRequest;
import com.healthcare.identity.dto.RegisterRequest;
import com.healthcare.identity.entity.Role;
import com.healthcare.identity.entity.User;
import com.healthcare.identity.feign.PatientServiceClient;
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

        Role userRole = roleRepository.findByName("ROLE_USER")
                .orElseGet(() -> {
                    Role role = new Role();
                    role.setName("ROLE_USER");
                    return roleRepository.save(role);
                });
        user.getRoles().add(userRole);

        user = userRepository.save(user);
        return generateAuthResponse(user);
    }

    public AuthResponse login(LoginRequest request) {
        String loginIdentifier = request.getUsername();
        User user = null;
        String emailForAuth = null;
        
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
        }
        
        if (user == null || emailForAuth == null) {
            throw new UsernameNotFoundException("User not found with email or fincode: " + loginIdentifier);
        }
        
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(emailForAuth, request.getPassword())
        );

        return generateAuthResponse(user);
    }

    private AuthResponse generateAuthResponse(User user) {
        String token = jwtUtil.generateToken(user);
        Set<String> roles = user.getRoles().stream()
                .map(Role::getName)
                .collect(Collectors.toSet());

        return new AuthResponse(token, "Bearer", user.getUsername(), user.getEmail(), roles);
    }
}



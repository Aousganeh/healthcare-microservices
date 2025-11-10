package com.healthcare.identity.controller;

import com.healthcare.identity.dto.AuthResponse;
import com.healthcare.identity.dto.LoginRequest;
import com.healthcare.identity.dto.RegisterRequest;
import com.healthcare.identity.entity.User;
import com.healthcare.identity.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication", description = "Authentication and Authorization APIs")
public class AuthController {
    private final AuthService authService;

    @Operation(summary = "Register a new user", description = "Creates a new user account and returns JWT token")
    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.ok(authService.register(request));
    }

    @Operation(summary = "Login user", description = "Authenticates user and returns JWT token")
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }
    
    @Operation(summary = "Register doctor", description = "Creates a doctor user account and returns JWT token")
    @PostMapping("/register/doctor")
    public ResponseEntity<AuthResponse> registerDoctor(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String password = request.get("password");
        String firstName = request.get("firstName");
        String lastName = request.get("lastName");
        return ResponseEntity.ok(authService.registerDoctor(email, password, firstName, lastName));
    }
    
    @Operation(summary = "Update user role", description = "Updates a user's role (Admin only)")
    @PutMapping("/users/{email}/role")
    public ResponseEntity<Map<String, Object>> updateUserRole(
            @PathVariable String email,
            @RequestBody Map<String, String> request) {
        String roleName = request.get("role");
        User user = authService.updateUserRole(email, roleName);
        return ResponseEntity.ok(Map.of(
            "email", user.getEmail(),
            "roles", user.getRoles().stream().map(role -> role.getName()).toList()
        ));
    }
    
    @Operation(summary = "Add role to user", description = "Adds a role to a user without removing existing roles (Admin only)")
    @PostMapping("/users/{email}/role")
    public ResponseEntity<Map<String, Object>> addRoleToUser(
            @PathVariable String email,
            @RequestBody Map<String, String> request) {
        String roleName = request.get("role");
        User user = authService.addRoleToUser(email, roleName);
        return ResponseEntity.ok(Map.of(
            "email", user.getEmail(),
            "roles", user.getRoles().stream().map(role -> role.getName()).toList()
        ));
    }
    
    @Operation(summary = "Get all users", description = "Retrieves all users (Admin only)")
    @GetMapping("/users")
    public ResponseEntity<List<Map<String, Object>>> getAllUsers() {
        List<Map<String, Object>> users = authService.getAllUsers().stream()
                .map(user -> Map.of(
                    "id", user.getId(),
                    "username", user.getUsername(),
                    "email", user.getEmail(),
                    "firstName", user.getFirstName() != null ? user.getFirstName() : "",
                    "lastName", user.getLastName() != null ? user.getLastName() : "",
                    "roles", user.getRoles().stream().map(role -> role.getName()).collect(Collectors.toList())
                ))
                .collect(Collectors.toList());
        return ResponseEntity.ok(users);
    }
}



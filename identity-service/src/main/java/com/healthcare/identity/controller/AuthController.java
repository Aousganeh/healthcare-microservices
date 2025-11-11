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

import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import com.healthcare.identity.service.RefreshTokenService;
import org.springframework.http.HttpStatus;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication", description = "Authentication and Authorization APIs")
public class AuthController {
    private final AuthService authService;
    private final RefreshTokenService refreshTokenService;

    @Operation(summary = "Register a new user", description = "Creates a new user account and returns JWT token")
    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request, HttpServletResponse httpResponse) {
        AuthResponse resp = authService.register(request);
        ResponseCookie cookie = buildRefreshCookie(resp.getRefreshToken());
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, cookie.toString())
                .body(resp);
    }

    @Operation(summary = "Login user", description = "Authenticates user and returns JWT token")
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse resp = authService.login(request);
        ResponseCookie cookie = buildRefreshCookie(resp.getRefreshToken());
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, cookie.toString())
                .body(resp);
    }
    
    @Operation(summary = "Register doctor", description = "Creates a doctor user account and returns JWT token")
    @PostMapping("/register/doctor")
    public ResponseEntity<AuthResponse> registerDoctor(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String password = request.get("password");
        String firstName = request.get("firstName");
        String lastName = request.get("lastName");
        AuthResponse resp = authService.registerDoctor(email, password, firstName, lastName);
        ResponseCookie cookie = buildRefreshCookie(resp.getRefreshToken());
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, cookie.toString())
                .body(resp);
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

    @Operation(summary = "Refresh access token", description = "Rotates refresh token and returns a new access token")
    @PostMapping("/refresh")
    public ResponseEntity<AuthResponse> refresh(@CookieValue(value = "refresh_token", required = false) String cookieToken,
                                                @RequestBody(required = false) Map<String, String> body) {
        String raw = cookieToken;
        if ((raw == null || raw.isBlank()) && body != null) raw = body.get("refreshToken");
        if (raw == null || raw.isBlank()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        String userId = refreshTokenService.getUserIdIfValid(raw);
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        String rotated = refreshTokenService.rotate(raw, null, null);
        if (rotated == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        User user = authService.findUserById(Integer.valueOf(userId));
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        AuthResponse resp = authService.privateGenerateForExistingUser(user, rotated);
        ResponseCookie cookie = buildRefreshCookie(resp.getRefreshToken());
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, cookie.toString())
                .body(resp);
    }

    @Operation(summary = "Logout", description = "Revokes refresh token and clears cookie")
    @PostMapping("/logout")
    public ResponseEntity<Void> logout(@CookieValue(value = "refresh_token", required = false) String cookieToken) {
        if (cookieToken != null && !cookieToken.isBlank()) {
            refreshTokenService.revoke(cookieToken);
        }
        ResponseCookie cleared = ResponseCookie.from("refresh_token", "")
                .httpOnly(true)
                .secure(true)
                .sameSite("Strict")
                .path("/")
                .maxAge(0)
                .build();
        return ResponseEntity.noContent()
                .header(HttpHeaders.SET_COOKIE, cleared.toString())
                .build();
    }

    private ResponseCookie buildRefreshCookie(String value) {
        return ResponseCookie.from("refresh_token", value)
                .httpOnly(true)
                .secure(true)
                .sameSite("Strict")
                .path("/")
                .maxAge(60L * 60 * 24 * 30)
                .build();
    }
}



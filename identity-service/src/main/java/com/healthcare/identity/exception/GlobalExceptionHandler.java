package com.healthcare.identity.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.stream.Collectors;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidationExceptions(MethodArgumentNotValidException ex) {
        Map<String, Object> error = new HashMap<>();
        error.put("timestamp", LocalDateTime.now());
        error.put("status", HttpStatus.BAD_REQUEST.value());
        error.put("error", "Validation Failed");
        error.put("path", "/auth");
        
        Map<String, String> fieldErrors = ex.getBindingResult().getFieldErrors().stream()
                .collect(Collectors.toMap(
                        FieldError::getField,
                        fieldError -> fieldError.getDefaultMessage() != null ? fieldError.getDefaultMessage() : "Invalid value",
                        (existing, replacement) -> existing
                ));
        
        error.put("fieldErrors", fieldErrors);
        error.put("message", "Validation failed for " + fieldErrors.size() + " field(s): " + String.join(", ", fieldErrors.keySet()));
        
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
    }

    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<Map<String, Object>> handleBadCredentialsException(BadCredentialsException ex) {
        Map<String, Object> error = new HashMap<>();
        error.put("timestamp", LocalDateTime.now());
        error.put("status", HttpStatus.UNAUTHORIZED.value());
        error.put("error", "Unauthorized");
        error.put("message", "Invalid username or password");
        error.put("path", "/auth/login");
        error.put("exception", ex.getClass().getSimpleName());
        
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, Object>> handleIllegalArgumentException(IllegalArgumentException ex) {
        Map<String, Object> error = new HashMap<>();
        error.put("timestamp", LocalDateTime.now());
        error.put("status", HttpStatus.BAD_REQUEST.value());
        error.put("error", "Bad Request");
        error.put("message", ex.getMessage());
        error.put("path", "/auth");
        error.put("exception", ex.getClass().getSimpleName());
        
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
    }

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<Map<String, Object>> handleRuntimeException(RuntimeException ex) {
        HttpStatus status = HttpStatus.INTERNAL_SERVER_ERROR;
        String errorType = "Internal Server Error";
        
        if (ex.getMessage() != null && (
            ex.getMessage().contains("not found") ||
            ex.getMessage().contains("does not exist") ||
            ex.getMessage().contains("User not found")
        )) {
            status = HttpStatus.NOT_FOUND;
            errorType = "Not Found";
        } else if (ex.getMessage() != null && (
            ex.getMessage().contains("already exists") ||
            ex.getMessage().contains("duplicate") ||
            ex.getMessage().contains("Username already exists") ||
            ex.getMessage().contains("Email already exists")
        )) {
            status = HttpStatus.CONFLICT;
            errorType = "Conflict";
        } else if (ex.getMessage() != null && (
            ex.getMessage().contains("invalid") ||
            ex.getMessage().contains("required") ||
            ex.getMessage().contains("cannot")
        )) {
            status = HttpStatus.BAD_REQUEST;
            errorType = "Bad Request";
        }
        
        Map<String, Object> error = new HashMap<>();
        error.put("timestamp", LocalDateTime.now());
        error.put("status", status.value());
        error.put("error", errorType);
        error.put("message", ex.getMessage());
        error.put("path", "/auth");
        error.put("exception", ex.getClass().getSimpleName());
        
        return ResponseEntity.status(status).body(error);
    }
}


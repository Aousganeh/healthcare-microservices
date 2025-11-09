package com.healthcare.patient.exception;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.dao.DataAccessException;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.validation.FieldError;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.servlet.NoHandlerFoundException;

import java.time.OffsetDateTime;
import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiError> handleValidation(MethodArgumentNotValidException ex, HttpServletRequest req) {
        Map<String, String> fields = new HashMap<>();
        String generalMessage = "One or more fields are invalid.";

        for (FieldError fe : ex.getBindingResult().getFieldErrors()) {
            String fieldName = fe.getField();
            String errorMessage = fe.getDefaultMessage();
            fields.put(fieldName, errorMessage != null ? errorMessage : "Invalid value");
        }

        return build(HttpStatus.BAD_REQUEST, "FIELD_VALIDATION_ERROR", generalMessage, req, fields);
    }

    @ExceptionHandler({HttpMessageNotReadableException.class, MissingServletRequestParameterException.class, IllegalArgumentException.class})
    public ResponseEntity<ApiError> handleBadRequest(Exception ex, HttpServletRequest req) {
        Map<String, String> fields = new HashMap<>();
        String message = "Request format is invalid.";
        if (ex.getMessage() != null) {
            message = ex.getMessage();
        }
        fields.put("request", message);
        return build(HttpStatus.BAD_REQUEST, "MALFORMED_REQUEST", message, req, fields);
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ApiError> handleDataIntegrityViolation(DataIntegrityViolationException ex, HttpServletRequest req) {
        Map<String, String> fields = new HashMap<>();
        String detailedMessage = "Database constraint violation occurred.";
        String rootCause = ex.getRootCause() != null ? ex.getRootCause().getMessage() : ex.getMessage();

        if (rootCause != null) {
            if (rootCause.contains("foreign key") || rootCause.contains("FOREIGN KEY")) {
                detailedMessage = "This operation cannot be performed because related data exists. Please delete related data first.";
                fields.put("constraint", "foreign_key_violation");
            } else if (rootCause.contains("unique") || rootCause.contains("UNIQUE")) {
                detailedMessage = "This data already exists. Unique constraint violated.";
                fields.put("constraint", "unique_constraint_violation");
            } else if (rootCause.contains("not null") || rootCause.contains("NOT NULL")) {
                detailedMessage = "Required fields cannot be empty.";
                fields.put("constraint", "not_null_violation");
            } else if (rootCause.contains("check") || rootCause.contains("CHECK")) {
                detailedMessage = "Data values do not meet constraints.";
                fields.put("constraint", "check_constraint_violation");
            }
        }

        fields.put("database", detailedMessage);
        fields.put("rootCause", rootCause != null ? rootCause : "Unknown constraint violation");

        return build(HttpStatus.CONFLICT, "DATA_INTEGRITY_VIOLATION", detailedMessage, req, fields);
    }

    @ExceptionHandler(EmptyResultDataAccessException.class)
    public ResponseEntity<ApiError> handleEmptyResult(EmptyResultDataAccessException ex, HttpServletRequest req) {
        Map<String, String> fields = new HashMap<>();
        fields.put("resource", "Requested data not found.");
        return build(HttpStatus.NOT_FOUND, "EMPTY_RESULT", "Requested data not found.", req, fields);
    }

    @ExceptionHandler(DataAccessException.class)
    public ResponseEntity<ApiError> handleDataAccess(DataAccessException ex, HttpServletRequest req) {
        Map<String, String> fields = new HashMap<>();
        fields.put("database", "Database operation error occurred.");
        return build(HttpStatus.INTERNAL_SERVER_ERROR, "DATABASE_ERROR", "Database operation error occurred.", req, fields);
    }

    @ExceptionHandler(HttpRequestMethodNotSupportedException.class)
    public ResponseEntity<ApiError> handleMethodNotSupported(HttpRequestMethodNotSupportedException ex, HttpServletRequest req) {
        Map<String, String> fields = new HashMap<>();
        fields.put("method", "HTTP method not supported: " + ex.getMethod());
        return build(HttpStatus.METHOD_NOT_ALLOWED, "METHOD_NOT_ALLOWED", "HTTP method not supported.", req, fields);
    }

    @ExceptionHandler(NoHandlerFoundException.class)
    public ResponseEntity<ApiError> handleNoHandlerFound(NoHandlerFoundException ex, HttpServletRequest req) {
        Map<String, String> fields = new HashMap<>();
        fields.put("path", "Endpoint not found: " + ex.getRequestURL());
        return build(HttpStatus.NOT_FOUND, "ENDPOINT_NOT_FOUND", "Endpoint not found.", req, fields);
    }

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<ApiError> handleRuntimeException(RuntimeException ex, HttpServletRequest req) {
        Map<String, String> fields = new HashMap<>();
        HttpStatus status = HttpStatus.INTERNAL_SERVER_ERROR;
        String code = "RUNTIME_ERROR";
        String message = ex.getMessage() != null ? ex.getMessage() : "An unexpected error occurred.";

        if (ex.getMessage() != null) {
            if (ex.getMessage().contains("not found") || ex.getMessage().contains("does not exist")) {
                status = HttpStatus.NOT_FOUND;
                code = "RESOURCE_NOT_FOUND";
            } else if (ex.getMessage().contains("already exists") || ex.getMessage().contains("duplicate")) {
                status = HttpStatus.CONFLICT;
                code = "RESOURCE_ALREADY_EXISTS";
            } else if (ex.getMessage().contains("invalid") || ex.getMessage().contains("required") || ex.getMessage().contains("cannot")) {
                status = HttpStatus.BAD_REQUEST;
                code = "BAD_REQUEST";
            }
        }

        fields.put("error", message);
        return build(status, code, message, req, fields);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiError> handleGeneric(Exception ex, HttpServletRequest req) {
        Map<String, String> fields = new HashMap<>();
        fields.put("error", "Unexpected error occurred: " + ex.getClass().getSimpleName());
        String message = ex.getMessage() != null ? ex.getMessage() : "An unexpected error occurred.";
        return build(HttpStatus.INTERNAL_SERVER_ERROR, "INTERNAL_ERROR", message, req, fields);
    }

    private ResponseEntity<ApiError> build(HttpStatus status, String code, String message, HttpServletRequest req, Map<String, String> fields) {
        ApiError body = new ApiError(code, message, status.value(), req.getRequestURI(), OffsetDateTime.now().toString(), fields);
        return ResponseEntity.status(status).body(body);
    }
}

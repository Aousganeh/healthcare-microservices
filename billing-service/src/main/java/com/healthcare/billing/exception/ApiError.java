package com.healthcare.billing.exception;

import java.time.OffsetDateTime;
import java.util.Map;

public record ApiError(
        String code,
        String message,
        int status,
        String path,
        String timestamp,
        Map<String, String> fields
) {
    public ApiError {
        if (timestamp == null) {
            timestamp = OffsetDateTime.now().toString();
        }
    }
}

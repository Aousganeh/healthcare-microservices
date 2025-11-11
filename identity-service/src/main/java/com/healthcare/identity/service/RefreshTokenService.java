package com.healthcare.identity.service;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.SecureRandom;
import java.time.Duration;
import java.util.Base64;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class RefreshTokenService {
    private final StringRedisTemplate redis;
    private final SecureRandom secureRandom = new SecureRandom();

    @Value("${security.refresh-token.ttl-days:30}")
    private int refreshTokenTtlDays;

    public String issue(String userId, String userAgent, String ip) {
        String tokenId = UUID.randomUUID().toString();
        String rawToken = tokenId + "." + randomBytes(32);
        String key = key(tokenId);
        String value = userId + "|" + sanitize(userAgent) + "|" + sanitize(ip);
        redis.opsForValue().set(key, value, Duration.ofDays(refreshTokenTtlDays));
        redis.opsForSet().add(userIndex(userId), tokenId);
        redis.expire(userIndex(userId), Duration.ofDays(refreshTokenTtlDays));
        return rawToken;
    }

    public String rotate(String rawToken, String userAgent, String ip) {
        String tokenId = extractId(rawToken);
        String key = key(tokenId);
        String userId = redis.opsForValue().get(key);
        if (userId == null) {
            return null;
        }
        revoke(rawToken);
        return issue(userId.split("\\|")[0], userAgent, ip);
    }

    public boolean revoke(String rawToken) {
        String tokenId = extractId(rawToken);
        String key = key(tokenId);
        String value = redis.opsForValue().get(key);
        if (value != null) {
            String userId = value.split("\\|")[0];
            redis.opsForSet().remove(userIndex(userId), tokenId);
        }
        return Boolean.TRUE.equals(redis.delete(key));
    }

    public void revokeAllForUser(String userId) {
        var members = redis.opsForSet().members(userIndex(userId));
        if (members != null) {
            for (String tokenId : members) {
                redis.delete(key(tokenId));
            }
        }
        redis.delete(userIndex(userId));
    }

    public String getUserIdIfValid(String rawToken) {
        String tokenId = extractId(rawToken);
        String value = redis.opsForValue().get(key(tokenId));
        if (value == null) return null;
        return value.split("\\|")[0];
    }

    private String key(String tokenId) {
        return "refresh:" + tokenId;
    }

    private String userIndex(String userId) {
        return "user:" + userId + ":refresh";
    }

    private String extractId(String rawToken) {
        if (rawToken == null) return "";
        int dot = rawToken.indexOf('.');
        return dot > 0 ? rawToken.substring(0, dot) : rawToken;
    }

    private String randomBytes(int len) {
        byte[] bytes = new byte[len];
        secureRandom.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    private String sanitize(String s) {
        if (s == null) return "";
        return new String(s.getBytes(StandardCharsets.UTF_8), StandardCharsets.UTF_8)
                .replace("|", "_")
                .replace("\n", "")
                .replace("\r", "");
    }
}



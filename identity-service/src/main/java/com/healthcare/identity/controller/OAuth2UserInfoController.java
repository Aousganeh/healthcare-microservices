package com.healthcare.identity.controller;

import com.healthcare.identity.entity.User;
import com.healthcare.identity.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/oauth2")
@RequiredArgsConstructor
public class OAuth2UserInfoController {
    private final UserRepository userRepository;

    @GetMapping("/userinfo")
    public ResponseEntity<Map<String, Object>> getUserInfo(Authentication authentication) {
        Map<String, Object> userInfo = new HashMap<>();
        
        if (authentication instanceof JwtAuthenticationToken jwtAuth) {
            String email = jwtAuth.getToken().getClaimAsString("sub");
            User user = userRepository.findByEmail(email).orElse(null);
            
            if (user != null) {
                userInfo.put("sub", user.getEmail());
                userInfo.put("email", user.getEmail());
                userInfo.put("username", user.getUsername());
                userInfo.put("name", (user.getFirstName() != null ? user.getFirstName() : "") + 
                                     (user.getLastName() != null ? " " + user.getLastName() : ""));
                userInfo.put("roles", user.getRoles().stream()
                        .map(role -> role.getName())
                        .collect(Collectors.toList()));
            }
        } else if (authentication.getPrincipal() instanceof UserDetails userDetails) {
            String email = userDetails.getUsername();
            User user = userRepository.findByEmail(email).orElse(null);
            
            if (user != null) {
                userInfo.put("sub", user.getEmail());
                userInfo.put("email", user.getEmail());
                userInfo.put("username", user.getUsername());
                userInfo.put("name", (user.getFirstName() != null ? user.getFirstName() : "") + 
                                     (user.getLastName() != null ? " " + user.getLastName() : ""));
                userInfo.put("roles", user.getRoles().stream()
                        .map(role -> role.getName())
                        .collect(Collectors.toList()));
            }
        }
        
        return ResponseEntity.ok(userInfo);
    }
}


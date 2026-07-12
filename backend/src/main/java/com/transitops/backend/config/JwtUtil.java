package com.transitops.backend.config;

import java.nio.charset.StandardCharsets;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;
import java.util.Base64;
import java.util.HashMap;
import java.util.Map;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import org.springframework.stereotype.Component;

@Component
public class JwtUtil {

    private static final String SECRET = "your-256-bit-extremely-secure-secret-key-transitops-smart-transportation-platform";
    private static final String ALGORITHM = "HmacSHA256";

    public String generateToken(String email, String name, String role, String userId) {
        try {
            String header = base64Encode("{\"alg\":\"HS256\",\"typ\":\"JWT\"}");

            long now = System.currentTimeMillis() / 1000;
            long exp = now + 86400; // 24 hours

            String payloadJson = String.format(
                    "{\"sub\":\"%s\",\"name\":\"%s\",\"role\":\"%s\",\"userId\":\"%s\",\"iat\":%d,\"exp\":%d}",
                    email, name, role, userId, now, exp
            );
            String payload = base64Encode(payloadJson);
            String signature = sign(header + "." + payload);

            return header + "." + payload + "." + signature;
        } catch (Exception e) {
            throw new RuntimeException("Error generating JWT token", e);
        }
    }

    /**
     * Validates the token signature and expiry, then extracts claims.
     * Throws RuntimeException if the token is invalid or expired.
     */
    public Map<String, String> validateAndExtract(String token) {
        String[] parts = token.split("\\.");
        if (parts.length != 3) {
            throw new IllegalArgumentException("Invalid JWT format");
        }

        String signatureInput = parts[0] + "." + parts[1];
        String expectedSignature;
        try {
            expectedSignature = sign(signatureInput);
        } catch (Exception e) {
            throw new RuntimeException("Failed to compute signature", e);
        }

        if (!expectedSignature.equals(parts[2])) {
            throw new IllegalArgumentException("JWT signature mismatch");
        }

        // Decode payload
        String payloadJson = new String(Base64.getUrlDecoder().decode(parts[1]), StandardCharsets.UTF_8);
        Map<String, String> claims = parseJsonClaims(payloadJson);

        // Check expiry
        String expStr = claims.get("exp");
        if (expStr != null) {
            long exp = Long.parseLong(expStr);
            if (System.currentTimeMillis() / 1000 > exp) {
                throw new IllegalArgumentException("JWT token has expired");
            }
        }

        return claims;
    }

    private String base64Encode(String input) {
        return Base64.getUrlEncoder().withoutPadding().encodeToString(
                input.getBytes(StandardCharsets.UTF_8)
        );
    }

    private String sign(String input) throws NoSuchAlgorithmException, InvalidKeyException {
        Mac mac = Mac.getInstance(ALGORITHM);
        SecretKeySpec key = new SecretKeySpec(SECRET.getBytes(StandardCharsets.UTF_8), ALGORITHM);
        mac.init(key);
        byte[] hash = mac.doFinal(input.getBytes(StandardCharsets.UTF_8));
        return Base64.getUrlEncoder().withoutPadding().encodeToString(hash);
    }

    /** Minimal JSON key-value parser for flat JWT payloads (no nested objects). */
    private Map<String, String> parseJsonClaims(String json) {
        Map<String, String> claims = new HashMap<>();
        // Strip surrounding braces
        String content = json.trim().replaceAll("^\\{|\\}$", "");
        // Split by comma (simple, works for flat JWT payloads)
        for (String pair : content.split(",(?=(?:[^\"]*\"[^\"]*\")*[^\"]*$)")) {
            String[] kv = pair.split(":", 2);
            if (kv.length == 2) {
                String key = kv[0].trim().replaceAll("\"", "");
                String value = kv[1].trim().replaceAll("\"", "");
                claims.put(key, value);
            }
        }
        return claims;
    }
}

package com.rentacar.customer.infrastructure.security;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.Cipher;
import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;
import java.util.Base64;

/**
 * JPA AttributeConverter für AES-256 Verschlüsselung von sensiblen Daten.
 * Der Encryption-Key wird aus der Konfiguration geladen.
 */
@Converter
@Component
public class AttributeEncryptor implements AttributeConverter<String, String> {

    private static final String ALGORITHM = "AES";
    private final SecretKey secretKey;
    private final Cipher cipher;

    public AttributeEncryptor(@Value("${app.security.encryption.key}") String encryptionKey) throws Exception {
        // Key muss 32 Bytes (256 Bit) für AES-256 sein
        byte[] keyBytes = Base64.getDecoder().decode(encryptionKey);
        this.secretKey = new SecretKeySpec(keyBytes, ALGORITHM);
        this.cipher = Cipher.getInstance(ALGORITHM);
    }

    @Override
    public String convertToDatabaseColumn(String attribute) {
        if (attribute == null) {
            return null;
        }
        try {
            cipher.init(Cipher.ENCRYPT_MODE, secretKey);
            byte[] encrypted = cipher.doFinal(attribute.getBytes());
            return Base64.getEncoder().encodeToString(encrypted);
        } catch (Exception e) {
            throw new IllegalStateException("Error encrypting attribute", e);
        }
    }

    @Override
    public String convertToEntityAttribute(String dbData) {
        if (dbData == null) {
            return null;
        }
        try {
            cipher.init(Cipher.DECRYPT_MODE, secretKey);
            byte[] decrypted = cipher.doFinal(Base64.getDecoder().decode(dbData));
            return new String(decrypted);
        } catch (Exception e) {
            throw new IllegalStateException("Error decrypting attribute", e);
        }
    }
}

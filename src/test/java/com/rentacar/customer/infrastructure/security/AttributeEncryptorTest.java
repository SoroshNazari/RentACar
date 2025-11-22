package com.rentacar.customer.infrastructure.security;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.Base64;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class AttributeEncryptorTest {

    private AttributeEncryptor encryptor;

    @BeforeEach
    void setUp() throws Exception {
        // Create a valid 256-bit AES key (32 bytes)
        byte[] keyBytes = new byte[32];
        for (int i = 0; i < 32; i++) {
            keyBytes[i] = (byte) i;
        }
        String base64Key = Base64.getEncoder().encodeToString(keyBytes);
        encryptor = new AttributeEncryptor(base64Key);
    }

    @Test
    void convertToDatabaseColumn_shouldEncryptString() {
        // Given
        String plainText = "sensitive-data";

        // When
        String encrypted = encryptor.convertToDatabaseColumn(plainText);

        // Then
        assertThat(encrypted).isNotNull();
        assertThat(encrypted).isNotEqualTo(plainText);
        assertThat(encrypted).isBase64();
    }

    @Test
    void convertToDatabaseColumn_withNull_shouldReturnNull() {
        // When
        String result = encryptor.convertToDatabaseColumn(null);

        // Then
        assertThat(result).isNull();
    }

    @Test
    void convertToEntityAttribute_shouldDecryptString() {
        // Given
        String plainText = "my-secret-password";
        String encrypted = encryptor.convertToDatabaseColumn(plainText);

        // When
        String decrypted = encryptor.convertToEntityAttribute(encrypted);

        // Then
        assertThat(decrypted).isEqualTo(plainText);
    }

    @Test
    void convertToEntityAttribute_withNull_shouldReturnNull() {
        // When
        String result = encryptor.convertToEntityAttribute(null);

        // Then
        assertThat(result).isNull();
    }

    @Test
    void encryptDecrypt_roundTrip_shouldPreserveData() {
        // Given
        String original = "test@example.com";

        // When
        String encrypted = encryptor.convertToDatabaseColumn(original);
        String decrypted = encryptor.convertToEntityAttribute(encrypted);

        // Then
        assertThat(decrypted).isEqualTo(original);
    }

    @Test
    void convertToEntityAttribute_withInvalidData_shouldThrowException() {
        // Given
        String invalidEncrypted = "not-valid-encrypted-data";

        // When & Then
        assertThatThrownBy(() -> encryptor.convertToEntityAttribute(invalidEncrypted))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("Error decrypting");
    }
}

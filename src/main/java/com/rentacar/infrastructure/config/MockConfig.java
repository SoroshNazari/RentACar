package com.rentacar.infrastructure.config;

import com.rentacar.infrastructure.storage.StorageService;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.multipart.MultipartFile;

import java.util.UUID;

/**
 * Mock-Konfiguration für Entwicklung ohne externe Abhängigkeiten (S3, SMTP,
 * etc.)
 */
@Configuration
/**
 * Konfigurationsklasse.
 * 
 * @author RentACar Team
 * @version 1.0
 * @since 1.0
 */
public class MockConfig {

    @Bean
    @ConditionalOnProperty(name = "app.mock.storage", havingValue = "true", matchIfMissing = false)
    public StorageService mockStorageService() {
        return new StorageService() {
            @Override
            public String storeFile(MultipartFile file) {
                // Mock: Gibt einen Fake-Dateinamen zurück
                return UUID.randomUUID() + "-" + file.getOriginalFilename();
            }

            @Override
            public java.nio.file.Path loadFile(String fileName) {
                // Mock: Gibt null zurück
                return null;
            }

            @Override
            public void deleteFile(String fileName) {
                // Mock: Tut nichts
            }

            @Override
            public String generatePresignedUrl(String fileName, java.time.Duration expiration) {
                // Mock: Gibt eine Fake-URL zurück
                return "http://localhost:8080/mock/files/" + fileName;
            }
        };
    }
}

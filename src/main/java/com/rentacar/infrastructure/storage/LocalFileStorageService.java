package com.rentacar.infrastructure.storage;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.Duration;
import java.util.UUID;

/**
 * Local File Storage Service for development.
 * Stores files on the local file system.
 */
@Slf4j
@Service
@Profile("dev")
public class LocalFileStorageService implements StorageService {

    private final Path fileStorageLocation;

    public LocalFileStorageService(@Value("${app.storage.upload-dir:uploads}") String uploadDir) {
        this.fileStorageLocation = Paths.get(uploadDir).toAbsolutePath().normalize();

        try {
            Files.createDirectories(this.fileStorageLocation);
        } catch (Exception ex) {
            throw new RuntimeException("Could not create upload directory!", ex);
        }
    }

    @Override
    public String storeFile(MultipartFile file) {
        // Generate unique filename
        String originalFilename = file.getOriginalFilename();
        String fileExtension = originalFilename != null && originalFilename.contains(".")
                ? originalFilename.substring(originalFilename.lastIndexOf("."))
                : "";
        String fileName = UUID.randomUUID() + fileExtension;

        try {
            // Check if filename contains invalid characters
            if (originalFilename != null && originalFilename.contains("..")) {
                throw new RuntimeException("Invalid filename: " + originalFilename);
            }

            // Copy file to target location
            Path targetLocation = this.fileStorageLocation.resolve(fileName);
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

            log.info("File stored successfully: {}", fileName);
            return fileName;
        } catch (IOException ex) {
            throw new RuntimeException("Could not store file " + fileName, ex);
        }
    }

    @Override
    public Path loadFile(String fileName) {
        return fileStorageLocation.resolve(fileName).normalize();
    }

    @Override
    public void deleteFile(String fileName) {
        try {
            Path filePath = fileStorageLocation.resolve(fileName).normalize();
            Files.deleteIfExists(filePath);
            log.info("File deleted successfully: {}", fileName);
        } catch (IOException ex) {
            log.error("Could not delete file: {}", fileName, ex);
        }
    }

    @Override
    public String generatePresignedUrl(String fileName, Duration expiration) {
        // For local storage, return a simple URL
        // In a real application, this would be the application's base URL + file path
        return "/api/v1/files/" + fileName;
    }
}

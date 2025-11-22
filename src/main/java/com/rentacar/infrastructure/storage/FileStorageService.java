package com.rentacar.infrastructure.storage;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

/**
 * File Storage Service for managing uploaded files.
 * Currently uses local file storage, can be extended to support S3.
 */
@Slf4j
@Service
public class FileStorageService {

    private final Path fileStorageLocation;

    public FileStorageService(@Value("${app.storage.upload-dir:uploads}") String uploadDir) {
        this.fileStorageLocation = Paths.get(uploadDir).toAbsolutePath().normalize();

        try {
            Files.createDirectories(this.fileStorageLocation);
        } catch (Exception ex) {
            throw new RuntimeException("Could not create upload directory!", ex);
        }
    }

    public String storeFile(MultipartFile file) {
        // Generate unique filename
        String originalFilename = file.getOriginalFilename();
        String fileExtension = originalFilename != null && originalFilename.contains(".")
                ? originalFilename.substring(originalFilename.lastIndexOf("."))
                : "";
        String fileName = UUID.randomUUID() + fileExtension;

        try {
            // Check if filename contains invalid characters
            if (fileName.contains("..")) {
                throw new RuntimeException("Invalid filename: " + fileName);
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

    public Path loadFile(String fileName) {
        return fileStorageLocation.resolve(fileName).normalize();
    }

    public void deleteFile(String fileName) {
        try {
            Path filePath = fileStorageLocation.resolve(fileName).normalize();
            Files.deleteIfExists(filePath);
            log.info("File deleted successfully: {}", fileName);
        } catch (IOException ex) {
            log.error("Could not delete file: {}", fileName, ex);
        }
    }
}

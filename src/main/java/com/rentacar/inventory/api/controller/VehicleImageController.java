package com.rentacar.inventory.api.controller;

import com.rentacar.infrastructure.storage.StorageService;
import com.rentacar.inventory.domain.model.Vehicle;
import com.rentacar.inventory.domain.model.VehicleImage;
import com.rentacar.inventory.repository.VehicleImageRepository;
import com.rentacar.inventory.repository.VehicleRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Path;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * Controller for vehicle image uploads.
 */
@RestController
@RequestMapping("/api/v1/vehicles/{vehicleId}/images")
@RequiredArgsConstructor
@Tag(name = "Vehicle Images", description = "Vehicle Image Management API")
public class VehicleImageController {

    private final StorageService storageService;
    private final VehicleRepository vehicleRepository;
    private final VehicleImageRepository vehicleImageRepository;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Upload vehicle image")
    public Map<String, String> uploadImage(
            @PathVariable UUID vehicleId,
            @RequestParam("file") MultipartFile file) {

        Vehicle vehicle = vehicleRepository.findById(vehicleId)
                .orElseThrow(() -> new EntityNotFoundException("Vehicle not found"));

        // Validate file
        if (file.isEmpty()) {
            throw new IllegalArgumentException("File is empty");
        }

        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new IllegalArgumentException("File must be an image");
        }

        // Store file
        String fileName = storageService.storeFile(file);
        String fileUrl = "/api/v1/vehicles/" + vehicleId + "/images/" + fileName;

        // Save to database
        VehicleImage vehicleImage = VehicleImage.builder()
                .vehicle(vehicle)
                .fileName(fileName)
                .fileUrl(fileUrl)
                .isPrimary(false)
                .build();
        vehicleImageRepository.save(vehicleImage);

        Map<String, String> response = new HashMap<>();
        response.put("fileName", fileName);
        response.put("fileUrl", fileUrl);
        return response;
    }

    @GetMapping("/{fileName}")
    @Operation(summary = "Download vehicle image")
    public ResponseEntity<Resource> downloadImage(
            @PathVariable UUID vehicleId,
            @PathVariable String fileName) {

        try {
            Path filePath = storageService.loadFile(fileName);
            Resource resource = new UrlResource(filePath.toUri());

            if (resource.exists() && resource.isReadable()) {
                return ResponseEntity.ok()
                        .contentType(MediaType.IMAGE_JPEG)
                        .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + fileName + "\"")
                        .body(resource);
            } else {
                throw new EntityNotFoundException("File not found: " + fileName);
            }
        } catch (Exception e) {
            throw new RuntimeException("Error loading file: " + fileName, e);
        }
    }

    @GetMapping
    @Operation(summary = "Get all images for a vehicle")
    public List<VehicleImage> getVehicleImages(@PathVariable UUID vehicleId) {
        return vehicleImageRepository.findByVehicleId(vehicleId);
    }

    @DeleteMapping("/{imageId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Delete vehicle image")
    public void deleteImage(@PathVariable UUID vehicleId, @PathVariable UUID imageId) {
        VehicleImage image = vehicleImageRepository.findById(imageId)
                .orElseThrow(() -> new EntityNotFoundException("Image not found"));

        storageService.deleteFile(image.getFileName());
        vehicleImageRepository.delete(image);
    }
}

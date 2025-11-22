package com.rentacar.infrastructure.storage;

import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Path;
import java.time.Duration;

/**
 * Interface für File-Storage-Operationen.
 * Implementierungen können lokales Dateisystem oder Cloud-Storage (S3, Azure
 * Blob, etc.) sein.
 */
/**
 * Service-Klasse für Business-Logik.
 * 
 * @author RentACar Team
 * @version 1.0
 * @since 1.0
 */
public interface StorageService {

    /**
     * Speichert eine Datei und gibt den generierten Dateinamen zurück.
     */
    String storeFile(MultipartFile file);

    /**
     * Lädt eine Datei anhand des Dateinamens.
     */
    Path loadFile(String fileName);

    /**
     * Löscht eine Datei anhand des Dateinamens.
     */
    void deleteFile(String fileName);

    /**
     * Generiert eine Pre-Signed URL für temporären Zugriff auf eine Datei.
     * Für lokalen Storage wird eine reguläre URL zurückgegeben.
     * Für S3 wird eine Pre-Signed URL mit Ablaufzeit zurückgegeben.
     */
    String generatePresignedUrl(String fileName, Duration expiration);
}

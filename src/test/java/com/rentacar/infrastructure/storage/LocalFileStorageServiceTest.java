package com.rentacar.infrastructure.storage;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.springframework.mock.web.MockMultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.Duration;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class LocalFileStorageServiceTest {

    @TempDir
    Path tempDir;

    private LocalFileStorageService storageService;

    @BeforeEach
    void setUp() {
        storageService = new LocalFileStorageService(tempDir.toString());
    }

    @Test
    void storeFile_shouldSaveFile() throws IOException {
        // Given
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "test.txt",
                "text/plain",
                "Hello World".getBytes());

        // When
        String fileName = storageService.storeFile(file);

        // Then
        assertThat(fileName).endsWith(".txt");
        Path savedFile = tempDir.resolve(fileName);
        assertThat(Files.exists(savedFile)).isTrue();
        assertThat(Files.readAllLines(savedFile)).contains("Hello World");
    }

    @Test
    void storeFile_withInvalidFilename_shouldThrowException() {
        // Given
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "../test.txt",
                "text/plain",
                "content".getBytes());

        // When & Then
        assertThatThrownBy(() -> storageService.storeFile(file))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Invalid filename");
    }

    @Test
    void loadFile_shouldReturnPath() throws IOException {
        // Given
        String fileName = "test-load.txt";
        Path file = tempDir.resolve(fileName);
        Files.createFile(file);

        // When
        Path loadedPath = storageService.loadFile(fileName);

        // Then
        assertThat(loadedPath).isEqualTo(file.toAbsolutePath());
    }

    @Test
    void deleteFile_shouldRemoveFile() throws IOException {
        // Given
        String fileName = "test-delete.txt";
        Path file = tempDir.resolve(fileName);
        Files.createFile(file);

        // When
        storageService.deleteFile(fileName);

        // Then
        assertThat(Files.exists(file)).isFalse();
    }

    @Test
    void deleteFile_withNonExistentFile_shouldNotThrow() {
        // When & Then
        storageService.deleteFile("non-existent.txt");
    }

    @Test
    void generatePresignedUrl_shouldReturnLocalPath() {
        // Given
        String fileName = "test.jpg";

        // When
        String url = storageService.generatePresignedUrl(fileName, Duration.ofMinutes(10));

        // Then
        assertThat(url).isEqualTo("/api/v1/files/" + fileName);
    }
}

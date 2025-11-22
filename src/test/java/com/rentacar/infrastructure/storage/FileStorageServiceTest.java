package com.rentacar.infrastructure.storage;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.util.ReflectionTestUtils;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class FileStorageServiceTest {

    @TempDir
    Path tempDir;

    private FileStorageService fileStorageService;

    @BeforeEach
    void setUp() {
        fileStorageService = new FileStorageService(tempDir.toString());
    }

    @Test
    void storeFile_shouldSaveFileSuccessfully() throws IOException {
        // Given
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "test.jpg",
                "image/jpeg",
                "test content".getBytes());

        // When
        String fileName = fileStorageService.storeFile(file);

        // Then
        assertThat(fileName).isNotNull();
        assertThat(fileName).endsWith(".jpg");

        Path storedFile = fileStorageService.loadFile(fileName);
        assertThat(Files.exists(storedFile)).isTrue();
        assertThat(Files.readString(storedFile)).isEqualTo("test content");
    }

    @Test
    void storeFile_withoutExtension_shouldStoreWithoutExtension() {
        // Given
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "testfile",
                "application/octet-stream",
                "content".getBytes());

        // When
        String fileName = fileStorageService.storeFile(file);

        // Then
        assertThat(fileName).isNotNull();
        assertThat(fileName).doesNotContain(".");
    }

    @Test
    void loadFile_shouldReturnCorrectPath() {
        // Given
        String fileName = "test-file.jpg";

        // When
        Path filePath = fileStorageService.loadFile(fileName);

        // Then
        assertThat(filePath).isNotNull();
        assertThat(filePath.getFileName().toString()).isEqualTo(fileName);
    }

    @Test
    void deleteFile_shouldRemoveFile() throws IOException {
        // Given
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "delete-test.jpg",
                "image/jpeg",
                "content".getBytes());
        String fileName = fileStorageService.storeFile(file);
        Path filePath = fileStorageService.loadFile(fileName);
        assertThat(Files.exists(filePath)).isTrue();

        // When
        fileStorageService.deleteFile(fileName);

        // Then
        assertThat(Files.exists(filePath)).isFalse();
    }

    @Test
    void deleteFile_whenFileDoesNotExist_shouldNotThrowException() {
        // When & Then - should not throw
        fileStorageService.deleteFile("non-existent-file.jpg");
    }
}

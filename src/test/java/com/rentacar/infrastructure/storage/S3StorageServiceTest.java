package com.rentacar.infrastructure.storage;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.*;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.PresignedGetObjectRequest;

import java.net.URL;
import java.nio.file.Path;
import java.time.Duration;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class S3StorageServiceTest {

    @Mock
    private S3Client s3Client;

    @Mock
    private S3Presigner s3Presigner;

    private S3StorageService storageService;
    private final String bucketName = "test-bucket";

    @BeforeEach
    void setUp() {
        // Mock headBucket to simulate bucket exists
        when(s3Client.headBucket(any(HeadBucketRequest.class))).thenReturn(HeadBucketResponse.builder().build());

        storageService = new S3StorageService(bucketName, s3Client, s3Presigner);
    }

    @Test
    void constructor_shouldCreateBucket_whenBucketDoesNotExist() {
        // Given
        S3Client mockClient = mock(S3Client.class);
        S3Presigner mockPresigner = mock(S3Presigner.class);

        when(mockClient.headBucket(any(HeadBucketRequest.class)))
                .thenThrow(NoSuchBucketException.builder().build());

        // When
        new S3StorageService(bucketName, mockClient, mockPresigner);

        // Then
        verify(mockClient).createBucket(any(CreateBucketRequest.class));
    }

    @Test
    void storeFile_shouldUploadToS3() {
        // Given
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "test.jpg",
                "image/jpeg",
                "content".getBytes());

        when(s3Client.putObject(any(PutObjectRequest.class), any(RequestBody.class)))
                .thenReturn(PutObjectResponse.builder().build());

        // When
        String fileName = storageService.storeFile(file);

        // Then
        assertThat(fileName).endsWith(".jpg");
        verify(s3Client).putObject(any(PutObjectRequest.class), any(RequestBody.class));
    }

    @Test
    void storeFile_whenS3Fails_shouldThrowException() {
        // Given
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "test.jpg",
                "image/jpeg",
                "content".getBytes());

        when(s3Client.putObject(any(PutObjectRequest.class), any(RequestBody.class)))
                .thenThrow(new RuntimeException("S3 Error"));

        // When & Then
        assertThatThrownBy(() -> storageService.storeFile(file))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Could not upload file to S3");
    }

    @Test
    void loadFile_shouldDownloadFromS3() {
        // Given
        String fileName = "test.jpg";
        when(s3Client.getObject(any(GetObjectRequest.class), any(Path.class)))
                .thenReturn(GetObjectResponse.builder().build());

        // When
        Path path = storageService.loadFile(fileName);

        // Then
        assertThat(path).isNotNull();
        assertThat(path.toString()).endsWith(fileName);
        verify(s3Client).getObject(any(GetObjectRequest.class), any(Path.class));
    }

    @Test
    void deleteFile_shouldDeleteFromS3() {
        // Given
        String fileName = "test.jpg";

        // When
        storageService.deleteFile(fileName);

        // Then
        verify(s3Client).deleteObject(any(DeleteObjectRequest.class));
    }

    @Test
    void deleteFile_whenS3Fails_shouldLogButNotThrow() {
        // Given
        String fileName = "test.jpg";
        when(s3Client.deleteObject(any(DeleteObjectRequest.class)))
                .thenThrow(new RuntimeException("S3 Error"));

        // When & Then
        storageService.deleteFile(fileName); // Should not throw
    }

    @Test
    void generatePresignedUrl_shouldReturnUrl() throws Exception {
        // Given
        String fileName = "test.jpg";
        URL url = new URL("https://s3.amazonaws.com/bucket/test.jpg");

        PresignedGetObjectRequest presignedRequest = mock(PresignedGetObjectRequest.class);
        when(presignedRequest.url()).thenReturn(url);

        when(s3Presigner.presignGetObject(
                any(software.amazon.awssdk.services.s3.presigner.model.GetObjectPresignRequest.class)))
                .thenReturn(presignedRequest);

        // When
        String result = storageService.generatePresignedUrl(fileName, Duration.ofMinutes(10));

        // Then
        assertThat(result).isEqualTo(url.toString());
    }
}

package com.rentacar.infrastructure.storage;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.*;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.GetObjectPresignRequest;
import software.amazon.awssdk.services.s3.presigner.model.PresignedGetObjectRequest;

import java.io.IOException;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.Duration;
import java.util.UUID;

/**
 * AWS S3 Storage Service for production.
 * Stores files in Amazon S3.
 */
@Slf4j
@Service
@Profile("prod")
public class S3StorageService implements StorageService {

    private final S3Client s3Client;
    private final S3Presigner s3Presigner;
    private final String bucketName;

    public S3StorageService(
            @Value("${app.storage.s3.bucket-name}") String bucketName,
            @Value("${app.storage.s3.region}") String region,
            @Value("${app.storage.s3.access-key}") String accessKey,
            @Value("${app.storage.s3.secret-key}") String secretKey) {
        this(bucketName,
                createS3Client(region, accessKey, secretKey),
                createS3Presigner(region, accessKey, secretKey));
    }

    public S3StorageService(String bucketName, S3Client s3Client, S3Presigner s3Presigner) {
        this.bucketName = bucketName;
        this.s3Client = s3Client;
        this.s3Presigner = s3Presigner;
        ensureBucketExists();
    }

    private static S3Client createS3Client(String region, String accessKey, String secretKey) {
        AwsBasicCredentials awsCredentials = AwsBasicCredentials.create(accessKey, secretKey);
        return S3Client.builder()
                .region(Region.of(region))
                .credentialsProvider(StaticCredentialsProvider.create(awsCredentials))
                .build();
    }

    private static S3Presigner createS3Presigner(String region, String accessKey, String secretKey) {
        AwsBasicCredentials awsCredentials = AwsBasicCredentials.create(accessKey, secretKey);
        return S3Presigner.builder()
                .region(Region.of(region))
                .credentialsProvider(StaticCredentialsProvider.create(awsCredentials))
                .build();
    }

    private void ensureBucketExists() {
        try {
            s3Client.headBucket(HeadBucketRequest.builder().bucket(bucketName).build());
            log.info("S3 bucket exists: {}", bucketName);
        } catch (NoSuchBucketException e) {
            log.info("Creating S3 bucket: {}", bucketName);
            s3Client.createBucket(CreateBucketRequest.builder().bucket(bucketName).build());
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
            // Upload to S3
            PutObjectRequest putObjectRequest = PutObjectRequest.builder()
                    .bucket(bucketName)
                    .key(fileName)
                    .contentType(file.getContentType())
                    .build();

            s3Client.putObject(putObjectRequest, RequestBody.fromInputStream(file.getInputStream(), file.getSize()));

            log.info("File uploaded to S3: {}", fileName);
            return fileName;
        } catch (Exception ex) {
            throw new RuntimeException("Could not upload file to S3: " + fileName, ex);
        }
    }

    @Override
    public Path loadFile(String fileName) {
        // For S3, we don't load to local path
        // This method is used by VehicleImageController which expects a Path
        // We'll download to temp file
        try {
            GetObjectRequest getObjectRequest = GetObjectRequest.builder()
                    .bucket(bucketName)
                    .key(fileName)
                    .build();

            Path tempFile = Paths.get(System.getProperty("java.io.tmpdir"), fileName);
            s3Client.getObject(getObjectRequest, tempFile);

            return tempFile;
        } catch (Exception ex) {
            throw new RuntimeException("Could not download file from S3: " + fileName, ex);
        }
    }

    @Override
    public void deleteFile(String fileName) {
        try {
            DeleteObjectRequest deleteObjectRequest = DeleteObjectRequest.builder()
                    .bucket(bucketName)
                    .key(fileName)
                    .build();

            s3Client.deleteObject(deleteObjectRequest);
            log.info("File deleted from S3: {}", fileName);
        } catch (Exception ex) {
            log.error("Could not delete file from S3: {}", fileName, ex);
        }
    }

    @Override
    public String generatePresignedUrl(String fileName, Duration expiration) {
        GetObjectRequest getObjectRequest = GetObjectRequest.builder()
                .bucket(bucketName)
                .key(fileName)
                .build();

        GetObjectPresignRequest presignRequest = GetObjectPresignRequest.builder()
                .signatureDuration(expiration)
                .getObjectRequest(getObjectRequest)
                .build();

        PresignedGetObjectRequest presignedRequest = s3Presigner.presignGetObject(presignRequest);
        return presignedRequest.url().toString();
    }
}

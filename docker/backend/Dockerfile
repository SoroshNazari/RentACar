# Backend Dockerfile
FROM openjdk:17-jdk-slim

WORKDIR /app

# Copy gradle files
COPY build.gradle settings.gradle ./
COPY gradle/ ./gradle/
COPY gradlew ./
RUN chmod +x ./gradlew

# Copy source code
COPY src/ ./src/

# Build the application
RUN ./gradlew build -x test

# Create runtime image
FROM openjdk:17-jre-slim
WORKDIR /app

# Copy the built JAR
COPY --from=0 /app/build/libs/*.jar app.jar

# Expose port
EXPOSE 8080

# Run the application
ENTRYPOINT ["java", "-jar", "app.jar"]
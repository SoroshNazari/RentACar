#!/bin/bash
# Set Java 21 explicitly for this session
export JAVA_HOME=/Users/soroshnazari/Library/Java/JavaVirtualMachines/temurin-21.0.7/Contents/Home

echo "Using Java from: $JAVA_HOME"
java -version

# Run the application
mvn spring-boot:run

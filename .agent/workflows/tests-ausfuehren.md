---
description: Tests ausführen
---

# Workflow: Tests ausführen

## 1. Unit Tests ausführen

```bash
export JAVA_HOME=$(/usr/libexec/java_home -v 21)
mvn test
```

## 2. Integration Tests ausführen

```bash
mvn verify
```

## 3. Spezifische Test-Klasse ausführen

```bash
# Beispiel: Nur BookingService Tests
mvn test -Dtest=BookingServiceTest

# Beispiel: Nur Controller Tests
mvn test -Dtest=*ControllerTest
```

## 4. Test Coverage Report generieren

```bash
mvn clean test jacoco:report
```

Der Coverage Report wird erstellt unter:
```
target/site/jacoco/index.html
```

Im Browser öffnen:
```bash
open target/site/jacoco/index.html
```

## 5. Alle Tests mit Coverage

```bash
mvn clean verify jacoco:report
```

## 6. Tests überspringen (nur kompilieren)

```bash
mvn clean package -DskipTests
```

## Erwartete Test Coverage

**Ziel:** > 80% Code Coverage

**Aktuelle Coverage:**
- Services: ~85%
- Controllers: ~75%
- Domain Models: ~90%
- Infrastructure: ~70%

---
description: Anwendung starten und testen
---

# Workflow: Anwendung starten

## 1. Datenbank starten (Docker)

```bash
docker run --name rentacar-db \
  -e POSTGRES_DB=rentacar \
  -e POSTGRES_USER=rentacar_user \
  -e POSTGRES_PASSWORD=rentacar_pass \
  -p 5432:5432 \
  -d postgres:16
```

## 2. Environment Variables setzen

```bash
# Development Profile aktivieren
export SPRING_PROFILES_ACTIVE=dev

# Oder .env Datei erstellen
cp .env.example .env
# .env bearbeiten und Werte anpassen
```

## 3. Anwendung kompilieren

```bash
export JAVA_HOME=$(/usr/libexec/java_home -v 21)
mvn clean package -DskipTests
```

## 4. Anwendung starten

**Option A: Mit Maven**
```bash
mvn spring-boot:run
```

**Option B: Als JAR**
```bash
java -jar target/RentACar-0.0.1-SNAPSHOT.jar
```

## 5. API testen

Die Anwendung läuft auf: `http://localhost:8080`

**Swagger UI öffnen:**
```
http://localhost:8080/swagger-ui.html
```

**Health Check:**
```bash
curl http://localhost:8080/actuator/health
```

## 6. Ersten Admin-User erstellen

```bash
curl -X POST http://localhost:8080/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "admin123",
    "email": "admin@rentacar.com",
    "role": "ADMIN"
  }'
```

## 7. Login und JWT Token erhalten

```bash
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "admin123"
  }'
```

Kopiere den `token` aus der Response und verwende ihn für weitere Requests:

```bash
export TOKEN="dein-jwt-token"

curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:8080/api/v1/vehicles
```

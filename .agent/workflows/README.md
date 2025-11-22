# RentACar Backend - Workflows

Dieser Ordner enthält alle wichtigen Workflows für das RentACar Backend Projekt.

## 📋 Verfügbare Workflows

### 1. [Anwendung starten](./anwendung-starten.md)
**Verwendung:** `/anwendung-starten`

Kompletter Workflow zum Starten der Anwendung:
- Datenbank mit Docker starten
- Environment Variables konfigurieren
- Anwendung kompilieren und starten
- API testen (Swagger UI, Health Check)
- Admin-User erstellen und Login

---

### 2. [Tests ausführen](./tests-ausfuehren.md)
**Verwendung:** `/tests-ausfuehren`

Alle Test-Befehle:
- Unit Tests ausführen
- Integration Tests ausführen
- Test Coverage Report generieren
- Spezifische Tests ausführen

**Ziel:** >80% Code Coverage

---

### 3. [API Beispiele](./api-beispiele.md)
**Verwendung:** `/api-beispiele`

Praktische API-Beispiele mit curl:
- **Authentifizierung** - Register, Login, JWT
- **Fahrzeugverwaltung** - CRUD, Suche, Bilder
- **Buchungsverwaltung** - Erstellen, Stornieren
- **Vermietungsprozess** - Check-out, Check-in
- **Kundenverwaltung** - CRUD
- **Reporting** - Statistiken
- **Multi-Tenancy** - Mandanten-Anfragen
- **Pagination** - Paginierte Abfragen

Alle Befehle sind **Copy-Paste-Ready**!

---

### 4. [Production Deployment](./production-deployment.md)
**Verwendung:** `/production-deployment`

Production-Deployment Workflow:
- Environment Variables für Production
- Docker Image erstellen
- JAR Deployment
- SSL/HTTPS mit Nginx
- Datenbank Backups
- Monitoring & Logging

**Wichtige Sicherheitshinweise enthalten!**

---

## 🚀 Schnellstart

### Erste Schritte (Development)

```bash
# 1. Datenbank starten
docker run --name rentacar-db \
  -e POSTGRES_DB=rentacar \
  -e POSTGRES_USER=rentacar_user \
  -e POSTGRES_PASSWORD=rentacar_pass \
  -p 5432:5432 \
  -d postgres:16

# 2. Environment setzen
export SPRING_PROFILES_ACTIVE=dev

# 3. Anwendung starten
mvn spring-boot:run

# 4. API testen
open http://localhost:8080/swagger-ui.html
```

---

## 📚 Weitere Dokumentation

- **[README.md](../README.md)** - Projekt-Übersicht und Dokumentation
- **[.env.example](../.env.example)** - Environment Variables Template
- **[Walkthrough](/.gemini/antigravity/brain/*/walkthrough.md)** - Implementierungs-Walkthrough

---

## 💡 Tipps

### Swagger UI verwenden
Die einfachste Methode zum Testen der API:
```
http://localhost:8080/swagger-ui.html
```

### JWT Token verwenden
Nach dem Login den Token speichern:
```bash
export TOKEN="dein-jwt-token-hier"
curl -H "Authorization: Bearer $TOKEN" http://localhost:8080/api/v1/vehicles
```

### Logs überwachen
```bash
# Anwendungs-Logs
tail -f logs/spring.log

# Docker Logs
docker logs -f rentacar-db
```

---

## 🔧 Häufige Befehle

```bash
# Kompilieren (ohne Tests)
mvn clean package -DskipTests

# Tests ausführen
mvn test

# Coverage Report
mvn clean test jacoco:report
open target/site/jacoco/index.html

# Anwendung starten
mvn spring-boot:run

# Health Check
curl http://localhost:8080/actuator/health
```

---

## 📞 Support

Bei Fragen oder Problemen:
1. Prüfe die [README.md](../README.md)
2. Schaue in die spezifischen Workflow-Dateien
3. Prüfe die Swagger UI Dokumentation
4. Erstelle ein Issue im Repository

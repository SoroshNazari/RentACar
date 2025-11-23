# RentACar Backend

## 📋 Projektübersicht

RentACar ist ein vollständiges Backend-System für eine Autovermietung, entwickelt mit **Java 21** und **Spring Boot 3.3+**. Das System bietet umfassende Funktionen für Fahrzeugverwaltung, Kundenverwaltung, Buchungen und Vermietungsprozesse.

### Hauptfunktionen

- ✅ **Fahrzeugverwaltung** - Verwaltung von Fahrzeugen, Filialen und Fahrzeugbildern
- ✅ **Kundenverwaltung** - Sichere Verwaltung von Kundendaten mit Verschlüsselung
- ✅ **Buchungssystem** - Vollständiger Buchungsprozess mit Preiskonfiguration
- ✅ **Vermietungsprozess** - Check-out/Check-in mit Übergabeprotokollen
- ✅ **JWT-Authentifizierung** - Sichere Authentifizierung und Autorisierung
- ✅ **Email-Benachrichtigungen** - Automatische HTML-Emails für Buchungen
- ✅ **File Upload** - Fahrzeugbilder mit Mock-Storage
- ✅ **Reporting Dashboard** - Echtzeit-Statistiken und Reports
- ✅ **Multi-Tenancy** - Unterstützung für mehrere Mandanten
- ✅ **Rate Limiting** - Schutz vor API-Missbrauch

---

## 🏗️ Architektur

**Modular Monolith** mit **Domain-Driven Design (DDD)** Prinzipien:

```
src/main/java/com/rentacar/
├── booking/          # Buchungsmodul
├── customer/         # Kundenmodul
├── inventory/        # Fahrzeug- und Filialen-Modul
├── rental/           # Vermietungsmodul
├── reporting/        # Reporting-Modul
└── infrastructure/   # Querschnittsfunktionen
    ├── security/     # JWT, Verschlüsselung
    ├── email/        # Email-Service
    ├── storage/      # File Storage (S3/Lokal)
    ├── multitenancy/ # Multi-Tenancy Support
    └── audit/        # Audit-Logging
```

---

## 🚀 Schnellstart

### Voraussetzungen

- **Java 21**
- **Maven 3.8+**
- **H2 Database** (eingebettet, keine Installation nötig)

### 🤝 Für das Team (Clone & Run)

Das Projekt ist so konfiguriert, dass ihr es **ohne Konfiguration** direkt starten könnt.
Es werden automatisch Standard-Werte verwendet, sodass niemand Variablen ändern muss.

**Standard-Konfiguration (automatisch aktiv):**
- **Datenbank**: H2 (dateibasiert in `./data/rentacar.mv.db`)
- **Daten bleiben erhalten** nach Neustart
- **H2-Console**: `http://localhost:8080/h2-console`
- **Secrets**: Entwicklungs-Keys sind bereits hinterlegt

### Installation

1. **Repository klonen**
```bash
git clone <repository-url>
cd RentACar
```

2. **Datenbank** (automatisch)
Die H2-Datenbank wird automatisch erstellt. Keine Installation nötig!

3. **Anwendung starten**
```bash
# Anwendung starten
mvn spring-boot:run

# Production Build
mvn clean package
java -jar target/RentACar-0.0.1-SNAPSHOT.jar
```

Die API ist verfügbar unter: `http://localhost:8080`

---

## 📚 API-Dokumentation

### Swagger UI

Öffne `http://localhost:8080/swagger-ui.html` für die interaktive API-Dokumentation.

### Wichtige Endpoints

#### Authentifizierung
```
POST /api/v1/auth/register  # Registrierung
POST /api/v1/auth/login     # Login (JWT Token)
```

#### Fahrzeuge
```
GET    /api/v1/vehicles                    # Alle Fahrzeuge
GET    /api/v1/vehicles/search             # Fahrzeugsuche
POST   /api/v1/vehicles                    # Fahrzeug erstellen
GET    /api/v1/vehicles/{id}               # Fahrzeug abrufen
PUT    /api/v1/vehicles/{id}               # Fahrzeug aktualisieren
DELETE /api/v1/vehicles/{id}               # Fahrzeug löschen
POST   /api/v1/vehicles/{id}/images        # Bild hochladen
```

#### Buchungen
```
GET    /api/v1/bookings           # Alle Buchungen
POST   /api/v1/bookings           # Buchung erstellen
GET    /api/v1/bookings/{id}      # Buchung abrufen
POST   /api/v1/bookings/{id}/cancel  # Buchung stornieren
```

#### Vermietungen
```
POST   /api/v1/rentals/checkout   # Fahrzeug abholen
POST   /api/v1/rentals/checkin    # Fahrzeug zurückgeben
GET    /api/v1/rentals/{id}       # Vermietung abrufen
```

#### Reporting
```
GET    /api/v1/reports/stats      # Statistiken abrufen
```

---

## ⚙️ Konfiguration

### Environment Variables

Alle erforderlichen Environment Variables sind in `.env.example` dokumentiert:

```bash
# Spring Profile
SPRING_PROFILES_ACTIVE=dev

# Datenbank
DB_HOST=localhost
DB_PORT=5432
DB_NAME=rentacar
DB_USERNAME=rentacar_user
DB_PASSWORD=your_secure_password

# JWT & Verschlüsselung
JWT_SECRET=your-secret-key-min-256-bits-long
JWT_EXPIRATION=86400000
ENCRYPTION_KEY=your-encryption-key-32-chars!!

# Email (Production)
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-password
MAIL_FROM=noreply@rentacar.com

# File Storage
STORAGE_TYPE=local  # oder 's3' für Production
STORAGE_LOCAL_PATH=./uploads

# AWS S3 (Production)
S3_BUCKET_NAME=rentacar-images
S3_REGION=eu-central-1
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
```

### Profile

- **dev**: Development-Profil mit lokaler Datenbank und lokalem File Storage
- **prod**: Production-Profil mit SMTP und S3

---

## 🔒 Sicherheit

### Authentifizierung

- **JWT-basierte Authentifizierung**
- Token-Gültigkeit: 24 Stunden (konfigurierbar)
- Rollen: ADMIN, EMPLOYEE, CUSTOMER

### Datenverschlüsselung

- **Sensible Kundendaten** werden mit AES-256 verschlüsselt
- **Passwörter** werden mit BCrypt gehasht
- **HTTPS** wird für Production empfohlen

### Rate Limiting

- **100 Requests pro Minute** pro IP-Adresse
- Automatische IP-Erkennung (inkl. X-Forwarded-For)
- Actuator-Endpoints ausgenommen

---

## 📧 Email-Benachrichtigungen

Das System sendet automatisch HTML-Emails für:

- ✅ **Buchungsbestätigung** - Nach erfolgreicher Buchung
- ✅ **Buchungsstornierung** - Bei Stornierung
- ✅ **Erinnerung** - Vor Fahrzeugabholung

### Email-Konfiguration

**Development**: Emails werden in der Konsole ausgegeben

**Production**: Konfiguriere SMTP-Server in `.env`:
```bash
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-password
```

---

## 📁 File Storage

### Development
Dateien werden lokal gespeichert in `./uploads`

### Production
Dateien werden in **AWS S3** gespeichert:
```bash
STORAGE_TYPE=s3
S3_BUCKET_NAME=rentacar-images
S3_REGION=eu-central-1
AWS_ACCESS_KEY_ID=your-key
AWS_SECRET_ACCESS_KEY=your-secret
```

---

## 🏢 Multi-Tenancy

Das System unterstützt mehrere Mandanten (z.B. verschiedene Filialen):

```bash
# Anfrage für Mandant A
curl -H "X-Tenant-ID: company-a" http://localhost:8080/api/v1/vehicles

# Anfrage für Mandant B
curl -H "X-Tenant-ID: company-b" http://localhost:8080/api/v1/vehicles
```

---

## 🗄️ Datenbank

### H2 Database

**Standard-Konfiguration:**
- **Typ**: Dateibasiert (Daten bleiben erhalten)
- **Speicherort**: `./data/rentacar.mv.db`
- **H2-Console**: http://localhost:8080/h2-console
  - JDBC URL: `jdbc:h2:file:./data/rentacar`
  - Username: `sa`
  - Password: (leer)

**Schema-Verwaltung:**
Hibernate erstellt das Schema automatisch (`ddl-auto: create-drop`).

---

## 🧪 Testing

### Unit Tests ausführen
```bash
mvn test
```

### Integration Tests ausführen
```bash
mvn verify
```

### Test Coverage
Ziel: > 80% Code Coverage

---

## 📊 Monitoring

### Actuator Endpoints

```
GET /actuator/health       # Health Check
GET /actuator/info         # Application Info
GET /actuator/metrics      # Metriken
GET /actuator/prometheus   # Prometheus Metriken
```

### Prometheus & Grafana

Für Production-Monitoring siehe `docker-compose-monitoring.yml`

---

## 🛠️ Entwicklung

### Build
```bash
mvn clean package
```

### Code Style
- Java 21 Features
- Lombok für Boilerplate-Reduktion
- Spring Boot Best Practices

### Logging
```bash
# Development: DEBUG Level
# Production: INFO Level
```

---

## 📝 Lizenz

Dieses Projekt ist für Bildungszwecke entwickelt.

---

## 👥 Kontakt

Bei Fragen oder Problemen bitte ein Issue erstellen.

---

## 🎯 Roadmap

- [ ] Prometheus/Grafana Dashboards
- [ ] Performance Tests (JMeter/Gatling)
- [ ] Security Tests (OWASP ZAP)
- [ ] Mobile App Integration
- [ ] Payment Gateway Integration

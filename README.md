# RentACar - Autovermietungssystem

Ein modernes Full-Stack-Autovermietungssystem mit Spring Boot Backend und React Frontend, entwickelt nach Domain-Driven Design (DDD) Prinzipien.

## 📋 Inhaltsverzeichnis

- [Übersicht](#-übersicht)
- [Features](#-features)
- [Technologie-Stack](#-technologie-stack)
- [Voraussetzungen](#-voraussetzungen)
- [Installation & Setup](#-installation--setup)
- [Projektstruktur](#-projektstruktur)
- [API-Endpunkte](#-api-endpunkte)
- [Rollen & Berechtigungen](#-rollen--berechtigungen)
- [Sicherheit](#-sicherheit)
- [Testing](#-testing)
- [Dokumentation](#-dokumentation)
- [Entwicklung](#-entwicklung)

## 🎯 Übersicht

RentACar ist ein vollständiges Autovermietungssystem, das es Kunden ermöglicht, Fahrzeuge zu suchen, zu buchen und zu mieten. Mitarbeiter können Fahrzeuge verwalten, Vermietungen durchführen und Administratoren haben Zugriff auf alle Funktionen inklusive eines umfassenden Dashboards.

### Hauptfunktionen

- **Fahrzeugverwaltung**: Suche, Filterung und Verwaltung von Fahrzeugen
- **Buchungssystem**: Verfügbarkeitsprüfung, Buchungserstellung und Stornierung
- **Vermietungsprozess**: Check-out und Check-in mit Schadensberichten
- **Kundenverwaltung**: Registrierung, Profilverwaltung und Buchungshistorie
- **Dashboard**: Übersicht für Kunden und Administratoren
- **Sicherheit**: Session-basierte Authentifizierung mit RBAC

## ✨ Features

### Für Kunden (ROLE_CUSTOMER)
- ✅ Fahrzeuge suchen und filtern
- ✅ Buchungen erstellen und stornieren (bis 24h vor Abholung)
- ✅ Eigene Profildaten anzeigen und bearbeiten
- ✅ Buchungshistorie einsehen
- ✅ Account-Registrierung mit E-Mail-Aktivierung

### Für Mitarbeiter (ROLE_EMPLOYEE)
- ✅ Alle Kunden-Funktionen
- ✅ Fahrzeuge hinzufügen, bearbeiten und außer Betrieb setzen
- ✅ Fahrzeugstandorte ändern
- ✅ Check-out und Check-in durchführen
- ✅ Schadensberichte erstellen
- ✅ Buchungen und Kunden einsehen

### Für Administratoren (ROLE_ADMIN)
- ✅ Alle Mitarbeiter-Funktionen
- ✅ Dashboard mit Übersicht aller Kunden
- ✅ Gesamtstatistiken (Kunden, Buchungen, Umsatz)
- ✅ Vollzugriff auf alle Endpunkte

## 🛠 Technologie-Stack

### Backend
- **Spring Boot 3.2.0** - Framework
- **Spring Security 6.5** - Authentifizierung & Autorisierung
- **Spring Data JPA** - Datenbankzugriff
- **H2 Database** - In-Memory Datenbank (Development)
- **Jasypt** - Verschlüsselung sensibler Daten (DSGVO-konform)
- **BCrypt** - Passwort-Hashing
- **Gradle** - Build-Tool
- **JaCoCo** - Code Coverage

### Frontend
- **React 18+** - UI-Framework
- **TypeScript** - Typsicherheit
- **Vite** - Build-Tool
- **React Router 7+** - Routing
- **Axios** - HTTP-Client
- **Tailwind CSS** - Styling

### Testing
- **JUnit 5** - Unit-Tests
- **Mockito** - Mocking
- **JaCoCo** - Coverage Reports

## 📦 Voraussetzungen

- **Java 17** oder höher
- **Node.js** v18 oder höher
- **npm** v9 oder höher
- **Gradle** (Wrapper enthalten)

## 🚀 Installation & Setup

### 1. Repository klonen

```bash
git clone https://github.com/SoroshNazari/RentACar.git
cd RentACar
```

### 2. Dependencies installieren

```bash
# Frontend Dependencies
cd frontend
npm install
cd ..

# Backend Dependencies werden automatisch von Gradle geladen
```

### 3. Entwicklungsserver starten

#### Option 1: Beide Server gleichzeitig (empfohlen)

```bash
npm run dev
```

#### Option 2: Separately

**Backend:**
```bash
./gradlew bootRun
# Oder mit npm:
npm run dev:backend
```

**Frontend:**
```bash
cd frontend
npm run dev
# Oder mit npm (vom Root):
npm run dev:frontend
```

### 4. Zugriff

- **Frontend**: http://localhost:5173 (oder anderer Port)
- **Backend API**: http://localhost:8081/api
- **H2 Console**: http://localhost:8081/h2-console (Development)

## 📁 Projektstruktur

```
RentACar/
├── backend/
│   └── src/
│       ├── config/              # Spring Configuration
│       ├── controllers/         # REST Controllers
│       ├── services/            # Application Services
│       ├── models/              # Domain Entities & Repositories
│       └── shared/              # Shared Components
│           ├── security/        # Security Services
│           ├── service/         # Shared Services (Email, etc.)
│           ├── validation/      # Custom Validators
│           └── web/             # Global Exception Handler
├── frontend/
│   └── src/
│       ├── components/          # React Components
│       ├── pages/               # Page Components
│       ├── services/            # API Client
│       ├── types/               # TypeScript Types
│       └── utils/               # Utility Functions
├── docs/                        # Projekt-Dokumentation
├── data/                        # H2 Database Files
└── build.gradle                 # Gradle Build Configuration
```

## 🔌 API-Endpunkte

### Authentifizierung
- `POST /api/auth/login` - Login (öffentlich)
- `POST /api/auth/logout` - Logout (authentifiziert)

### Kunden
- `POST /api/customers/register` - Registrierung (öffentlich)
- `POST /api/customers/activate` - Account aktivieren (öffentlich)
- `GET /api/customers/me` - Eigene Daten (CUSTOMER)
- `GET /api/customers` - Alle Kunden (EMPLOYEE, ADMIN)
- `PUT /api/customers/{id}` - Daten aktualisieren (EMPLOYEE, ADMIN)

### Fahrzeuge
- `GET /api/vehicles` - Alle Fahrzeuge (öffentlich)
- `GET /api/vehicles/{id}` - Fahrzeugdetails (öffentlich)
- `POST /api/vehicles` - Fahrzeug hinzufügen (EMPLOYEE, ADMIN)
- `PUT /api/vehicles/{id}` - Fahrzeug bearbeiten (EMPLOYEE, ADMIN)
- `PATCH /api/vehicles/{id}/location` - Standort ändern (EMPLOYEE, ADMIN)
- `PATCH /api/vehicles/{id}/out-of-service` - Außer Betrieb setzen (EMPLOYEE, ADMIN)

### Buchungen
- `GET /api/bookings/search` - Verfügbare Fahrzeuge suchen (öffentlich)
- `POST /api/bookings` - Buchung erstellen (CUSTOMER)
- `GET /api/bookings/history/{customerId}` - Buchungshistorie (CUSTOMER)
- `DELETE /api/bookings/{id}` - Buchung stornieren (CUSTOMER)
- `GET /api/bookings` - Alle Buchungen (EMPLOYEE, ADMIN)

### Vermietungen
- `POST /api/rentals/checkout` - Check-out durchführen (EMPLOYEE, ADMIN)
- `POST /api/rentals/checkin` - Check-in durchführen (EMPLOYEE, ADMIN)

**Vollständige API-Dokumentation:** Siehe `frontend/docs/API_DOCUMENTATION.md`

## 👥 Rollen & Berechtigungen

### ROLE_CUSTOMER
- Fahrzeuge suchen und anzeigen
- Buchungen erstellen und stornieren
- Eigene Profildaten anzeigen und bearbeiten
- Eigene Buchungshistorie einsehen

### ROLE_EMPLOYEE
- Alle CUSTOMER-Rechte
- Fahrzeuge verwalten (hinzufügen, bearbeiten, Standort ändern)
- Fahrzeuge außer Betrieb setzen
- Check-out und Check-in durchführen
- Alle Buchungen und Kunden einsehen

### ROLE_ADMIN
- Alle EMPLOYEE-Rechte
- Dashboard mit Gesamtstatistiken
- Vollzugriff auf alle Endpunkte

**Detaillierte Rechte-Matrix:** Siehe `docs/FRONTEND_ROLE_MATRIX.md`

## 🔒 Sicherheit

### Authentifizierung
- **Session-basiert**: Spring Security Session Management
- **Passwort-Hashing**: BCrypt mit automatischem Salt
- **Rate Limiting**: Max. 5 Login-Versuche in 15 Minuten
- **Session-Timeout**: 30 Minuten Inaktivität

### Autorisierung
- **RBAC**: Rollenbasierte Zugriffskontrolle
- **Method-Level Security**: `@PreAuthorize` Annotationen
- **URL-basierte Sicherheit**: Spring Security `requestMatchers`

### Datenschutz (DSGVO)
- **Verschlüsselung**: Sensible Daten (E-Mail, Telefon, Adresse, Führerschein) werden verschlüsselt gespeichert
- **Algorithmus**: Jasypt mit PBEWithMD5AndDES
- **Audit-Logging**: Alle wichtigen Aktionen werden protokolliert

### Cookie-Sicherheit
- **HttpOnly**: Verhindert JavaScript-Zugriff
- **Secure**: Nur über HTTPS (in Production)
- **SameSite**: CSRF-Schutz

**Detaillierte Sicherheitsdokumentation:** Siehe `docs/AUTHENTICATION_IMPLEMENTATION.md`

## 🧪 Testing

### Backend Tests

```bash
# Alle Tests ausführen
./gradlew test

# Mit Coverage Report
./gradlew test jacocoTestReport

# Coverage Report anzeigen
open build/reports/jacoco/test/html/index.html
```

### Frontend Tests

```bash
cd frontend

# Unit Tests
npm run test

# E2E Tests (Playwright)
npm run test:e2e
```

### Test Coverage
- **Backend**: 73% Minimum (JaCoCo)
- **128 Tests** insgesamt
- **Alle Tests bestanden** ✅

## 📚 Dokumentation

### Hauptdokumentation
- **Projektdokumentation**: `docs/project-documentation.md`
- **Technologie-Stack**: `docs/TECHNOLOGY_STACK.md`
- **Authentifizierung**: `docs/AUTHENTICATION_IMPLEMENTATION.md`
- **Frontend Rollen-Matrix**: `docs/FRONTEND_ROLE_MATRIX.md`

### API-Dokumentation
- **Frontend API Client**: `frontend/docs/API_DOCUMENTATION.md`
- **API Testing Guide**: `docs/api-testing.md`

### Weitere Dokumentation
- **Code Review**: `docs/code-review.md`
- **Test Coverage**: `docs/test-coverage-report.md`
- **Test Results**: `docs/test-results.md`

## 💻 Entwicklung

### Build-Befehle

```bash
# Backend bauen
./gradlew clean build

# Frontend bauen
cd frontend
npm run build

# Production Build (beide)
npm run build
```

### Code Quality

```bash
# Frontend: Linting & Formatting
cd frontend
npm run lint
npm run format
npm run quality

# Backend: Gradle Check
./gradlew check
```

### Git Workflow

```bash
# Auf develop Branch arbeiten
git checkout develop

# Änderungen committen
git add .
git commit -m "Beschreibung"

# Auf GitHub pushen
git push origin develop
```

### Wichtige Hinweise

1. **Datenbank**: H2 wird automatisch initialisiert mit Testdaten
2. **E-Mail-Service**: `DummyEmailService` loggt Aktivierungs-Links in die Konsole
3. **CORS**: Konfiguriert für `localhost:3000`, `localhost:5173`, `localhost:5174`
4. **Ports**: Backend standardmäßig auf Port 8081, Frontend auf 5173

## 📝 License

Copyright © 2024 RentACar. All rights reserved.

## 🤝 Beitragen

1. Fork das Repository
2. Erstelle einen Feature-Branch (`git checkout -b feature/AmazingFeature`)
3. Committe deine Änderungen (`git commit -m 'Add some AmazingFeature'`)
4. Push zum Branch (`git push origin feature/AmazingFeature`)
5. Öffne einen Pull Request

## 📞 Support

Bei Fragen oder Problemen:
- Öffne ein Issue auf GitHub
- Siehe die Dokumentation in `docs/`
- Prüfe die API-Dokumentation in `frontend/docs/`

---

**Version**: 1.0.0  
**Letzte Aktualisierung**: Dezember 2025

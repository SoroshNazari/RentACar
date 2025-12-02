# RentACar - Professionelle Autovermietungsplattform

Eine moderne, skalierbare Autovermietungsplattform mit klaren Trennungen zwischen Frontend und Backend.

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![Java](https://img.shields.io/badge/Java-17-orange)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)
![React](https://img.shields.io/badge/React-18-61dafb)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.2.0-brightgreen)

---

## 📋 Inhaltsverzeichnis

- [Übersicht](#übersicht)
- [Features](#features)
- [Voraussetzungen](#voraussetzungen)
- [Installation](#installation)
- [Setup & Konfiguration](#setup--konfiguration)
- [Entwicklung](#entwicklung)
- [Testing](#testing)
- [Build & Deployment](#build--deployment)
- [Dokumentation](#dokumentation)
- [Architektur](#architektur)
- [Sicherheit](#sicherheit)
- [Troubleshooting](#troubleshooting)

---

## 🎯 Übersicht

RentACar ist eine vollständige Autovermietungsplattform mit:

- **Backend:** Spring Boot 3.2.0 mit Java 17
- **Frontend:** React 18.3.1 mit TypeScript 5.9.3 und Vite 7.2.4
- **Datenbank:** H2 (Development) / PostgreSQL (Production)
- **Authentifizierung:** HTTP Basic Auth
- **Sicherheit:** DSGVO-konforme Verschlüsselung sensibler Daten
- **Testing:** Jest (Unit), Playwright (E2E), Integration Tests
- **Code Quality:** ESLint + Prettier konfiguriert
- **Performance:** Lighthouse Score 94% (Performance)
- **Coverage:** Frontend ≥70%, Backend ≥80%

---

## ✨ Features

### Für Kunden
- 🏠 **Homepage** mit Suchfunktion
- 🚗 **Fahrzeugsuche** nach Typ, Ort und Datum
- 📅 **Buchungssystem** mit Multi-Step-Flow
- 👤 **Dashboard** für Buchungsverwaltung
- 🔐 **Registrierung & Login**

### Für Mitarbeiter
- ✅ **Check-out** (Fahrzeugausgabe)
- ✅ **Check-in** (Fahrzeugrücknahme)
- 📊 **Buchungsübersicht** nach Datum
- 🔍 **Schadensverwaltung**

### Technisch
- 🧪 **Umfangreiche Tests** (Unit, Integration, E2E)
- 📊 **Code Coverage** >70% (Frontend), >80% (Backend)
- 🎨 **Code Quality** (ESLint + Prettier)
- ⚡ **Performance** optimiert (Lighthouse Score >90)
- ♿ **Accessibility** (WCAG-konform)

---

## 📦 Voraussetzungen

### System-Anforderungen

- **Java:** 17 oder höher
- **Node.js:** 18 oder höher
- **npm:** 9 oder höher
- **Gradle:** 8.0+ (wird mitgeliefert)
- **Docker:** Optional, für Container-Deployment

### Entwicklungstools (Empfohlen)

- **IDE:** IntelliJ IDEA / VS Code
- **Browser:** Chrome, Firefox, Safari (neueste Version)
- **Git:** Für Versionskontrolle

---

## 🚀 Installation

### 1. Repository klonen

```bash
git clone https://github.com/your-org/rentacar.git
cd rentacar
```

### 2. Dependencies installieren

#### Backend Dependencies

```bash
cd backend
./gradlew build
cd ..
```

**Hinweis:** Bei Windows verwende `gradlew.bat` statt `./gradlew`

#### Frontend Dependencies

```bash
cd frontend
npm install
cd ..
```

#### Root Dependencies (Optional)

```bash
npm install
```

---

## ⚙️ Setup & Konfiguration

### Backend Konfiguration

#### 1. Datenbank konfigurieren

Die Backend-Konfiguration befindet sich in `backend/src/main/resources/application.properties`:

```properties
# H2 Database (Development)
spring.datasource.url=jdbc:h2:file:./data/rentacardb
spring.datasource.driver-class-name=org.h2.Driver
spring.datasource.username=sa
spring.datasource.password=

# JPA
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=false
```

#### 2. Port konfigurieren

Standard-Port ist **8081**. Ändere in `application.properties`:

```properties
server.port=8081
```

#### 3. Verschlüsselung konfigurieren (Optional)

Für Production sollte Jasypt konfiguriert werden:

```properties
jasypt.encryptor.password=your-secret-password
```

### Frontend Konfiguration

#### 1. API Base URL

Standard ist `/api` (Proxy zu Backend). Ändere in `frontend/vite.config.ts`:

```typescript
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:8081',
      changeOrigin: true,
    },
  },
}
```

#### 2. Umgebungsvariablen (Optional)

Erstelle `frontend/.env`:

```env
VITE_API_BASE_URL=http://localhost:8081/api
```

---

## 💻 Entwicklung

### Backend starten

```bash
cd backend
./gradlew bootRun
```

Backend läuft auf: **http://localhost:8081**

**API Dokumentation:** http://localhost:8081/swagger-ui.html

### Frontend starten

```bash
cd frontend
npm run dev
```

Frontend läuft auf: **http://localhost:3000**

### Beide gleichzeitig starten

```bash
# Im Root-Verzeichnis
npm run dev
```

Oder mit separaten Terminals:

```bash
# Terminal 1: Backend
cd backend && ./gradlew bootRun

# Terminal 2: Frontend
cd frontend && npm run dev
```

---

## 🧪 Testing

### Backend Tests

```bash
cd backend

# Unit Tests
./gradlew test

# Mit Coverage Report
./gradlew jacocoTestReport
# Report: backend/build/reports/jacoco/test/html/index.html

# Integration Tests
./gradlew integrationTest
```

### Frontend Tests

```bash
cd frontend

# Unit Tests (Jest)
npm test

# Watch Mode
npm run test:watch

# Coverage Report (Ziel: ≥70%)
npm run test:coverage
# Aktuelle Coverage:
# - Statements: 82.05% ✅
# - Branches: 71.97% ✅
# - Functions: 80.97% ✅
# - Lines: 84.42% ✅
# Report: frontend/public/test-report/index.html

# Integration Tests (mit automatischem Server-Start)
npm run test:integration

# E2E Tests (Playwright, mit automatischem Server-Start)
npm run test:e2e

# E2E Tests mit UI
npm run test:e2e -- --ui
```

### Alle Tests

```bash
# Im Root-Verzeichnis
npm run test
```

---

## 🏗️ Build & Deployment

### Development Build

#### Backend

```bash
cd backend
./gradlew build
# JAR: backend/build/libs/rentacar-0.0.1-SNAPSHOT.jar
```

#### Frontend

```bash
cd frontend
npm run build
# Build: frontend/dist/
```

### Production Build

#### Backend

```bash
cd backend
./gradlew clean build -x test
./gradlew bootJar
```

#### Frontend

```bash
cd frontend
npm run build
# Optimierter Build mit Code Splitting
```

### Preview Production Build

```bash
cd frontend
npm run preview
# Läuft auf http://localhost:4173
```

### Docker Deployment

```bash
# Docker Images bauen
docker-compose build

# Services starten
docker-compose up -d

# Services stoppen
docker-compose down

# Logs anzeigen
docker-compose logs -f
```

**Docker Compose Datei:** `docker/docker-compose.yml`

---

## 📚 Dokumentation

### Verfügbare Dokumentation

- **API Dokumentation:** `frontend/docs/API_DOCUMENTATION.md` - Vollständige API-Referenz
- **User Guide:** `frontend/docs/USER_GUIDE.md` - Benutzerhandbuch
- **Projekt-Dokumentation:** `docs/project-documentation.md` - Vollständige Projektdokumentation
- **Technology Docs:** `docs/technology-documentation.md` - Technologie-Dokumentation (Context7, v2.0.0)
- **Test Coverage Report:** `docs/test-coverage-report.md` - Aktuelle Coverage-Statistiken
- **Dokumentations-Übersicht:** `docs/README.md` - Übersicht aller Dokumentationen
- **Code Quality:** `frontend/CODE_QUALITY_SETUP.md`
- **Performance:** `frontend/PERFORMANCE_OPTIMIZATIONS.md`

### API Dokumentation (Swagger)

Nach Start des Backends:

- **Swagger UI:** http://localhost:8081/swagger-ui.html
- **API JSON:** http://localhost:8081/v3/api-docs

---

## 🏛️ Architektur

### Projektstruktur

```
rentacar/
├── backend/                 # Spring Boot Backend
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/
│   │   │   │   └── de/rentacar/
│   │   │   │       ├── controllers/     # REST Controllers
│   │   │   │       ├── services/        # Business Logic
│   │   │   │       ├── repositories/    # Data Access
│   │   │   │       ├── models/          # Domain Models
│   │   │   │       └── config/          # Configuration
│   │   │   └── resources/
│   │   │       └── application.properties
│   │   └── test/            # Tests
│   └── build.gradle
├── frontend/                # React Frontend
│   ├── src/
│   │   ├── components/      # UI Components
│   │   ├── pages/           # Page Components
│   │   ├── services/        # API Client
│   │   ├── types/           # TypeScript Types
│   │   └── styles/          # CSS Styles
│   ├── e2e/                 # E2E Tests
│   ├── tests/               # Unit Tests
│   └── package.json
├── docs/                    # Dokumentation
├── docker/                  # Docker Configs
└── README.md
```

### Technologie-Stack

#### Backend
- **Framework:** Spring Boot 3.2.0
- **Language:** Java 17
- **Build Tool:** Gradle 8.0+
- **Database:** H2 (Dev) / PostgreSQL (Prod)
- **Security:** Spring Security, HTTP Basic Auth
- **API Docs:** SpringDoc OpenAPI (Swagger)

#### Frontend
- **Framework:** React 18
- **Language:** TypeScript 5.9
- **Build Tool:** Vite 7.2
- **Styling:** Tailwind CSS 3.4
- **Routing:** React Router 7.9
- **HTTP Client:** Axios 1.13
- **Testing:** Jest 30, Playwright 1.56

---

## 🔒 Sicherheit

### Authentifizierung

- **HTTP Basic Auth** für API-Zugriff
- Token wird in `localStorage` gespeichert
- Automatische Token-Entfernung bei 401-Fehlern

### Datenverschlüsselung

- **Sensible Daten** (Email, Phone, Address, DriverLicense) werden verschlüsselt
- **Jasypt** für Verschlüsselung
- **DSGVO-konform**

### Best Practices

- Input-Validierung auf Backend
- SQL Injection Schutz (JPA)
- XSS Schutz (React)
- HTTPS in Production

---

## 🐛 Troubleshooting

### Backend startet nicht

**Problem:** Port bereits belegt
```bash
# Lösung: Anderen Port verwenden
# In application.properties: server.port=8082
```

**Problem:** Java Version falsch
```bash
# Lösung: Java 17 installieren
java -version  # Sollte 17+ zeigen
```

### Frontend startet nicht

**Problem:** Port 3000 belegt
```bash
# Lösung: Anderen Port verwenden
cd frontend
npm run dev -- --port 3001
```

**Problem:** Dependencies fehlen
```bash
# Lösung: Neu installieren
cd frontend
rm -rf node_modules package-lock.json
npm install
```

### API-Verbindung fehlt

**Problem:** Backend läuft nicht
```bash
# Lösung: Backend starten
cd backend
./gradlew bootRun
```

**Problem:** CORS-Fehler
```bash
# Lösung: Backend CORS konfigurieren
# In SecurityConfig.java: .cors() aktivieren
```

### Tests schlagen fehl

**Problem:** Backend nicht erreichbar
```bash
# Lösung: Integration/E2E Tests starten automatisch Backend und Frontend
cd frontend
npm run test:integration  # Startet automatisch Backend + Frontend
npm run test:e2e          # Startet automatisch Backend + Frontend
```

**Problem:** Datenbank-Fehler
```bash
# Lösung: Datenbank zurücksetzen
rm -rf data/rentacardb.*
cd backend && ./gradlew bootRun
```

---

## 📊 Code Quality

### Linting & Formatting

```bash
# Frontend
cd frontend
npm run lint          # ESLint prüfen
npm run lint:fix      # Automatisch fixen
npm run format        # Prettier formatieren
npm run quality       # Alle Checks
```

### Coverage Reports

- **Backend:** `backend/build/reports/jacoco/test/html/index.html`
- **Frontend:** `frontend/coverage/lcov-report/index.html`

### Performance

```bash
# Lighthouse Report (Production Build)
cd frontend
npm run lighthouse:production
npm run lighthouse:visualize
# Öffne: frontend/lighthouse-metrics.html
```

**Aktuelle Lighthouse Scores:**
- **Performance:** 94% ✅
- **Accessibility:** 89%
- **Best Practices:** 100% ✅
- **SEO:** 92% ✅

---

## 🤝 Beitragen

### Development Workflow

1. **Branch erstellen**
   ```bash
   git checkout -b feature/amazing-feature
   ```

2. **Änderungen machen**
   - Code schreiben
   - Tests schreiben
   - Dokumentation aktualisieren

3. **Code Quality prüfen**
   ```bash
   npm run quality
   npm run test
   ```

4. **Commit & Push**
   ```bash
   git add .
   git commit -m "Add amazing feature"
   git push origin feature/amazing-feature
   ```

5. **Pull Request erstellen**

### Code Style

- **Java:** Google Java Style Guide
- **TypeScript:** Airbnb Style Guide
- **Formatting:** Prettier (Frontend)
- **Linting:** ESLint (Frontend)

---

## 📞 Support

Bei Fragen oder Problemen:

- **Issues:** GitHub Issues erstellen
- **Dokumentation:** `docs/` Verzeichnis
- **API Docs:** http://localhost:8081/swagger-ui.html

---

## 📄 Lizenz

Dieses Projekt ist unter der MIT-Lizenz lizenziert - siehe [LICENSE](LICENSE) Datei für Details.

---

## 👥 Team

- **Backend Team:** [Team-Mitglieder]
- **Frontend Team:** [Team-Mitglieder]
- **DevOps Team:** [Team-Mitglieder]

---

## 🎉 Danksagungen

- Spring Boot Team
- React Team
- Alle Contributors

---

**Happy Coding! 🚀**


Oder mit separaten Terminals:

```bash
# Terminal 1: Backend
cd backend && ./gradlew bootRun

# Terminal 2: Frontend
cd frontend && npm run dev
```

---

## 🧪 Testing

### Backend Tests

```bash
cd backend

# Unit Tests
./gradlew test

# Mit Coverage Report
./gradlew jacocoTestReport
# Report: backend/build/reports/jacoco/test/html/index.html

# Integration Tests
./gradlew integrationTest
```

### Frontend Tests

```bash
cd frontend

# Unit Tests (Jest)
npm test

# Watch Mode
npm run test:watch

# Coverage Report (Ziel: ≥70%)
npm run test:coverage
# Aktuelle Coverage:
# - Statements: 82.05% ✅
# - Branches: 71.97% ✅
# - Functions: 80.97% ✅
# - Lines: 84.42% ✅
# Report: frontend/public/test-report/index.html

# Integration Tests (mit automatischem Server-Start)
npm run test:integration

# E2E Tests (Playwright, mit automatischem Server-Start)
npm run test:e2e

# E2E Tests mit UI
npm run test:e2e -- --ui
```

### Alle Tests

```bash
# Im Root-Verzeichnis
npm run test
```

---

## 🏗️ Build & Deployment

### Development Build

#### Backend

```bash
cd backend
./gradlew build
# JAR: backend/build/libs/rentacar-0.0.1-SNAPSHOT.jar
```

#### Frontend

```bash
cd frontend
npm run build
# Build: frontend/dist/
```

### Production Build

#### Backend

```bash
cd backend
./gradlew clean build -x test
./gradlew bootJar
```

#### Frontend

```bash
cd frontend
npm run build
# Optimierter Build mit Code Splitting
```

### Preview Production Build

```bash
cd frontend
npm run preview
# Läuft auf http://localhost:4173
```

### Docker Deployment

```bash
# Docker Images bauen
docker-compose build

# Services starten
docker-compose up -d

# Services stoppen
docker-compose down

# Logs anzeigen
docker-compose logs -f
```

**Docker Compose Datei:** `docker/docker-compose.yml`

---

## 📚 Dokumentation

### Verfügbare Dokumentation

- **API Dokumentation:** `frontend/docs/API_DOCUMENTATION.md` - Vollständige API-Referenz
- **User Guide:** `frontend/docs/USER_GUIDE.md` - Benutzerhandbuch
- **Projekt-Dokumentation:** `docs/project-documentation.md` - Vollständige Projektdokumentation
- **Technology Docs:** `docs/technology-documentation.md` - Technologie-Dokumentation (Context7, v2.0.0)
- **Test Coverage Report:** `docs/test-coverage-report.md` - Aktuelle Coverage-Statistiken
- **Dokumentations-Übersicht:** `docs/README.md` - Übersicht aller Dokumentationen
- **Code Quality:** `frontend/CODE_QUALITY_SETUP.md`
- **Performance:** `frontend/PERFORMANCE_OPTIMIZATIONS.md`

### API Dokumentation (Swagger)

Nach Start des Backends:

- **Swagger UI:** http://localhost:8081/swagger-ui.html
- **API JSON:** http://localhost:8081/v3/api-docs

---

## 🏛️ Architektur

### Projektstruktur

```
rentacar/
├── backend/                 # Spring Boot Backend
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/
│   │   │   │   └── de/rentacar/
│   │   │   │       ├── controllers/     # REST Controllers
│   │   │   │       ├── services/        # Business Logic
│   │   │   │       ├── repositories/    # Data Access
│   │   │   │       ├── models/          # Domain Models
│   │   │   │       └── config/          # Configuration
│   │   │   └── resources/
│   │   │       └── application.properties
│   │   └── test/            # Tests
│   └── build.gradle
├── frontend/                # React Frontend
│   ├── src/
│   │   ├── components/      # UI Components
│   │   ├── pages/           # Page Components
│   │   ├── services/        # API Client
│   │   ├── types/           # TypeScript Types
│   │   └── styles/          # CSS Styles
│   ├── e2e/                 # E2E Tests
│   ├── tests/               # Unit Tests
│   └── package.json
├── docs/                    # Dokumentation
├── docker/                  # Docker Configs
└── README.md
```

### Technologie-Stack

#### Backend
- **Framework:** Spring Boot 3.2.0
- **Language:** Java 17
- **Build Tool:** Gradle 8.0+
- **Database:** H2 (Dev) / PostgreSQL (Prod)
- **Security:** Spring Security, HTTP Basic Auth
- **API Docs:** SpringDoc OpenAPI (Swagger)

#### Frontend
- **Framework:** React 18
- **Language:** TypeScript 5.9
- **Build Tool:** Vite 7.2
- **Styling:** Tailwind CSS 3.4
- **Routing:** React Router 7.9
- **HTTP Client:** Axios 1.13
- **Testing:** Jest 30, Playwright 1.56

---

## 🔒 Sicherheit

### Authentifizierung

- **HTTP Basic Auth** für API-Zugriff
- Token wird in `localStorage` gespeichert
- Automatische Token-Entfernung bei 401-Fehlern

### Datenverschlüsselung

- **Sensible Daten** (Email, Phone, Address, DriverLicense) werden verschlüsselt
- **Jasypt** für Verschlüsselung
- **DSGVO-konform**

### Best Practices

- Input-Validierung auf Backend
- SQL Injection Schutz (JPA)
- XSS Schutz (React)
- HTTPS in Production

---

## 🐛 Troubleshooting

### Backend startet nicht

**Problem:** Port bereits belegt
```bash
# Lösung: Anderen Port verwenden
# In application.properties: server.port=8082
```

**Problem:** Java Version falsch
```bash
# Lösung: Java 17 installieren
java -version  # Sollte 17+ zeigen
```

### Frontend startet nicht

**Problem:** Port 3000 belegt
```bash
# Lösung: Anderen Port verwenden
cd frontend
npm run dev -- --port 3001
```

**Problem:** Dependencies fehlen
```bash
# Lösung: Neu installieren
cd frontend
rm -rf node_modules package-lock.json
npm install
```

### API-Verbindung fehlt

**Problem:** Backend läuft nicht
```bash
# Lösung: Backend starten
cd backend
./gradlew bootRun
```

**Problem:** CORS-Fehler
```bash
# Lösung: Backend CORS konfigurieren
# In SecurityConfig.java: .cors() aktivieren
```

### Tests schlagen fehl

**Problem:** Backend nicht erreichbar
```bash
# Lösung: Integration/E2E Tests starten automatisch Backend und Frontend
cd frontend
npm run test:integration  # Startet automatisch Backend + Frontend
npm run test:e2e          # Startet automatisch Backend + Frontend
```

**Problem:** Datenbank-Fehler
```bash
# Lösung: Datenbank zurücksetzen
rm -rf data/rentacardb.*
cd backend && ./gradlew bootRun
```

---

## 📊 Code Quality

### Linting & Formatting

```bash
# Frontend
cd frontend
npm run lint          # ESLint prüfen
npm run lint:fix      # Automatisch fixen
npm run format        # Prettier formatieren
npm run quality       # Alle Checks
```

### Coverage Reports

- **Backend:** `backend/build/reports/jacoco/test/html/index.html`
- **Frontend:** `frontend/coverage/lcov-report/index.html`

### Performance

```bash
# Lighthouse Report (Production Build)
cd frontend
npm run lighthouse:production
npm run lighthouse:visualize
# Öffne: frontend/lighthouse-metrics.html
```

**Aktuelle Lighthouse Scores:**
- **Performance:** 94% ✅
- **Accessibility:** 89%
- **Best Practices:** 100% ✅
- **SEO:** 92% ✅

---

## 🤝 Beitragen

### Development Workflow

1. **Branch erstellen**
   ```bash
   git checkout -b feature/amazing-feature
   ```

2. **Änderungen machen**
   - Code schreiben
   - Tests schreiben
   - Dokumentation aktualisieren

3. **Code Quality prüfen**
   ```bash
   npm run quality
   npm run test
   ```

4. **Commit & Push**
   ```bash
   git add .
   git commit -m "Add amazing feature"
   git push origin feature/amazing-feature
   ```

5. **Pull Request erstellen**

### Code Style

- **Java:** Google Java Style Guide
- **TypeScript:** Airbnb Style Guide
- **Formatting:** Prettier (Frontend)
- **Linting:** ESLint (Frontend)

---

## 📞 Support

Bei Fragen oder Problemen:

- **Issues:** GitHub Issues erstellen
- **Dokumentation:** `docs/` Verzeichnis
- **API Docs:** http://localhost:8081/swagger-ui.html

---

## 📄 Lizenz

Dieses Projekt ist unter der MIT-Lizenz lizenziert - siehe [LICENSE](LICENSE) Datei für Details.

---

## 👥 Team

- **Backend Team:** [Team-Mitglieder]
- **Frontend Team:** [Team-Mitglieder]
- **DevOps Team:** [Team-Mitglieder]

---

## 🎉 Danksagungen

- Spring Boot Team
- React Team
- Alle Contributors

---

**Happy Coding! 🚀**

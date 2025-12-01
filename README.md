# RentACar - Professionelle Autovermietungsplattform

Eine moderne, skalierbare Autovermietungsplattform mit klaren Trennungen zwischen Frontend und Backend.

## 🏗️ Projektstruktur

```
rentacar/
├── backend/                 # Spring Boot Backend
│   ├── src/
│   │   ├── controllers/     # API-Endpunkte
│   │   ├── models/          # Datenmodelle
│   │   ├── services/        # Geschäftslogik
│   │   ├── config/          # Konfigurationen
│   │   └── middlewares/     # Custom Middleware
│   ├── tests/               # Unit- und Integrationstests
│   └── build.gradle         # Gradle-Konfiguration
├── frontend/                # React TypeScript Frontend
│   ├── src/
│   │   ├── components/      # UI-Komponenten
│   │   ├── pages/           # Seitenstruktur
│   │   ├── store/           # State Management
│   │   ├── services/        # API-Kommunikation
│   │   ├── assets/          # Statische Dateien
│   │   └── styles/          # Globale Styles
│   ├── tests/               # Komponententests
│   └── package.json         # Frontend-Abhängigkeiten
├── shared/                  # Gemeinsame Ressourcen
│   ├── types/               # Gemeinsame Typdefinitionen
│   └── utils/               # Gemeinsame Utilities
├── docker/                  # Container-Konfigurationen
├── scripts/                 # Build- und Deployment-Skripte
└── docs/                    # Projekt-Dokumentation
```

## 🚀 Schnellstart

### Voraussetzungen

- Java 17+
- Node.js 18+
- Docker (optional)

### Installation

```bash
# Repository klonen
git clone https://github.com/your-org/rentacar.git
cd rentacar

# Dependencies installieren
npm install

# Backend Dependencies
cd backend && ./gradlew build && cd ..

# Frontend Dependencies
cd frontend && npm install && cd ..
```

### Entwicklung

```bash
# Beide Anwendungen gleichzeitig starten
npm run dev

# Oder einzeln starten
npm run dev:backend  # Backend auf Port 8080
npm run dev:frontend # Frontend auf Port 3000
```

### Build

```bash
# Kompletten Build ausführen
npm run build

# Tests mit Coverage
npm run test:coverage
```

## 🧪 Testing

### Backend Tests
```bash
cd backend
./gradlew test                    # Unit Tests
./gradlew jacocoTestReport       # Coverage Report
```

### Frontend Tests
```bash
cd frontend
npm run test                      # Unit Tests
npm run test:coverage            # Coverage Report
npm run test:e2e                 # End-to-End Tests
```

### Alle Tests
```bash
npm run test                      # Alle Tests
npm run test:coverage            # Alle Tests mit Coverage
```

## 🐳 Docker Deployment

```bash
# Docker Images bauen
npm run docker:build

# Anwendung starten
npm run docker:up

# Anwendung stoppen
npm run docker:down
```

## 📊 Code Qualität

### Linting
```bash
npm run lint                      # Alle Linting-Checks
npm run lint:backend             # Backend Linting
npm run lint:frontend            # Frontend Linting
```

### Code Coverage
- Backend: `backend/build/reports/jacoco/test/html/index.html`
- Frontend: `frontend/coverage/lcov-report/index.html`

## 🔧 Konfiguration

### Backend Konfiguration
Die Backend-Konfiguration befindet sich in `backend/src/config/`. 

Wichtige Einstellungen:
- `application.properties` - Haupteinstellungen
- `SecurityConfig.java` - Sicherheitskonfiguration
- `application-{env}.properties` - Umgebungsspezifische Einstellungen

### Frontend Konfiguration
Die Frontend-Konfiguration befindet sich im `frontend/` Verzeichnis.

Wichtige Dateien:
- `vite.config.ts` - Vite Build-Konfiguration
- `tailwind.config.js` - Tailwind CSS Konfiguration
- `.env` - Umgebungsvariablen

## 📚 API Dokumentation

Die API-Dokumentation ist verfügbar unter:
- Lokale Entwicklung: http://localhost:8080/swagger-ui.html
- Produktion: https://your-domain.com/api/swagger-ui.html

## 🔒 Sicherheit

- JWT-basierte Authentifizierung
- HTTPS in Produktion
- Input Validierung
- SQL Injection Schutz
- XSS Schutz

## 📈 Monitoring

- Health Checks: `/actuator/health`
- Metriken: `/actuator/metrics`
- Logging: Konfigurierbar über application.properties

## 🤝 Beitragen

1. Fork erstellen
2. Feature Branch erstellen (`git checkout -b feature/amazing-feature`)
3. Commits erstellen (`git commit -m 'Add amazing feature'`)
4. Push zum Branch (`git push origin feature/amazing-feature`)
5. Pull Request erstellen

## 📝 Entwicklungsrichtlinien

### Code Style
- Java: Google Java Style Guide
- TypeScript: Airbnb Style Guide
- Consistente Einrückung (2 Spaces)
- Aussagekräftige Variablennamen

### Testing
- Mindestens 80% Code Coverage
- Unit Tests für alle Services
- Integration Tests für kritische Pfade
- E2E Tests für wichtige User Flows

### Dokumentation
- Javadoc für alle öffentlichen Methoden
- README für neue Features
- API Dokumentation aktuell halten

## 📄 Lizenz

Dieses Projekt ist unter der MIT-Lizenz lizenziert - siehe [LICENSE](LICENSE) Datei für Details.

## 👥 Team

- Backend Team: [Team-Mitglieder]
- Frontend Team: [Team-Mitglieder]
- DevOps Team: [Team-Mitglieder]

## 📞 Support

Bei Fragen oder Problemen:
- Erstelle ein Issue im Repository
- Kontaktiere das Entwicklungsteam
- Dokumentation prüfen

---

**Happy Coding! 🚀**
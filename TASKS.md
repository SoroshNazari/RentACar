# RentACar – Projekt-Anforderungen & Status

Diese Liste umfasst alle funktionalen und nicht-funktionalen Anforderungen des RentACar-Projekts sowie deren aktuellen Implementierungsstatus.

---

## 1. Kern-Funktionalitäten (Core Business)

### 🚗 Fahrzeugverwaltung (Inventory)
- [x] **Fahrzeug-CRUD**: Erstellen, Lesen, Aktualisieren, Löschen von Fahrzeugen
- [x] **Fahrzeug-Suche**: Filterung nach Typ, Marke, Verfügbarkeit
- [x] **Bilder-Upload**: Hochladen und Speichern von Fahrzeugbildern
- [x] **Filialen-Verwaltung**: Management von Standorten (Branches)
- [x] **Bestandsprüfung**: Validierung der Verfügbarkeit

### 👥 Kundenverwaltung (Customer)
- [x] **Registrierung**: Neuer Kunden-Account
- [x] **Profil-Management**: Daten aktualisieren
- [x] **Datenschutz**: Verschlüsselung sensibler Daten (PII) mittels `AttributeEncryptor`

### 📅 Buchungssystem (Booking)
- [x] **Buchung erstellen**: Reservierung für Zeitraum
- [x] **Preisberechnung**: Dynamische Preiskalkulation basierend auf Konfiguration
- [x] **Stornierung**: Buchung stornieren (durch Kunde oder Mitarbeiter)
- [x] **Status-Workflow**: PENDING -> CONFIRMED -> CANCELLED

### 🔑 Vermietungsprozess (Rental)
- [x] **Check-out (Abholung)**: Mietvertrag erstellen, Fahrzeugübergabe
- [x] **Check-in (Rückgabe)**: Fahrzeugrücknahme, Schadensprüfung
- [x] **Protokollierung**: Erfassung von Kilometerstand und Zustand
- [x] **Abrechnung**: Finalisierung des Mietvorgangs

### 📊 Reporting & Analyse
- [x] **Dashboard-Stats**: Umsatz, Auslastung, Buchungszahlen
- [x] **Export**: Datenbereitstellung für Analysen

---

## 2. Infrastruktur & Technik

### 🛡️ Sicherheit (Security)
- [x] **JWT Authentifizierung**: Stateless Auth mit Access Tokens
- [x] **RBAC**: Rollenbasierte Zugriffsrechte (ADMIN, EMPLOYEE, CUSTOMER)
- [x] **Rate Limiting**: Schutz vor Brute-Force/DDoS (Bucket4j)
- [x] **Audit Logging**: Protokollierung kritischer Aktionen

### 📧 Benachrichtigungen
- [x] **Email-Service**: Asynchroner Versand via SMTP
- [x] **Templates**: HTML-Templates für Buchungsbestätigungen etc.

### 💾 Datenhaltung & Storage
- [x] **Datenbank**: PostgreSQL (Prod) / H2 (Dev) Support
- [x] **File Storage**: Abstraktion für Local Filesystem & AWS S3
- [x] **Multi-Tenancy**: Mandantenfähigkeit (Tenant-Isolation)

### 🏗️ Architektur & Qualität
- [x] **Modular Monolith**: Klare Trennung der Domänen
- [x] **Exception Handling**: Globales Error-Handling (RFC 7807)
- [x] **API Dokumentation**: OpenAPI / Swagger UI (`/swagger-ui.html`)
- [x] **Testabdeckung**: > 90% Code Coverage (Unit & Integration)
- [x] **JavaDoc**: Vollständige Dokumentation aller Klassen

---

## 3. Roadmap (Zukünftige Erweiterungen)

Diese Punkte sind für zukünftige Releases geplant.

- [ ] **Monitoring**: Prometheus & Grafana Dashboards einrichten
- [ ] **Performance Tests**: Lasttests mit JMeter/Gatling
- [ ] **Security Audit**: Automatisierte Scans mit OWASP ZAP
- [ ] **Mobile Integration**: API-Erweiterungen für Mobile Apps
- [ ] **Payment Provider**: Integration von Stripe/PayPal für Echtzeit-Zahlungen

# Authentifizierung und Autorisierung - Implementierungsdokumentation

## Übersicht

Diese Dokumentation beschreibt die vollständige Implementierung der Authentifizierungs- und Autorisierungsanforderungen für das RentACar-Projekt.

## 1. Benutzerregistrierung

### 1.1 Passwort-Hashing
- **Algorithmus**: BCrypt (moderner, sicherer Hashing-Algorithmus)
- **Implementierung**: `PasswordEncoder` Bean in `SecurityConfig.java`
- **Code**: `new BCryptPasswordEncoder()`

### 1.2 Passwort-Komplexitätsanforderungen
- **Anforderungen**:
  - Mindestens 8 Zeichen
  - Mindestens ein Großbuchstabe
  - Mindestens ein Kleinbuchstabe
  - Mindestens eine Zahl
- **Implementierung**:
  - `@ValidPassword` Annotation in `backend/src/shared/validation/ValidPassword.java`
  - `PasswordConstraintValidator` in `backend/src/shared/validation/PasswordConstraintValidator.java`
  - Regex-Pattern: `^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z]).{8,}$`
- **Verwendung**: `@ValidPassword` Annotation auf `password` Feld in `RegisterCustomerRequest`

### 1.3 Account-Aktivierung via E-Mail
- **Implementierung**:
  - `EmailService` Interface in `backend/src/shared/service/EmailService.java`
  - `DummyEmailService` Implementierung in `backend/src/shared/service/DummyEmailService.java`
  - Aktivierungstoken wird bei Registrierung generiert und per E-Mail versendet
  - Token wird in `User` Entity gespeichert (`activationToken` Feld)
  - Account ist standardmäßig deaktiviert (`enabled = false`)
- **Aktivierungs-Endpunkt**: `POST /api/customers/activate?token={token}`
- **Dummy-Service**: Loggt Aktivierungs-Link in die Konsole (für Entwicklung)

## 2. Login

### 2.1 Session-basierte Authentifizierung
- **Implementierung**: Spring Security Session-Management
- **Konfiguration**: `SessionCreationPolicy.IF_REQUIRED` in `SecurityConfig.java`
- **Session-Timeout**: 30 Minuten (konfiguriert in `application.properties`)
- **Spring Security 6 Best Practice**: In Spring Security 6 wird `SessionManagementFilter` standardmäßig nicht verwendet. Die Authentifizierungsmechanismen selbst rufen die `SessionAuthenticationStrategy` auf, was bedeutet, dass die `HttpSession` nicht für jeden Request gelesen werden muss, was die Performance verbessert.

### 2.2 Rate Limiting für Login-Versuche
- **Implementierung**: `LoginAttemptService` in `backend/src/shared/security/LoginAttemptService.java`
- **Regeln**:
  - Max. 5 fehlgeschlagene Versuche in 15 Minuten
  - Blockierung sowohl IP-basiert als auch Benutzername-basiert
  - Automatische Freigabe nach 15 Minuten
- **HTTP-Status**: 429 (Too Many Requests) bei Blockierung
- **Integration**: In `AuthController.login()` integriert

## 3. Rollenbasierte Zugriffskontrolle (RBAC)

### 3.1 Benutzerrollen
Das System definiert drei Rollen:
- **ROLE_CUSTOMER**: Standard-Kunde
- **ROLE_EMPLOYEE**: Mitarbeiter
- **ROLE_ADMIN**: Administrator

### 3.2 Rechtematrix

| Aktion | CUSTOMER | EMPLOYEE | ADMIN |
|--------|----------|----------|-------|
| Fahrzeuge anzeigen | ✅ | ✅ | ✅ |
| Fahrzeuge suchen | ✅ | ✅ | ✅ |
| Eigene Buchungen anzeigen | ✅ | ✅ | ✅ |
| Buchung erstellen | ✅ | ✅ | ✅ |
| Eigene Buchung stornieren | ✅ | ✅ | ✅ |
| Alle Buchungen anzeigen | ❌ | ✅ | ✅ |
| Buchung bestätigen | ❌ | ✅ | ✅ |
| Buchung stornieren (alle) | ❌ | ✅ | ✅ |
| Fahrzeuge verwalten (CRUD) | ❌ | ✅ | ✅ |
| Check-in/Check-out | ❌ | ✅ | ✅ |
| Kundendaten aktualisieren | ❌ | ✅ | ✅ |
| Schadensberichte erstellen | ❌ | ✅ | ✅ |
| Benutzerverwaltung | ❌ | ❌ | ✅ |
| Systemkonfiguration | ❌ | ❌ | ✅ |

### 3.3 Guards/PreAuthorize
- **Implementierung**: `@PreAuthorize` Annotationen auf Controller-Methoden
- **Beispiele**:
  - `@PreAuthorize("hasAnyRole('EMPLOYEE', 'ADMIN')")` - Nur Mitarbeiter und Admin
  - `@PreAuthorize("hasRole('ADMIN')")` - Nur Admin
  - `@PreAuthorize("isAuthenticated()")` - Jeder authentifizierte Benutzer

## 4. Sichere Session-Verwaltung

### 4.1 Session-Timeout
- **Konfiguration**: `server.servlet.session.timeout=30m` in `application.properties`
- **Verhalten**: Session wird nach 30 Minuten Inaktivität automatisch abgelaufen
- **Redirect**: Bei abgelaufener Session wird zu `/api/auth/login?expired=true` weitergeleitet

### 4.2 Logout-Funktionalität
- **Endpunkt**: `POST /api/auth/logout`
- **Funktionalität**:
  - Session wird serverseitig invalidiert (`invalidateHttpSession(true)`)
  - Session-Cookie wird gelöscht (`deleteCookies("JSESSIONID")`)
  - HTTP 200 OK Response

### 4.3 Sichere Cookie-Flags
- **Konfiguration** in `application.properties`:
  - `server.servlet.session.cookie.http-only=true` - Verhindert JavaScript-Zugriff
  - `server.servlet.session.cookie.secure=true` - Nur über HTTPS (in Produktion)
  - `server.servlet.session.cookie.same-site=Lax` - CSRF-Schutz
- **Zusätzliche Sicherheit**:
  - Session-Fixation-Schutz (`sessionFixation().migrateSession()`)
  - Max. 1 aktive Session pro Benutzer (`maximumSessions(1)`)
- **Spring Security 6 Session Management**: Spring Security hat nichts mit der Wartung der Session oder der Bereitstellung von Session-IDs zu tun. Dies wird vollständig vom Servlet-Container gehandhabt. Spring Security verwaltet nur die Authentifizierungsinformationen innerhalb der Session.

## 5. Zusätzliche Sicherheitsfeatures

### 5.1 GlobalExceptionHandler
- **Datei**: `backend/src/shared/web/GlobalExceptionHandler.java`
- **Funktionalität**:
  - Zentrale Behandlung von Validierungsfehlern
  - Strukturierte Fehlerantworten
  - HTTP-Status-Codes entsprechend Fehlertyp

### 5.2 Account-Aktivierung
- **Workflow**:
  1. Benutzer registriert sich
  2. Account wird mit `enabled=false` erstellt
  3. Aktivierungstoken wird generiert und per E-Mail versendet
  4. Benutzer klickt auf Link in E-Mail
  5. Account wird aktiviert (`enabled=true`)
  6. Token wird gelöscht

## 6. Technische Details

### 6.1 Abhängigkeiten
- Spring Security 6.5 (Session Management, Authentication, Authorization)
- Spring Boot Starter Validation
- BCrypt Password Encoder (in Spring Security enthalten)
- Axios (Frontend HTTP Client mit `withCredentials` für Session-Cookies)

### 6.3 Frontend HTTP Client (Axios)
- **Konfiguration**: `withCredentials: true` in Axios-Instanz
- **Zweck**: Ermöglicht das Senden von Session-Cookies bei Cross-Origin-Requests
- **CORS**: Backend muss `Access-Control-Allow-Credentials: true` setzen
- **Interceptors**: Können für automatische Token-Aktualisierung oder Retry-Logik bei 401-Fehlern verwendet werden

### 6.2 Dateistruktur
```
backend/src/
├── config/
│   └── SecurityConfig.java          # Haupt-Security-Konfiguration
├── controllers/
│   ├── AuthController.java          # Login/Logout
│   └── CustomerController.java     # Registrierung/Aktivierung
├── services/
│   └── CustomerService.java        # Business-Logik
├── shared/
│   ├── security/
│   │   ├── LoginAttemptService.java # Rate Limiting
│   │   ├── CustomUserDetailsService.java
│   │   └── User.java                # User Entity
│   ├── validation/
│   │   ├── ValidPassword.java       # Passwort-Validierung
│   │   └── PasswordConstraintValidator.java
│   ├── service/
│   │   ├── EmailService.java        # E-Mail Interface
│   │   └── DummyEmailService.java  # Dummy-Implementierung
│   └── web/
│       └── GlobalExceptionHandler.java
└── models/
    └── UserRepository.java           # User Repository
```

## 7. Testen

### 7.1 Registrierung testen
```bash
POST /api/customers/register
{
  "username": "testuser",
  "password": "Test1234",  # Muss Komplexitätsanforderungen erfüllen
  "firstName": "Test",
  "lastName": "User",
  "email": "test@example.com",
  "phone": "123456789",
  "address": "Teststraße 1",
  "driverLicenseNumber": "DL123456"
}
```

### 7.2 Account aktivieren
```bash
POST /api/customers/activate?token={token}
# Token wird in der Konsole ausgegeben (DummyEmailService)
```

### 7.3 Login testen
```bash
POST /api/auth/login
{
  "username": "testuser",
  "password": "Test1234"
}
```

### 7.4 Rate Limiting testen
- 5 fehlgeschlagene Login-Versuche innerhalb von 15 Minuten
- 6. Versuch sollte HTTP 429 zurückgeben

## 8. Zusammenfassung

Alle Anforderungen wurden implementiert:
- ✅ Passwort-Hashing mit BCrypt
- ✅ Passwort-Komplexitätsanforderungen
- ✅ Account-Aktivierung via E-Mail (Dummy-Service)
- ✅ Session-basierte Authentifizierung
- ✅ Rate Limiting (max. 5 Versuche in 15 Minuten)
- ✅ RBAC mit 3 Rollen
- ✅ Rechtematrix dokumentiert
- ✅ Guards/PreAuthorize implementiert
- ✅ Session-Timeout (30 Minuten)
- ✅ Logout-Funktionalität
- ✅ Sichere Cookie-Flags (HttpOnly, Secure, SameSite)


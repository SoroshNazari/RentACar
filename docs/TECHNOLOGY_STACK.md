# Technology Stack - Aktuelle Implementierung

## Backend

### Spring Security 6.5
- **Session Management**: Spring Security 6 verwendet standardmäßig keine `SessionManagementFilter` mehr. Authentifizierungsmechanismen rufen direkt die `SessionAuthenticationStrategy` auf, was die Performance verbessert.
- **Dokumentation**: [Spring Security 6.5 Reference](https://docs.spring.io/spring-security/reference/6.5/)
- **Best Practices**:
  - Session-Timeout konfiguriert über `application.properties`
  - Cookie-Flags für Sicherheit (HttpOnly, Secure, SameSite)
  - Concurrent Session Control für maximale Anzahl aktiver Sessions

### Spring Boot
- **Version**: Aktuelle Spring Boot Version
- **Features**: 
  - Auto-Configuration
  - Embedded Tomcat Server
  - JPA/Hibernate für Datenbankzugriff

## Frontend

### React Router
- **Version**: React Router 7+
- **Features**:
  - Deklarative Navigation mit `<Link>` und `useNavigate()`
  - Route Guards durch bedingtes Rendering
  - Lazy Loading von Route-Komponenten
  - Protected Routes basierend auf Authentifizierungsstatus
- **Best Practices**:
  - Verwendung von `location.state` zur Speicherung der vorherigen Route nach Login
  - `navigate("...", { replace: true })` um Login-Route aus History zu entfernen
  - Middleware für zentrale Authentifizierungsprüfung (zukünftige Verbesserung)
- **Dokumentation**: [React Router Documentation](https://reactrouter.com/)

### Axios
- **Version**: Aktuelle Axios Version
- **Konfiguration**:
  - `withCredentials: true` für Session-Cookie-Unterstützung
  - Base URL: `/api`
  - Response/Request Interceptors für Fehlerbehandlung
- **Best Practices**:
  - Interceptors für automatische Token-Aktualisierung bei 401-Fehlern
  - Retry-Logik bei Netzwerkfehlern
  - Zentrale Fehlerbehandlung
- **Dokumentation**: [Axios Documentation](https://axios-http.com/)

### React
- **Version**: React 18+
- **Features**:
  - Hooks (`useState`, `useEffect`, `useMemo`)
  - Lazy Loading mit `React.lazy()` und `Suspense`
  - Context API für globale Zustandsverwaltung

## Datenbank

### H2 Database
- **Zweck**: In-Memory-Datenbank für Entwicklung
- **Features**: 
  - JPA/Hibernate Integration
  - Verschlüsselte Felder für DSGVO-Konformität

## Sicherheit

### Verschlüsselung
- **Jasypt**: Für Verschlüsselung sensibler Daten (E-Mail, Telefon, Adresse)
- **BCrypt**: Für Passwort-Hashing

### CORS
- **Konfiguration**: Erlaubt Requests von `localhost:3000`, `localhost:5173`, `localhost:5174`
- **Credentials**: `Access-Control-Allow-Credentials: true` für Session-Cookies

## Build Tools

### Backend
- **Gradle**: Build-Tool für Java/Spring Boot
- **Spring Boot Gradle Plugin**: Für `bootRun` Task

### Frontend
- **Vite**: Build-Tool und Dev-Server
- **TypeScript**: Type-Safety
- **Tailwind CSS**: Utility-First CSS Framework

## Testing

### Backend
- JUnit für Unit-Tests
- Spring Boot Test für Integration-Tests

### Frontend
- React Testing Library (geplant)
- E2E Tests (geplant)

## Referenzen

- [Spring Security 6.5 Reference](https://docs.spring.io/spring-security/reference/6.5/)
- [React Router Documentation](https://reactrouter.com/)
- [Axios Documentation](https://axios-http.com/)
- [Spring Boot Documentation](https://spring.io/projects/spring-boot)


# Frontend Rollenrechte - Übersicht

> **Hinweis**: Diese Implementierung verwendet React Router für die Navigation und Route-Schutz. React Router ermöglicht deklarative Navigation, geschützte Routen und nahtlose Integration mit Authentifizierungsmechanismen.

## Navigation im Header (Layout.tsx)

### ROLE_CUSTOMER (Kunde)
- ✅ **Profil** → `/dashboard` (eigene Buchungen, Profildaten)
- ✅ **Über uns** → `/about`
- ✅ **Abmelden**

**Zugriff auf Seiten:**
- ✅ `/dashboard` - Eigene Buchungen und Profil
- ✅ `/vehicles` - Fahrzeuge durchsuchen
- ✅ `/vehicle/:id` - Fahrzeugdetails
- ✅ `/booking/:vehicleId` - Buchung erstellen
- ❌ `/employee/*` - Kein Zugriff

### ROLE_EMPLOYEE (Mitarbeiter)
- ✅ **Fahrzeuge** → `/employee/vehicles` (Fahrzeugverwaltung)
- ✅ **Fahrzeugausgabe** → `/employee` (Check-out)
- ✅ **Fahrzeugrücknahme** → `/employee/checkin` (Check-in)
- ✅ **Über uns** → `/about`
- ✅ **Abmelden**

**Zugriff auf Seiten:**
- ✅ `/employee/vehicles` - Fahrzeuge verwalten (hinzufügen, bearbeiten, Standort ändern)
- ✅ `/employee` - Fahrzeugausgabe (Check-out)
- ✅ `/employee/checkin` - Fahrzeugrücknahme (Check-in)
- ✅ `/vehicles` - Fahrzeuge durchsuchen
- ✅ `/vehicle/:id` - Fahrzeugdetails
- ❌ `/dashboard` - Kein Zugriff (nur für Kunden)

### ROLE_ADMIN (Administrator)
- ✅ **Profil** → `/dashboard` (kann auch Kunden-Funktionen nutzen)
- ✅ **Fahrzeuge** → `/employee/vehicles` (Fahrzeugverwaltung)
- ✅ **Fahrzeugausgabe** → `/employee` (Check-out)
- ✅ **Fahrzeugrücknahme** → `/employee/checkin` (Check-in)
- ✅ **Über uns** → `/about`
- ✅ **Abmelden**

**Zugriff auf Seiten:**
- ✅ `/dashboard` - Profil und Buchungen (wie CUSTOMER)
- ✅ `/employee/vehicles` - Fahrzeuge verwalten (wie EMPLOYEE)
- ✅ `/employee` - Fahrzeugausgabe (wie EMPLOYEE)
- ✅ `/employee/checkin` - Fahrzeugrücknahme (wie EMPLOYEE)
- ✅ `/vehicles` - Fahrzeuge durchsuchen
- ✅ `/vehicle/:id` - Fahrzeugdetails
- ✅ `/booking/:vehicleId` - Buchung erstellen

## Seiten-Zugriffskontrolle

> **React Router Best Practices**: Die Route-Schutz-Implementierung verwendet `useNavigate()` und bedingte Rendering-Logik basierend auf der Benutzerrolle. Für zukünftige Verbesserungen könnte `middleware` in React Router verwendet werden, um Authentifizierung zentral zu handhaben.

### CustomerDashboardPage
- ✅ **ROLE_CUSTOMER**: Vollzugriff
- ✅ **ROLE_ADMIN**: Vollzugriff (kann auch Kunden-Funktionen nutzen)
- ❌ **ROLE_EMPLOYEE**: Kein Zugriff

### VehicleManagementPage
- ✅ **ROLE_EMPLOYEE**: Vollzugriff
- ✅ **ROLE_ADMIN**: Vollzugriff
- ❌ **ROLE_CUSTOMER**: Kein Zugriff

### EmployeeCheckoutPage
- ✅ **ROLE_EMPLOYEE**: Vollzugriff
- ✅ **ROLE_ADMIN**: Vollzugriff
- ❌ **ROLE_CUSTOMER**: Kein Zugriff

### EmployeeCheckinPage
- ✅ **ROLE_EMPLOYEE**: Vollzugriff
- ✅ **ROLE_ADMIN**: Vollzugriff
- ❌ **ROLE_CUSTOMER**: Kein Zugriff

## Zusammenfassung

| Feature | CUSTOMER | EMPLOYEE | ADMIN |
|---------|----------|----------|-------|
| Profil/Dashboard | ✅ | ❌ | ✅ |
| Fahrzeuge suchen | ✅ | ✅ | ✅ |
| Buchung erstellen | ✅ | ✅ | ✅ |
| Fahrzeugverwaltung | ❌ | ✅ | ✅ |
| Fahrzeugausgabe | ❌ | ✅ | ✅ |
| Fahrzeugrücknahme | ❌ | ✅ | ✅ |

**Hinweis:** ADMIN hat alle Rechte von CUSTOMER und EMPLOYEE kombiniert.


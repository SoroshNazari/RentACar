# Integration Tests

## Übersicht

Diese Integration Tests testen die **Integration zwischen Frontend und realem Backend**.

**WICHTIG: KEINE MOCKS werden verwendet!**

- Alle API-Aufrufe gehen an das echte Backend
- React-Komponenten werden mit echtem Backend getestet
- Echte HTTP-Requests werden gemacht

## Voraussetzungen

1. **Backend muss laufen** auf `http://localhost:8081`
2. **Datenbank muss befüllt sein** mit Testdaten (via DataInitializer)
3. **Testdaten müssen vorhanden sein:**
   - User: `customer` / `customer123`
   - Fahrzeuge: 50+ Fahrzeuge in verschiedenen Städten

## Test-Dateien

### `frontend-backend.integration.test.tsx`
**Frontend-Komponenten mit realem Backend**

- Testet React-Komponenten (VehicleListPage, LoginPage) mit echtem Backend
- Verwendet **KEINE Mocks** - echte API-Aufrufe
- Prüft dass Komponenten korrekt mit Backend kommunizieren
- Prüft deutsche Fahrzeugdaten

### `vehicles.integration.test.ts`
**Backend API direkt**

- Testet Backend-API direkt (ohne Frontend-Komponenten)
- Verwendet `axios` für direkte HTTP-Requests
- Prüft API-Endpunkte und Antworten

## Ausführung

```bash
# Integration Tests ausführen
npm run test:integration
```

**Hinweis:** Tests werden übersprungen, wenn Backend nicht verfügbar ist.

## Unterschied zu anderen Tests

| Test-Typ | Mocks? | Backend | Frontend |
|----------|--------|---------|----------|
| **Unit Tests** | ✅ Ja | ❌ Gemockt | ✅ Komponenten |
| **Integration Tests** | ❌ Nein | ✅ Real | ✅ Komponenten |
| **E2E Tests** | ❌ Nein | ✅ Real | ✅ Browser |

## Beispiel: Integration Test

```typescript
// ❌ FALSCH (Unit Test mit Mock):
jest.mock('@/services/api', () => ({
  api: { getAllVehicles: jest.fn() }
}))

// ✅ RICHTIG (Integration Test ohne Mock):
// Keine Mocks! Echte API-Aufrufe
const vehicles = await api.getAllVehicles()
```

## Troubleshooting

### Backend nicht verfügbar
- Starte Backend: `cd backend && ./gradlew bootRun`
- Prüfe Port: `curl http://localhost:8081/api/vehicles`

### Tests werden übersprungen
- Das ist normal, wenn Backend nicht läuft
- Tests prüfen automatisch ob Backend verfügbar ist

### Timeout-Fehler
- Backend braucht Zeit zum Starten
- Integration Tests haben längere Timeouts (15s)


## Übersicht

Diese Integration Tests testen die **Integration zwischen Frontend und realem Backend**.

**WICHTIG: KEINE MOCKS werden verwendet!**

- Alle API-Aufrufe gehen an das echte Backend
- React-Komponenten werden mit echtem Backend getestet
- Echte HTTP-Requests werden gemacht

## Voraussetzungen

1. **Backend muss laufen** auf `http://localhost:8081`
2. **Datenbank muss befüllt sein** mit Testdaten (via DataInitializer)
3. **Testdaten müssen vorhanden sein:**
   - User: `customer` / `customer123`
   - Fahrzeuge: 50+ Fahrzeuge in verschiedenen Städten

## Test-Dateien

### `frontend-backend.integration.test.tsx`
**Frontend-Komponenten mit realem Backend**

- Testet React-Komponenten (VehicleListPage, LoginPage) mit echtem Backend
- Verwendet **KEINE Mocks** - echte API-Aufrufe
- Prüft dass Komponenten korrekt mit Backend kommunizieren
- Prüft deutsche Fahrzeugdaten

### `vehicles.integration.test.ts`
**Backend API direkt**

- Testet Backend-API direkt (ohne Frontend-Komponenten)
- Verwendet `axios` für direkte HTTP-Requests
- Prüft API-Endpunkte und Antworten

## Ausführung

```bash
# Integration Tests ausführen
npm run test:integration
```

**Hinweis:** Tests werden übersprungen, wenn Backend nicht verfügbar ist.

## Unterschied zu anderen Tests

| Test-Typ | Mocks? | Backend | Frontend |
|----------|--------|---------|----------|
| **Unit Tests** | ✅ Ja | ❌ Gemockt | ✅ Komponenten |
| **Integration Tests** | ❌ Nein | ✅ Real | ✅ Komponenten |
| **E2E Tests** | ❌ Nein | ✅ Real | ✅ Browser |

## Beispiel: Integration Test

```typescript
// ❌ FALSCH (Unit Test mit Mock):
jest.mock('@/services/api', () => ({
  api: { getAllVehicles: jest.fn() }
}))

// ✅ RICHTIG (Integration Test ohne Mock):
// Keine Mocks! Echte API-Aufrufe
const vehicles = await api.getAllVehicles()
```

## Troubleshooting

### Backend nicht verfügbar
- Starte Backend: `cd backend && ./gradlew bootRun`
- Prüfe Port: `curl http://localhost:8081/api/vehicles`

### Tests werden übersprungen
- Das ist normal, wenn Backend nicht läuft
- Tests prüfen automatisch ob Backend verfügbar ist

### Timeout-Fehler
- Backend braucht Zeit zum Starten
- Integration Tests haben längere Timeouts (15s)


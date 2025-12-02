# RentACar - Technologie-Dokumentation

**Version:** 2.0.0  
**Datum:** 2025-12-02  
**Quelle:** Context7 - Offizielle Bibliotheksdokumentation (Aktualisiert)

---

## Inhaltsverzeichnis

1. [Spring Boot](#1-spring-boot)
2. [React](#2-react)
3. [Vite](#3-vite)
4. [Playwright](#4-playwright)
5. [Jest](#5-jest)
6. [TypeScript](#6-typescript)
7. [Weitere Technologien](#7-weitere-technologien)

---

## 1. Spring Boot

### 1.1 Überblick

Spring Boot ist ein Framework für die Entwicklung von stand-alone, production-ready Spring-basierten Anwendungen. Es bietet:

- **Embedded Server**: Integrierte Server (Tomcat, Jetty, Undertow)
- **Auto-Configuration**: Automatische Konfiguration basierend auf Classpath
- **Production-Ready Features**: Monitoring, Metrics, Health Checks
- **Minimal Configuration**: Konvention über Konfiguration
- **RestClient**: Funktionaler, imperativer API-Stil für REST-Services

### 1.2 Verwendung im Projekt

**Version:** 3.2.0  
**Java Version:** 17

#### Hauptfunktionen im RentACar-Projekt:

- **Spring Boot Starter Web**: REST API Endpunkte
- **Spring Boot Starter Data JPA**: Datenbankzugriff mit JPA/Hibernate
- **Spring Boot Starter Security**: Authentifizierung und Autorisierung
- **Spring Boot Starter Validation**: Validierung von Eingabedaten

#### Konfiguration:

```properties
# application.properties
spring.application.name=rentacar
server.port=8081
spring.jpa.hibernate.ddl-auto=update
spring.datasource.url=jdbc:h2:file:./data/rentacardb
```

#### @SpringBootApplication Annotation:

Die `@SpringBootApplication` Annotation kombiniert drei wichtige Features:

1. **@EnableAutoConfiguration**: Aktiviert Spring Boot's Auto-Configuration-Mechanismus
2. **@ComponentScan**: Aktiviert Component-Scan im Package der Anwendung
3. **@SpringBootConfiguration**: Ermöglicht die Registrierung zusätzlicher Beans

```java
@SpringBootApplication
public class RentACarApplication {
    public static void main(String[] args) {
        SpringApplication.run(RentACarApplication.class, args);
    }
}
```

#### RestClient (Spring Boot 3.2+):

Wenn Sie nicht Spring WebFlux oder Project Reactor verwenden, wird empfohlen, `RestClient` für REST-Service-Aufrufe zu nutzen:

```java
@Autowired
private RestClient.Builder restClientBuilder;

public void callExternalAPI() {
    RestClient restClient = restClientBuilder.build();
    String response = restClient.get()
        .uri("https://api.example.com/data")
        .retrieve()
        .body(String.class);
}
```

### 1.3 Best Practices

- **Auto-Configuration nutzen**: Spring Boot konfiguriert automatisch basierend auf Dependencies
- **Profiles verwenden**: Verschiedene Konfigurationen für Development, Test, Production
- **Actuator für Monitoring**: Health Checks und Metrics für Production
- **Starter Dependencies**: Nutze Spring Boot Starters statt manueller Dependency-Management
- **RestClient für HTTP-Calls**: Funktionaler API-Stil für REST-Services
- **Configuration Properties**: Nutze `spring.http.serviceclient.<group-name>` für HTTP-Client-Konfiguration

---

## 2. React

### 2.1 Überblick

React ist eine JavaScript-Bibliothek zum Erstellen von Benutzeroberflächen. Es verwendet:

- **Komponenten-basierte Architektur**: Wiederverwendbare UI-Komponenten
- **Virtual DOM**: Effizientes Rendering durch Virtual DOM
- **Hooks**: Funktionale Komponenten mit State und Side Effects
- **Unidirektionaler Datenfluss**: Props down, Events up
- **React Compiler**: Optimiert Re-Renders automatisch (React 19+)

### 2.2 Verwendung im Projekt

**Version:** 18.3.1

#### Hauptfunktionen im RentACar-Projekt:

- **React Router DOM 7.9.6**: Client-side Routing
- **React Hooks**: `useState`, `useEffect`, `useNavigate`, `useParams`
- **Komponenten**: Seiten, Layout, Formulare
- **Lazy Loading**: Code Splitting mit `React.lazy()` und `Suspense`

#### Wichtige React-Regeln (Rules of React):

> **React Rules:**
> - **Komponenten und Hooks müssen pure sein**: Keine Side Effects während des Renders
> - **Hooks nur am Top-Level**: Hooks müssen am Anfang der Komponente aufgerufen werden, nicht in Loops oder Conditions
> - **Keine dynamischen Hooks**: Hooks können nicht dynamisch erstellt werden
> - **Side Effects in useEffect**: Side Effects müssen in `useEffect` ausgeführt werden, nicht während des Renders

#### Beispiel aus dem Projekt:

```typescript
// ✅ Korrekt: Hook am Top-Level
function VehicleDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [vehicle, setVehicle] = useState(null)
  
  useEffect(() => {
    // Fetch vehicle data - Side Effect gehört in useEffect
    loadVehicle()
  }, [id])
  
  return <div>...</div>
}

// ❌ Falsch: Hook in Condition
function BadComponent({ condition }) {
  if (condition) {
    const [state, setState] = useState(null) // FEHLER!
  }
}
```

### 2.3 Hooks im Projekt

#### State Hooks:
- `useState`: Lokaler State in Komponenten
- `useEffect`: Side Effects (API Calls, Subscriptions)
- `useNavigate`: Navigation zwischen Seiten
- `useParams`: URL-Parameter lesen
- `useLocation`: Aktuelle Location-Informationen

#### Custom Hooks:
- Können erstellt werden, um Logik zwischen Komponenten zu teilen
- Müssen mit `use` beginnen
- Können andere Hooks verwenden
- Folgen den gleichen Rules of Hooks

#### useEffect Best Practices:

```typescript
// ✅ Korrekt: Dependency Array korrekt gesetzt
useEffect(() => {
  // Effect code
}, [dependency1, dependency2])

// ✅ Korrekt: Ref in Effect, nicht in Dependency Array
useEffect(() => {
  const value = ref.current // Zugriff auf ref.current innerhalb des Effects
  // ...
}, [ref]) // ref selbst, nicht ref.current

// ❌ Falsch: ref.current in Dependency Array
useEffect(() => {
  // ...
}, [ref.current]) // FEHLER!
```

### 2.4 Best Practices

- **Komponenten klein halten**: Eine Komponente, eine Verantwortung
- **Props validieren**: TypeScript für Type Safety
- **Keys bei Listen**: Immer `key` Prop bei `.map()` verwenden
- **Conditional Rendering**: Nutze `&&` oder Ternary Operators
- **Performance**: `useMemo` und `useCallback` für teure Berechnungen
- **Lazy Loading**: Nutze `React.lazy()` für Code Splitting
- **StrictMode nur in Development**: Für bessere Performance in Production

---

## 3. Vite

### 3.1 Überblick

Vite ist ein modernes Frontend-Build-Tool, das:

- **Instant Server Start**: Sofortiger Dev-Server-Start durch native ES Modules
- **Lightning-fast HMR**: Schnelles Hot Module Replacement
- **Optimized Builds**: Optimierte Production-Builds mit Rollup
- **Zero Config**: Funktioniert out-of-the-box
- **Conditional Config**: Konfiguration basierend auf Command und Mode

### 3.2 Verwendung im Projekt

**Version:** 7.2.4

#### Konfiguration (`vite.config.ts`):

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:8081',
        changeOrigin: true,
      },
    },
  },
  build: {
    target: 'esnext',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            if (id.includes('react')) return 'vendor-react'
            return 'vendor-other'
          }
        },
      },
    },
  },
})
```

#### Conditional Configuration:

Vite unterstützt bedingte Konfiguration basierend auf Command (`serve` oder `build`), Mode, SSR-Build oder Preview:

```typescript
export default defineConfig(({ command, mode, isSsrBuild, isPreview }) => {
  if (command === 'serve') {
    return {
      // Development-Konfiguration
      server: { port: 3000 }
    }
  } else {
    return {
      // Production-Build-Konfiguration
      build: { minify: 'terser' }
    }
  }
})
```

#### Plugin Configuration:

Plugins können für spezifische Phasen konfiguriert werden:

```typescript
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [
    {
      ...somePlugin(),
      apply: 'build', // Nur während Build
    },
  ],
})
```

#### Built-in Features:

- **TypeScript Support**: Out-of-the-box TypeScript-Unterstützung
- **CSS Preprocessing**: Unterstützung für CSS, SCSS, Less
- **Environment Variables**: `.env` Dateien werden automatisch geladen
- **Asset Handling**: Automatisches Handling von Bildern, Fonts, etc.
- **ESM SSR Build**: ESM ist Standard für SSR-Builds (Vite 3+)

### 3.3 Best Practices

- **Alias verwenden**: `@/` für bessere Imports
- **Proxy für API**: Dev-Server Proxy für Backend-API
- **Environment Variables**: Nutze `.env` für Konfiguration
- **Build Optimization**: Vite optimiert automatisch für Production
- **Plugin Performance**: `buildStart`, `config`, und `configResolved` Hooks sollten schnell sein
- **Dependency Optimization**: Nutze `optimizeDeps` für bessere Performance
- **Profiling**: Nutze `vite --profile` für Performance-Analyse

---

## 4. Playwright

### 4.1 Überblick

Playwright ist ein Framework für End-to-End-Testing, das:

- **Cross-Browser Testing**: Chromium, Firefox, WebKit
- **Auto-Wait**: Automatisches Warten auf Elemente (visible, enabled, etc.)
- **Reliable**: Stabile Tests durch Auto-Wait und Retries
- **Fast**: Parallele Test-Ausführung
- **Locators**: Robuste Element-Selektoren mit Auto-Wait

### 4.2 Verwendung im Projekt

**Version:** 1.56.1

#### Konfiguration (`playwright.config.ts`):

```typescript
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    actionTimeout: 30000,
    navigationTimeout: 30000,
  },
  webServer: [
    {
      command: './gradlew bootRun',
      url: 'http://localhost:8081/api/vehicles',
      timeout: 120000,
      cwd: '..',
    },
    {
      command: 'npm run dev -- --host',
      url: 'http://localhost:3000',
      timeout: 60000,
    },
  ],
})
```

#### Locators - Best Practices:

Playwright's Locators bieten Auto-Wait und Retry-Ability. Bevorzuge user-facing Attribute:

```typescript
// ✅ Gut: Role-based Locator
const button = page.getByRole('button', { name: 'Anmelden' })
await button.click()

// ✅ Gut: Text-based Locator
const heading = page.getByText('Willkommen zurück')
await expect(heading).toBeVisible()

// ✅ Gut: Label-based Locator
const input = page.getByLabel('Benutzername')
await input.fill('customer')

// ✅ Gut: Test ID (wenn verfügbar)
const element = page.getByTestId('submit-button')
await element.click()

// ❌ Vermeiden: CSS-Selektoren (weniger robust)
const element = page.locator('.btn-primary') // Nicht empfohlen
```

#### Chaining und Filtering:

```typescript
// Locators können gechained werden
const product = page
  .getByRole('listitem')
  .filter({ hasText: 'Product 2' })
  .getByRole('button', { name: 'Add to cart' })

await product.click()
```

#### Features im Projekt:

- **Automatischer Server-Start**: Backend und Frontend werden automatisch gestartet
- **Real Data Testing**: Tests verwenden echte Daten aus der Datenbank
- **Comprehensive Journeys**: Vollständige User-Journeys werden getestet
- **HTML Reporter**: Detaillierte Test-Reports
- **Trace Viewer**: Für Debugging fehlgeschlagener Tests

### 4.3 Best Practices

- **Auto-Wait nutzen**: Playwright wartet automatisch auf Elemente
- **Meaningful Selectors**: Bevorzuge Role-based, Label-based oder Test-ID Selectors
- **Wait for Navigation**: Nutze `waitForURL` für Navigation
- **Screenshots bei Fehlern**: Automatische Screenshots bei fehlgeschlagenen Tests
- **Trace Viewer**: Nutze Traces für Debugging
- **Lint Tests**: Nutze ESLint mit `@typescript-eslint/no-floating-promises` für TypeScript
- **Vermeide Third-Party Dependencies**: Mocke externe APIs statt sie zu testen
- **Network API**: Nutze Playwright's Network API für Mocking

#### Beispiel aus dem Projekt:

```typescript
test('New Customer: Register → Browse → Book', async ({ page }) => {
  // Navigate
  await page.goto('/register')
  await expect(page).toHaveURL('/register')
  
  // Fill form mit robusten Locators
  await page.getByLabel('Vorname').fill('John')
  await page.getByLabel('Nachname').fill('Doe')
  await page.getByLabel('E-Mail').fill('john@example.com')
  
  // Submit mit Role-based Selector
  await page.getByRole('button', { name: /registrieren/i }).click()
  
  // Wait for navigation
  await expect(page).toHaveURL(/\/login/)
})
```

---

## 5. Jest

### 5.1 Überblick

Jest ist ein JavaScript-Testing-Framework mit:

- **Zero Configuration**: Funktioniert out-of-the-box
- **Snapshot Testing**: Snapshot-Tests für UI-Komponenten
- **Mocking**: Eingebaute Mocking-Funktionalität
- **Coverage**: Code-Coverage-Reports
- **React Testing Library Integration**: Optimiert für React-Komponenten-Tests

### 5.2 Verwendung im Projekt

**Version:** 30.2.0

#### Konfiguration (`jest.config.js`):

```javascript
export default {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/src', '<rootDir>/tests'],
  testMatch: ['**/__tests__/**/*.ts?(x)', '**/?(*.)+(spec|test).ts?(x)'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  setupFilesAfterEnv: ['<rootDir>/src/test/setup.ts'],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
}
```

#### Testing Library Integration:

- **@testing-library/react**: React-Komponenten testen
- **@testing-library/jest-dom**: Zusätzliche Matchers für DOM
- **@testing-library/user-event**: User-Interaktionen simulieren

#### Setup Files:

`setupFilesAfterEnv` wird nach der Test-Environment-Installation ausgeführt, aber vor dem Test-Code:

```typescript
// src/test/setup.ts
import '@testing-library/jest-dom'

// Globale Mocks
global.scrollTo = jest.fn()
```

### 5.3 Best Practices

- **AAA Pattern**: Arrange, Act, Assert
- **Meaningful Test Names**: Beschreibende Test-Namen
- **Isolation**: Jeder Test sollte unabhängig sein
- **Mock External Dependencies**: API-Calls mocken
- **Coverage Goals**: Mindestens 70% Coverage
- **Snapshot Testing**: Für UI-Komponenten, aber mit Vorsicht verwenden
- **Learn from Examples**: Siehe React, Relay, React Native Test-Beispiele

#### Beispiel aus dem Projekt:

```typescript
describe('LoginPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders login form', () => {
    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    )
    
    expect(screen.getByText('Anmelden')).toBeInTheDocument()
    expect(screen.getByLabelText('Benutzername')).toBeInTheDocument()
  })
  
  it('navigates to dashboard on successful login', async () => {
    const user = userEvent.setup()
    mockLogin.mockResolvedValueOnce(true)
    
    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    )
    
    await user.type(screen.getByLabelText('Benutzername'), 'customer')
    await user.type(screen.getByLabelText('Passwort'), 'password123')
    await user.click(screen.getByRole('button', { name: /anmelden/i }))
    
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard')
    })
  })
})
```

### 5.4 Mocking Best Practices

- **Mock at Module Level**: Mocke Module am Anfang der Test-Datei
- **Clear Mocks**: Nutze `jest.clearAllMocks()` in `beforeEach`
- **Don't Reset Modules**: Vermeide `jest.resetModules()` in `beforeEach`
- **Persistent Mocks**: Mocks sollten über Tests hinweg bestehen bleiben
- **Mock Functions**: Nutze `jest.fn()` für Funktions-Mocks

---

## 6. TypeScript

### 6.1 Überblick

TypeScript ist eine Superset von JavaScript, die:

- **Type Safety**: Statische Typisierung für JavaScript
- **IntelliSense**: Bessere IDE-Unterstützung
- **Refactoring**: Sichereres Refactoring
- **Compiler API**: Mächtige API für Code-Analyse und Transformation

### 6.2 Verwendung im Projekt

**Version:** 5.9.3

#### Konfiguration (`tsconfig.json`):

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src"],
  "exclude": ["src/**/__tests__/**", "src/**/*.test.ts", "src/**/*.test.tsx"]
}
```

#### TypeScript API Levels:

Für verschiedene Use Cases gibt es unterschiedliche API-Levels:

- **transpileModule**: Einfache String-zu-String Transformation ohne Type Checking
- **transpileDeclaration**: Schnelle Declaration-File-Generierung ohne vollständiges Type Checking
- **createProgram**: Vollständige Kompilierung mit Type Checking und Emit
- **createLanguageService**: Editor-ähnliche Features mit inkrementellen Updates
- **createWatchProgram**: Kontinuierliche Kompilierung

#### Best Practices:

- **Strict Mode**: Nutze `strict: true` für maximale Type Safety
- **Path Aliases**: Nutze `paths` für bessere Imports
- **Exclude Test Files**: Excludiere Test-Dateien von der normalen Kompilierung
- **Performance**: Nutze `skipLibCheck: true` für schnellere Kompilierung
- **Incremental Compilation**: Nutze `incremental: true` für bessere Performance

### 6.3 React + TypeScript Best Practices

- **Type Props**: Definiere Props-Typen für alle Komponenten
- **Generic Types**: Nutze Generics für wiederverwendbare Komponenten
- **Type Guards**: Nutze Type Guards für Type Narrowing
- **Utility Types**: Nutze `Partial`, `Pick`, `Omit` für Type Manipulation

---

## 7. Weitere Technologien

### 7.1 Axios

**Version:** 1.13.2

- **HTTP Client**: Für API-Requests
- **Interceptors**: Request/Response-Interceptors
- **Error Handling**: Zentrale Fehlerbehandlung
- **TypeScript Support**: Vollständige TypeScript-Unterstützung

### 7.2 Tailwind CSS

**Version:** 3.4.18

- **Utility-First CSS**: Utility-Klassen für schnelles Styling
- **Responsive Design**: Mobile-First Approach
- **Customization**: Anpassbare Design-Tokens
- **JIT Mode**: Just-In-Time Compilation für bessere Performance

### 7.3 React Router DOM

**Version:** 7.9.6

- **Client-side Routing**: Navigation ohne Page Reload
- **Nested Routes**: Verschachtelte Routen
- **Route Guards**: Protected Routes
- **Data Loading**: Integrierte Data Loading APIs

### 7.4 ESLint + Prettier

- **ESLint**: Code-Qualität und Linting
- **Prettier**: Code-Formatierung
- **Integration**: ESLint und Prettier arbeiten zusammen
- **TypeScript Support**: Vollständige TypeScript-Unterstützung

---

## 8. Integration und Zusammenarbeit

### 8.1 Frontend ↔ Backend

- **API Proxy**: Vite Dev-Server proxied `/api` zu Backend
- **CORS**: Backend konfiguriert für Frontend-Requests
- **Authentication**: HTTP Basic Auth für API-Calls
- **Error Handling**: Zentrale Fehlerbehandlung im API-Client

### 8.2 Testing-Strategie

- **Unit Tests (Jest)**: Frontend-Komponenten und Services
- **Integration Tests**: API-Integration mit echtem Backend
- **E2E Tests (Playwright)**: Vollständige User-Journeys mit echten Daten
- **Coverage Goals**: Mindestens 70% Coverage für alle Metriken

### 8.3 Development Workflow

1. **Backend starten**: `./gradlew bootRun` (Port 8081)
2. **Frontend starten**: `npm run dev` (Port 3000)
3. **Tests ausführen**: 
   - `npm run test` (Jest Unit Tests)
   - `npm run test:integration` (Integration Tests mit automatischem Server-Start)
   - `npm run test:e2e` (Playwright E2E Tests mit automatischem Server-Start)
4. **Code Quality**: `npm run quality` (ESLint + Prettier + TypeScript)

---

## 9. Ressourcen und Links

### Offizielle Dokumentation:

- **Spring Boot**: https://spring.io/projects/spring-boot
- **React**: https://react.dev
- **Vite**: https://vitejs.dev
- **Playwright**: https://playwright.dev
- **Jest**: https://jestjs.io
- **TypeScript**: https://www.typescriptlang.org

### Projekt-spezifische Dokumentation:

- **Projekt-Dokumentation**: `docs/project-documentation.md`
- **API-Dokumentation**: `frontend/docs/API_DOCUMENTATION.md`
- **User Guide**: `frontend/docs/USER_GUIDE.md`
- **Test Coverage**: `docs/test-coverage-report.md`
- **E2E Testing Guide**: `frontend/e2e/README.md`

### Context7 Quellen:

Diese Dokumentation basiert auf aktuellen offiziellen Dokumentationen, abgerufen über Context7:

- Spring Boot: `/spring-projects/spring-boot`
- React: `/facebook/react`
- Vite: `/vitejs/vite`
- Playwright: `/microsoft/playwright.dev`
- Jest: `/jestjs/jest`
- TypeScript: `/microsoft/typescript`

---

**Hinweis:** Diese Dokumentation wurde am 2025-12-02 mit den neuesten Context7-Dokumentationen aktualisiert. Für die neuesten Updates und Best Practices, konsultiere bitte die offiziellen Dokumentationen oder aktualisiere diese Dokumentation erneut mit Context7.

---

**Version:** 2.0.0  
**Datum:** 2025-12-02  
**Quelle:** Context7 - Offizielle Bibliotheksdokumentation (Aktualisiert)

---

## Inhaltsverzeichnis

1. [Spring Boot](#1-spring-boot)
2. [React](#2-react)
3. [Vite](#3-vite)
4. [Playwright](#4-playwright)
5. [Jest](#5-jest)
6. [TypeScript](#6-typescript)
7. [Weitere Technologien](#7-weitere-technologien)

---

## 1. Spring Boot

### 1.1 Überblick

Spring Boot ist ein Framework für die Entwicklung von stand-alone, production-ready Spring-basierten Anwendungen. Es bietet:

- **Embedded Server**: Integrierte Server (Tomcat, Jetty, Undertow)
- **Auto-Configuration**: Automatische Konfiguration basierend auf Classpath
- **Production-Ready Features**: Monitoring, Metrics, Health Checks
- **Minimal Configuration**: Konvention über Konfiguration
- **RestClient**: Funktionaler, imperativer API-Stil für REST-Services

### 1.2 Verwendung im Projekt

**Version:** 3.2.0  
**Java Version:** 17

#### Hauptfunktionen im RentACar-Projekt:

- **Spring Boot Starter Web**: REST API Endpunkte
- **Spring Boot Starter Data JPA**: Datenbankzugriff mit JPA/Hibernate
- **Spring Boot Starter Security**: Authentifizierung und Autorisierung
- **Spring Boot Starter Validation**: Validierung von Eingabedaten

#### Konfiguration:

```properties
# application.properties
spring.application.name=rentacar
server.port=8081
spring.jpa.hibernate.ddl-auto=update
spring.datasource.url=jdbc:h2:file:./data/rentacardb
```

#### @SpringBootApplication Annotation:

Die `@SpringBootApplication` Annotation kombiniert drei wichtige Features:

1. **@EnableAutoConfiguration**: Aktiviert Spring Boot's Auto-Configuration-Mechanismus
2. **@ComponentScan**: Aktiviert Component-Scan im Package der Anwendung
3. **@SpringBootConfiguration**: Ermöglicht die Registrierung zusätzlicher Beans

```java
@SpringBootApplication
public class RentACarApplication {
    public static void main(String[] args) {
        SpringApplication.run(RentACarApplication.class, args);
    }
}
```

#### RestClient (Spring Boot 3.2+):

Wenn Sie nicht Spring WebFlux oder Project Reactor verwenden, wird empfohlen, `RestClient` für REST-Service-Aufrufe zu nutzen:

```java
@Autowired
private RestClient.Builder restClientBuilder;

public void callExternalAPI() {
    RestClient restClient = restClientBuilder.build();
    String response = restClient.get()
        .uri("https://api.example.com/data")
        .retrieve()
        .body(String.class);
}
```

### 1.3 Best Practices

- **Auto-Configuration nutzen**: Spring Boot konfiguriert automatisch basierend auf Dependencies
- **Profiles verwenden**: Verschiedene Konfigurationen für Development, Test, Production
- **Actuator für Monitoring**: Health Checks und Metrics für Production
- **Starter Dependencies**: Nutze Spring Boot Starters statt manueller Dependency-Management
- **RestClient für HTTP-Calls**: Funktionaler API-Stil für REST-Services
- **Configuration Properties**: Nutze `spring.http.serviceclient.<group-name>` für HTTP-Client-Konfiguration

---

## 2. React

### 2.1 Überblick

React ist eine JavaScript-Bibliothek zum Erstellen von Benutzeroberflächen. Es verwendet:

- **Komponenten-basierte Architektur**: Wiederverwendbare UI-Komponenten
- **Virtual DOM**: Effizientes Rendering durch Virtual DOM
- **Hooks**: Funktionale Komponenten mit State und Side Effects
- **Unidirektionaler Datenfluss**: Props down, Events up
- **React Compiler**: Optimiert Re-Renders automatisch (React 19+)

### 2.2 Verwendung im Projekt

**Version:** 18.3.1

#### Hauptfunktionen im RentACar-Projekt:

- **React Router DOM 7.9.6**: Client-side Routing
- **React Hooks**: `useState`, `useEffect`, `useNavigate`, `useParams`
- **Komponenten**: Seiten, Layout, Formulare
- **Lazy Loading**: Code Splitting mit `React.lazy()` und `Suspense`

#### Wichtige React-Regeln (Rules of React):

> **React Rules:**
> - **Komponenten und Hooks müssen pure sein**: Keine Side Effects während des Renders
> - **Hooks nur am Top-Level**: Hooks müssen am Anfang der Komponente aufgerufen werden, nicht in Loops oder Conditions
> - **Keine dynamischen Hooks**: Hooks können nicht dynamisch erstellt werden
> - **Side Effects in useEffect**: Side Effects müssen in `useEffect` ausgeführt werden, nicht während des Renders

#### Beispiel aus dem Projekt:

```typescript
// ✅ Korrekt: Hook am Top-Level
function VehicleDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [vehicle, setVehicle] = useState(null)
  
  useEffect(() => {
    // Fetch vehicle data - Side Effect gehört in useEffect
    loadVehicle()
  }, [id])
  
  return <div>...</div>
}

// ❌ Falsch: Hook in Condition
function BadComponent({ condition }) {
  if (condition) {
    const [state, setState] = useState(null) // FEHLER!
  }
}
```

### 2.3 Hooks im Projekt

#### State Hooks:
- `useState`: Lokaler State in Komponenten
- `useEffect`: Side Effects (API Calls, Subscriptions)
- `useNavigate`: Navigation zwischen Seiten
- `useParams`: URL-Parameter lesen
- `useLocation`: Aktuelle Location-Informationen

#### Custom Hooks:
- Können erstellt werden, um Logik zwischen Komponenten zu teilen
- Müssen mit `use` beginnen
- Können andere Hooks verwenden
- Folgen den gleichen Rules of Hooks

#### useEffect Best Practices:

```typescript
// ✅ Korrekt: Dependency Array korrekt gesetzt
useEffect(() => {
  // Effect code
}, [dependency1, dependency2])

// ✅ Korrekt: Ref in Effect, nicht in Dependency Array
useEffect(() => {
  const value = ref.current // Zugriff auf ref.current innerhalb des Effects
  // ...
}, [ref]) // ref selbst, nicht ref.current

// ❌ Falsch: ref.current in Dependency Array
useEffect(() => {
  // ...
}, [ref.current]) // FEHLER!
```

### 2.4 Best Practices

- **Komponenten klein halten**: Eine Komponente, eine Verantwortung
- **Props validieren**: TypeScript für Type Safety
- **Keys bei Listen**: Immer `key` Prop bei `.map()` verwenden
- **Conditional Rendering**: Nutze `&&` oder Ternary Operators
- **Performance**: `useMemo` und `useCallback` für teure Berechnungen
- **Lazy Loading**: Nutze `React.lazy()` für Code Splitting
- **StrictMode nur in Development**: Für bessere Performance in Production

---

## 3. Vite

### 3.1 Überblick

Vite ist ein modernes Frontend-Build-Tool, das:

- **Instant Server Start**: Sofortiger Dev-Server-Start durch native ES Modules
- **Lightning-fast HMR**: Schnelles Hot Module Replacement
- **Optimized Builds**: Optimierte Production-Builds mit Rollup
- **Zero Config**: Funktioniert out-of-the-box
- **Conditional Config**: Konfiguration basierend auf Command und Mode

### 3.2 Verwendung im Projekt

**Version:** 7.2.4

#### Konfiguration (`vite.config.ts`):

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:8081',
        changeOrigin: true,
      },
    },
  },
  build: {
    target: 'esnext',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            if (id.includes('react')) return 'vendor-react'
            return 'vendor-other'
          }
        },
      },
    },
  },
})
```

#### Conditional Configuration:

Vite unterstützt bedingte Konfiguration basierend auf Command (`serve` oder `build`), Mode, SSR-Build oder Preview:

```typescript
export default defineConfig(({ command, mode, isSsrBuild, isPreview }) => {
  if (command === 'serve') {
    return {
      // Development-Konfiguration
      server: { port: 3000 }
    }
  } else {
    return {
      // Production-Build-Konfiguration
      build: { minify: 'terser' }
    }
  }
})
```

#### Plugin Configuration:

Plugins können für spezifische Phasen konfiguriert werden:

```typescript
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [
    {
      ...somePlugin(),
      apply: 'build', // Nur während Build
    },
  ],
})
```

#### Built-in Features:

- **TypeScript Support**: Out-of-the-box TypeScript-Unterstützung
- **CSS Preprocessing**: Unterstützung für CSS, SCSS, Less
- **Environment Variables**: `.env` Dateien werden automatisch geladen
- **Asset Handling**: Automatisches Handling von Bildern, Fonts, etc.
- **ESM SSR Build**: ESM ist Standard für SSR-Builds (Vite 3+)

### 3.3 Best Practices

- **Alias verwenden**: `@/` für bessere Imports
- **Proxy für API**: Dev-Server Proxy für Backend-API
- **Environment Variables**: Nutze `.env` für Konfiguration
- **Build Optimization**: Vite optimiert automatisch für Production
- **Plugin Performance**: `buildStart`, `config`, und `configResolved` Hooks sollten schnell sein
- **Dependency Optimization**: Nutze `optimizeDeps` für bessere Performance
- **Profiling**: Nutze `vite --profile` für Performance-Analyse

---

## 4. Playwright

### 4.1 Überblick

Playwright ist ein Framework für End-to-End-Testing, das:

- **Cross-Browser Testing**: Chromium, Firefox, WebKit
- **Auto-Wait**: Automatisches Warten auf Elemente (visible, enabled, etc.)
- **Reliable**: Stabile Tests durch Auto-Wait und Retries
- **Fast**: Parallele Test-Ausführung
- **Locators**: Robuste Element-Selektoren mit Auto-Wait

### 4.2 Verwendung im Projekt

**Version:** 1.56.1

#### Konfiguration (`playwright.config.ts`):

```typescript
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    actionTimeout: 30000,
    navigationTimeout: 30000,
  },
  webServer: [
    {
      command: './gradlew bootRun',
      url: 'http://localhost:8081/api/vehicles',
      timeout: 120000,
      cwd: '..',
    },
    {
      command: 'npm run dev -- --host',
      url: 'http://localhost:3000',
      timeout: 60000,
    },
  ],
})
```

#### Locators - Best Practices:

Playwright's Locators bieten Auto-Wait und Retry-Ability. Bevorzuge user-facing Attribute:

```typescript
// ✅ Gut: Role-based Locator
const button = page.getByRole('button', { name: 'Anmelden' })
await button.click()

// ✅ Gut: Text-based Locator
const heading = page.getByText('Willkommen zurück')
await expect(heading).toBeVisible()

// ✅ Gut: Label-based Locator
const input = page.getByLabel('Benutzername')
await input.fill('customer')

// ✅ Gut: Test ID (wenn verfügbar)
const element = page.getByTestId('submit-button')
await element.click()

// ❌ Vermeiden: CSS-Selektoren (weniger robust)
const element = page.locator('.btn-primary') // Nicht empfohlen
```

#### Chaining und Filtering:

```typescript
// Locators können gechained werden
const product = page
  .getByRole('listitem')
  .filter({ hasText: 'Product 2' })
  .getByRole('button', { name: 'Add to cart' })

await product.click()
```

#### Features im Projekt:

- **Automatischer Server-Start**: Backend und Frontend werden automatisch gestartet
- **Real Data Testing**: Tests verwenden echte Daten aus der Datenbank
- **Comprehensive Journeys**: Vollständige User-Journeys werden getestet
- **HTML Reporter**: Detaillierte Test-Reports
- **Trace Viewer**: Für Debugging fehlgeschlagener Tests

### 4.3 Best Practices

- **Auto-Wait nutzen**: Playwright wartet automatisch auf Elemente
- **Meaningful Selectors**: Bevorzuge Role-based, Label-based oder Test-ID Selectors
- **Wait for Navigation**: Nutze `waitForURL` für Navigation
- **Screenshots bei Fehlern**: Automatische Screenshots bei fehlgeschlagenen Tests
- **Trace Viewer**: Nutze Traces für Debugging
- **Lint Tests**: Nutze ESLint mit `@typescript-eslint/no-floating-promises` für TypeScript
- **Vermeide Third-Party Dependencies**: Mocke externe APIs statt sie zu testen
- **Network API**: Nutze Playwright's Network API für Mocking

#### Beispiel aus dem Projekt:

```typescript
test('New Customer: Register → Browse → Book', async ({ page }) => {
  // Navigate
  await page.goto('/register')
  await expect(page).toHaveURL('/register')
  
  // Fill form mit robusten Locators
  await page.getByLabel('Vorname').fill('John')
  await page.getByLabel('Nachname').fill('Doe')
  await page.getByLabel('E-Mail').fill('john@example.com')
  
  // Submit mit Role-based Selector
  await page.getByRole('button', { name: /registrieren/i }).click()
  
  // Wait for navigation
  await expect(page).toHaveURL(/\/login/)
})
```

---

## 5. Jest

### 5.1 Überblick

Jest ist ein JavaScript-Testing-Framework mit:

- **Zero Configuration**: Funktioniert out-of-the-box
- **Snapshot Testing**: Snapshot-Tests für UI-Komponenten
- **Mocking**: Eingebaute Mocking-Funktionalität
- **Coverage**: Code-Coverage-Reports
- **React Testing Library Integration**: Optimiert für React-Komponenten-Tests

### 5.2 Verwendung im Projekt

**Version:** 30.2.0

#### Konfiguration (`jest.config.js`):

```javascript
export default {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/src', '<rootDir>/tests'],
  testMatch: ['**/__tests__/**/*.ts?(x)', '**/?(*.)+(spec|test).ts?(x)'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  setupFilesAfterEnv: ['<rootDir>/src/test/setup.ts'],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
}
```

#### Testing Library Integration:

- **@testing-library/react**: React-Komponenten testen
- **@testing-library/jest-dom**: Zusätzliche Matchers für DOM
- **@testing-library/user-event**: User-Interaktionen simulieren

#### Setup Files:

`setupFilesAfterEnv` wird nach der Test-Environment-Installation ausgeführt, aber vor dem Test-Code:

```typescript
// src/test/setup.ts
import '@testing-library/jest-dom'

// Globale Mocks
global.scrollTo = jest.fn()
```

### 5.3 Best Practices

- **AAA Pattern**: Arrange, Act, Assert
- **Meaningful Test Names**: Beschreibende Test-Namen
- **Isolation**: Jeder Test sollte unabhängig sein
- **Mock External Dependencies**: API-Calls mocken
- **Coverage Goals**: Mindestens 70% Coverage
- **Snapshot Testing**: Für UI-Komponenten, aber mit Vorsicht verwenden
- **Learn from Examples**: Siehe React, Relay, React Native Test-Beispiele

#### Beispiel aus dem Projekt:

```typescript
describe('LoginPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders login form', () => {
    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    )
    
    expect(screen.getByText('Anmelden')).toBeInTheDocument()
    expect(screen.getByLabelText('Benutzername')).toBeInTheDocument()
  })
  
  it('navigates to dashboard on successful login', async () => {
    const user = userEvent.setup()
    mockLogin.mockResolvedValueOnce(true)
    
    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    )
    
    await user.type(screen.getByLabelText('Benutzername'), 'customer')
    await user.type(screen.getByLabelText('Passwort'), 'password123')
    await user.click(screen.getByRole('button', { name: /anmelden/i }))
    
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard')
    })
  })
})
```

### 5.4 Mocking Best Practices

- **Mock at Module Level**: Mocke Module am Anfang der Test-Datei
- **Clear Mocks**: Nutze `jest.clearAllMocks()` in `beforeEach`
- **Don't Reset Modules**: Vermeide `jest.resetModules()` in `beforeEach`
- **Persistent Mocks**: Mocks sollten über Tests hinweg bestehen bleiben
- **Mock Functions**: Nutze `jest.fn()` für Funktions-Mocks

---

## 6. TypeScript

### 6.1 Überblick

TypeScript ist eine Superset von JavaScript, die:

- **Type Safety**: Statische Typisierung für JavaScript
- **IntelliSense**: Bessere IDE-Unterstützung
- **Refactoring**: Sichereres Refactoring
- **Compiler API**: Mächtige API für Code-Analyse und Transformation

### 6.2 Verwendung im Projekt

**Version:** 5.9.3

#### Konfiguration (`tsconfig.json`):

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src"],
  "exclude": ["src/**/__tests__/**", "src/**/*.test.ts", "src/**/*.test.tsx"]
}
```

#### TypeScript API Levels:

Für verschiedene Use Cases gibt es unterschiedliche API-Levels:

- **transpileModule**: Einfache String-zu-String Transformation ohne Type Checking
- **transpileDeclaration**: Schnelle Declaration-File-Generierung ohne vollständiges Type Checking
- **createProgram**: Vollständige Kompilierung mit Type Checking und Emit
- **createLanguageService**: Editor-ähnliche Features mit inkrementellen Updates
- **createWatchProgram**: Kontinuierliche Kompilierung

#### Best Practices:

- **Strict Mode**: Nutze `strict: true` für maximale Type Safety
- **Path Aliases**: Nutze `paths` für bessere Imports
- **Exclude Test Files**: Excludiere Test-Dateien von der normalen Kompilierung
- **Performance**: Nutze `skipLibCheck: true` für schnellere Kompilierung
- **Incremental Compilation**: Nutze `incremental: true` für bessere Performance

### 6.3 React + TypeScript Best Practices

- **Type Props**: Definiere Props-Typen für alle Komponenten
- **Generic Types**: Nutze Generics für wiederverwendbare Komponenten
- **Type Guards**: Nutze Type Guards für Type Narrowing
- **Utility Types**: Nutze `Partial`, `Pick`, `Omit` für Type Manipulation

---

## 7. Weitere Technologien

### 7.1 Axios

**Version:** 1.13.2

- **HTTP Client**: Für API-Requests
- **Interceptors**: Request/Response-Interceptors
- **Error Handling**: Zentrale Fehlerbehandlung
- **TypeScript Support**: Vollständige TypeScript-Unterstützung

### 7.2 Tailwind CSS

**Version:** 3.4.18

- **Utility-First CSS**: Utility-Klassen für schnelles Styling
- **Responsive Design**: Mobile-First Approach
- **Customization**: Anpassbare Design-Tokens
- **JIT Mode**: Just-In-Time Compilation für bessere Performance

### 7.3 React Router DOM

**Version:** 7.9.6

- **Client-side Routing**: Navigation ohne Page Reload
- **Nested Routes**: Verschachtelte Routen
- **Route Guards**: Protected Routes
- **Data Loading**: Integrierte Data Loading APIs

### 7.4 ESLint + Prettier

- **ESLint**: Code-Qualität und Linting
- **Prettier**: Code-Formatierung
- **Integration**: ESLint und Prettier arbeiten zusammen
- **TypeScript Support**: Vollständige TypeScript-Unterstützung

---

## 8. Integration und Zusammenarbeit

### 8.1 Frontend ↔ Backend

- **API Proxy**: Vite Dev-Server proxied `/api` zu Backend
- **CORS**: Backend konfiguriert für Frontend-Requests
- **Authentication**: HTTP Basic Auth für API-Calls
- **Error Handling**: Zentrale Fehlerbehandlung im API-Client

### 8.2 Testing-Strategie

- **Unit Tests (Jest)**: Frontend-Komponenten und Services
- **Integration Tests**: API-Integration mit echtem Backend
- **E2E Tests (Playwright)**: Vollständige User-Journeys mit echten Daten
- **Coverage Goals**: Mindestens 70% Coverage für alle Metriken

### 8.3 Development Workflow

1. **Backend starten**: `./gradlew bootRun` (Port 8081)
2. **Frontend starten**: `npm run dev` (Port 3000)
3. **Tests ausführen**: 
   - `npm run test` (Jest Unit Tests)
   - `npm run test:integration` (Integration Tests mit automatischem Server-Start)
   - `npm run test:e2e` (Playwright E2E Tests mit automatischem Server-Start)
4. **Code Quality**: `npm run quality` (ESLint + Prettier + TypeScript)

---

## 9. Ressourcen und Links

### Offizielle Dokumentation:

- **Spring Boot**: https://spring.io/projects/spring-boot
- **React**: https://react.dev
- **Vite**: https://vitejs.dev
- **Playwright**: https://playwright.dev
- **Jest**: https://jestjs.io
- **TypeScript**: https://www.typescriptlang.org

### Projekt-spezifische Dokumentation:

- **Projekt-Dokumentation**: `docs/project-documentation.md`
- **API-Dokumentation**: `frontend/docs/API_DOCUMENTATION.md`
- **User Guide**: `frontend/docs/USER_GUIDE.md`
- **Test Coverage**: `docs/test-coverage-report.md`
- **E2E Testing Guide**: `frontend/e2e/README.md`

### Context7 Quellen:

Diese Dokumentation basiert auf aktuellen offiziellen Dokumentationen, abgerufen über Context7:

- Spring Boot: `/spring-projects/spring-boot`
- React: `/facebook/react`
- Vite: `/vitejs/vite`
- Playwright: `/microsoft/playwright.dev`
- Jest: `/jestjs/jest`
- TypeScript: `/microsoft/typescript`

---

**Hinweis:** Diese Dokumentation wurde am 2025-12-02 mit den neuesten Context7-Dokumentationen aktualisiert. Für die neuesten Updates und Best Practices, konsultiere bitte die offiziellen Dokumentationen oder aktualisiere diese Dokumentation erneut mit Context7.

---

Nutze bitte meine aktiven MCP-Server, besonders den Figma-MCP-Server. 

Zusätzlich liegen meine Wireframes lokal im Ordner /Docs/Wireframes.

Du sollst sowohl:

\- die lokalen Wireframes

\- als auch Figma-Kontext (falls verfügbar)

kombinieren, um ein vollständiges, qualitativ hochwertiges React-Frontend zu erstellen.



========================

SCHRITT 1 — MCP + Wireframes einlesen

========================

1\. Lade alle Dateien im Ordner /Docs/Wireframes.

2\. Lies zusätzlich alle verfügbaren Figma-Daten über den Figma-MCP-Server ein.

3\. Kombiniere:

&nbsp;  • Wireframes geben Layout \& Struktur vor

&nbsp;  • Figma liefert Design-System, Farben, Spacing, Typografie

4\. Erstelle eine vollständige Analyse:

&nbsp;  – Welche Seiten existieren?

&nbsp;  – Welche UI-Elemente gibt es?

&nbsp;  – Welche Interaktionen?

&nbsp;  – Welche Daten werden benötigt?



========================

SCHRITT 2 — React-Frontend entwerfen

========================

Erzeuge ein komplettes Frontend basierend auf:

\- React + TypeScript

\- TailwindCSS

\- React Router oder Next.js Routing

\- Zustand oder React Query für State

\- API-Client in /lib/api.ts



Strukturiere das Projekt wie folgt:



/src

&nbsp; /components

&nbsp; /pages oder /app

&nbsp; /hooks

&nbsp; /lib

&nbsp;   api.ts

&nbsp; /types

&nbsp; /styles

&nbsp; /tests

&nbsp;   /unit

&nbsp;   /integration

&nbsp;   /e2e



========================

SCHRITT 3 — Backend-Integration

========================

1\. Analysiere alle vorhandenen Backend-Endpunkte im Projekt.

2\. Mappe jede benötigte Funktionalität der Wireframes zu passenden Endpunkten.

3\. Implementiere:

&nbsp;  - GET/POST/PUT/DELETE Calls

&nbsp;  - Error Handling

&nbsp;  - Loading States

&nbsp;  - Typisierte Responses

4\. Nutze für Integrationstests das \*echte Backend\*, NICHT gemockte Variants.



========================

SCHRITT 4 — TESTING Anforderungen

========================



Bitte baue ein vollständiges Testing-Setup:



1\. \*\*Unit Tests\*\* (Jest + React Testing Library)

&nbsp;  – Mindestens 70% Coverage

&nbsp;  – Komponenten + Utils + Hooks



2\. \*\*Integration Tests\*\*

&nbsp;  – Gegen das reale Backend

&nbsp;  – Teste API-Client, Formular-Handling, Data-Flows



3\. \*\*E2E Tests\*\* (Cypress oder Playwright)

&nbsp;  – Kritische User Journeys testen

&nbsp;  – Login, CRUD-Flows, Navigation

&nbsp;  – Optional Puppeteer-Support



4\. \*\*Lighthouse-Metriken\*\*

&nbsp;  – Optimiere Performance / Accessibility / Best Practices

&nbsp;  – Führe Grundtests aus und nenne Verbesserungen



========================

SCHRITT 5 — CODE QUALITY

========================

\- ESLint + Prettier konfigurieren (mit produktionstauglichen Regeln)

\- Optionale SonarQube-konforme Regeln berücksichtigen

\- Saubere, modulare Komponentenarchitektur

\- Keine Business-Logik in UI-Komponenten



========================

SCHRITT 6 — DOKUMENTATION

========================

Bitte erstelle folgende Dokumente:



1\. \*\*API-Nutzungsdokumentation\*\*

2\. \*\*User Guide\*\*

&nbsp;  – Optional: Screenshots via Puppeteer generieren

3\. \*\*README\*\*

&nbsp;  – Setup

&nbsp;  – Scripts

&nbsp;  – Testing-Anleitung

&nbsp;  – Architekturübersicht

&nbsp;  – Deployment-Hinweise



========================

KONTEXT7 MCP QUELLEN
========================

Die folgenden Bibliotheken und Themen sind über Context7 referenziert und bilden die Grundlage für Routing, HTTP, Build und Automatisierung. IDs sind Context7‑kompatibel.

- React Router: `/remix-run/react-router`
  - Thema: Routing (Index‑Routes, verschachtelte Routen, Prefix)
  - Beispiel: createBrowserRouter mit verschachtelten Children

- Axios: `/axios/axios`
  - Thema: Interceptors (Request/Response, Header‑Manipulation, Error Handling)
  - Hinweis: globale 401‑Behandlung, Header Utils

- Vite: `/vitejs/vite`
  - Thema: Build (CLI‑Optionen, programmatisches `build()`, SSR)
  - Hinweis: `build.emitAssets`, `build.lib`, `build.target`

- Puppeteer: `/puppeteer/puppeteer`
  - Thema: Launch (headless, args `--no-sandbox`, executablePath)
  - Hinweis: Stabiler Start in CI/MCP mit Sandbox‑Flags

- Playwright: `/microsoft/playwright`
  - Thema: Test (test.describe, Tags, Parallel, Fixtures)
  - Hinweis: Isolierte `page` Fixture pro Test

Verwendung
------------------------

- Routing
  - Nutze `createBrowserRouter` mit verschachtelten Children und Index‑Routes
- HTTP
  - Richte Request/Response Interceptors im zentralen Axios‑Client ein (Auth, Logging, Fehler)
- Build
  - Vite CLI/Config für Production, SSR wo nötig; programmatisches `build()` möglich
- Automatisierung
  - Puppeteer für UI‑Screenshots; Playwright für E2E Testing (Cross‑Browser)

Hinweis
------------------------

Die obigen Quellen wurden über Context7 MCP aufgelöst und verifiziert. Für vertiefte Beispiele siehe die jeweiligen Themen in den offiziellen Repos.



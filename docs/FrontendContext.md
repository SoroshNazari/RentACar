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

AUFGABE

========================

1\. Lade zuerst MCP-Figma-Kontext + lokale Wireframes ein.

2\. Analysiere alles und definiere die UI-Struktur.

3\. Baue ein komplettes React-Frontend in hoher Qualität.

4\. Integriere Backend vollständig.

5\. Implementiere Tests (Unit/Integration/E2E).

6\. Verbessere Lighthouse-Werte.

7\. Erstelle Codequalität (ESLint/Prettier/Sonar).

8\. Erstelle alle Dokumentationen.

9\. Gib den gesamten Code strukturiert aus.

10\. Beginne jetzt mit Schritt 1.




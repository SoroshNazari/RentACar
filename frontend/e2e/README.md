# End-to-End Testing Guide

## Overview

This directory contains comprehensive E2E tests for the RentACar application using Playwright. The tests are written in natural language to describe user journeys and scenarios.

## ⚠️ IMPORTANT: Real Data Testing

**These tests use REAL data from the backend database. NO MOCKS are used.**

- All API calls go to the real backend server
- All data comes from the real database
- All operations (registration, booking, etc.) create real database entries
- The backend must be running and seeded with test data

## Prerequisites

1. **Backend must be running** on port 8081
2. **Database must be seeded** with test data (automatic via DataInitializer)
3. **Frontend proxy** configured to forward `/api` to `http://localhost:8081`

The Playwright config automatically starts both servers, but you can also start them manually.

## Test Files

### `comprehensive-user-journeys.spec.ts`
Complete user journey tests covering:
- New customer registration and first booking
- Existing customer login and quick booking
- Employee check-out and check-in workflow
- Vehicle browsing and filtering
- Error handling and validation
- Navigation and page transitions
- Mobile/responsive experience
- Complete booking flow with all steps

### `journeys.spec.ts`
Critical path tests for the main booking flow.

### `auth.spec.ts`
Authentication-related tests (login, registration).

### `homepage.spec.ts`
Homepage functionality tests.

## Running Tests

### Automatic Server Startup

**Die E2E-Tests starten automatisch Backend und Frontend!**

Die `playwright.config.ts` konfiguriert automatisches Starten beider Server:

1. **Backend Server** (Port 8081):
   - Startet automatisch mit `./gradlew bootRun` vom Projekt-Root
   - Wartet bis `http://localhost:8081/api/vehicles` erreichbar ist
   - Timeout: 2 Minuten (Spring Boot braucht Zeit zum Starten)
   - Wiederverwendet laufenden Server, wenn bereits gestartet (für schnellere lokale Entwicklung)

2. **Frontend Server** (Port 3000):
   - Startet automatisch mit `npm run dev -- --host` vom Frontend-Verzeichnis
   - Wartet bis `http://localhost:3000` erreichbar ist
   - Timeout: 1 Minute
   - Wiederverwendet laufenden Server, wenn bereits gestartet

### Run all E2E tests
```bash
npm run test:e2e
```
**Hinweis:** Backend und Frontend werden automatisch gestartet, falls sie nicht bereits laufen.

### Run specific test file
```bash
npx playwright test e2e/comprehensive-user-journeys.spec.ts
```

### Run tests in headed mode (see browser)
```bash
npx playwright test --headed
```

### Run tests in debug mode
```bash
npx playwright test --debug
```

### Manual Server Start (Optional)

Falls du die Server manuell starten möchtest (z.B. für Debugging):

```bash
# Terminal 1: Backend starten
cd /path/to/RentACar
./gradlew bootRun

# Terminal 2: Frontend starten
cd /path/to/RentACar/frontend
npm run dev -- --host

# Terminal 3: Tests ausführen
cd /path/to/RentACar/frontend
npm run test:e2e
```

Die Tests erkennen automatisch, wenn die Server bereits laufen, und verwenden sie.

### Run tests for specific browser
```bash
npx playwright test --project=chromium
```

## Test Structure

Each test follows this pattern:
1. **Setup**: Navigate to starting page
2. **Action**: Perform user interactions
3. **Assertion**: Verify expected outcomes

## User Journeys Covered

### 1. New Customer Journey
- Register new account
- Browse vehicles
- View vehicle details
- Complete booking
- See confirmation

### 2. Existing Customer Journey
- Login to account
- View dashboard
- Search for vehicles
- Make quick booking

### 3. Employee Journey
- Login as employee
- View pending check-outs
- Perform vehicle check-out
- View pending check-ins
- Perform vehicle check-in

### 4. Browsing Journey
- Browse all vehicles
- View vehicle details
- Compare vehicles
- Navigate between vehicles

### 5. Error Handling
- Invalid login attempts
- Registration validation
- Booking validation
- Form error messages

### 6. Navigation
- Navigate between pages
- Use navigation menu
- Use breadcrumbs
- Logo navigation

### 7. Mobile Experience
- Responsive layout
- Mobile navigation
- Touch interactions

### 8. Complete Booking Flow
- All booking steps
- Review before confirmation
- Payment processing
- Success confirmation

## Configuration

Tests are configured in `playwright.config.ts`:
- Base URL: `http://localhost:3000`
- Browser: Chromium (Desktop Chrome)
- Auto-start dev server before tests
- HTML reporter for test results

## Test Data (Real Database)

Tests use REAL data from the backend database:

### Seeded Users (from DataInitializer)
- `customer` / `customer123` (ROLE_CUSTOMER)
- `employee` / `employee123` (ROLE_EMPLOYEE)  
- `admin` / `admin123` (ROLE_ADMIN)

### Seeded Vehicles (from DataInitializer)
- 50+ vehicles across multiple cities (Berlin, München, Hamburg, Frankfurt, Köln)
- Various types: KLEINWAGEN, KOMPAKTKLASSE, MITTELKLASSE, OBERKLASSE, SUV, VAN, SPORTWAGEN
- Different brands: BMW, Audi, Mercedes-Benz, Volkswagen, Porsche

### Dynamic Test Data
- New registrations use timestamps to ensure uniqueness
- Realistic form data for bookings
- All data is persisted in the real database

## Best Practices

1. **Wait for elements**: Always wait for elements to be visible before interacting
2. **Use meaningful selectors**: Prefer role-based selectors over CSS selectors
3. **Handle async operations**: Use `waitForURL`, `waitForLoadState` appropriately
4. **Error handling**: Use `.catch()` for optional assertions
5. **Natural language**: Test descriptions should read like user stories

## Debugging Failed Tests

1. Check test output for error messages
2. View HTML report: `npx playwright show-report`
3. Run in debug mode: `npx playwright test --debug`
4. Check screenshots in `test-results/` directory
5. Review trace files (if enabled)

## Continuous Integration

Tests are configured to:
- Retry failed tests 2 times in CI
- Run with 1 worker in CI (sequential)
- Generate HTML reports
- Capture traces on first retry


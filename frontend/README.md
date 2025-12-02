# RentACar Frontend

Modern React frontend application for the RentACar car rental system.

**Version:** 1.0.0  
**Letzte Aktualisierung:** 2025-12-02

## Tech Stack

- **React 18.3.1** with TypeScript 5.9.3
- **Vite 7.2.4** - Build tool and dev server
- **TailwindCSS 3.4.18** - Utility-first CSS framework
- **React Router DOM 7.9.6** - Client-side routing
- **Axios 1.13.2** - HTTP client
- **Jest 30.2.0** + **React Testing Library** - Unit testing
- **Playwright 1.56.1** - E2E testing
- **ESLint + Prettier** - Code quality

## Project Structure

```
frontend/
├── src/
│   ├── components/       # Reusable UI components
│   │   └── layout/       # Layout components (Header, Footer, etc.)
│   ├── pages/            # Page components
│   ├── lib/              # Utilities and API client
│   ├── types/            # TypeScript type definitions
│   ├── test/             # Test setup files
│   └── index.css         # Global styles
├── e2e/                  # E2E tests (Playwright)
└── public/               # Static assets
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Backend server running on `http://localhost:8081` (wird automatisch für Tests gestartet)

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

### Build

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Testing

### Unit Tests (Jest)

```bash
# Run tests
npm test

# Watch mode
npm run test:watch

# Coverage report (Ziel: ≥70%)
npm run test:coverage
```

**Aktuelle Coverage:**
- Statements: 82.05% ✅
- Branches: 71.97% ✅
- Functions: 80.97% ✅
- Lines: 84.42% ✅

### Integration Tests

```bash
# Integration Tests mit automatischem Server-Start
npm run test:integration
```

**Hinweis:** Backend und Frontend werden automatisch gestartet und gestoppt.

### E2E Tests (Playwright)

```bash
# Run E2E tests (mit automatischem Server-Start)
npm run test:e2e
```

**Hinweis:** Backend und Frontend werden automatisch gestartet und gestoppt.

## Code Quality

### Quality Checks

```bash
# Alle Quality-Checks (ESLint + Prettier + TypeScript)
npm run quality

# Automatische Fixes
npm run quality:fix
```

### Linting

```bash
# Lint prüfen
npm run lint

# Lint automatisch fixen
npm run lint:fix
```

### Formatting

```bash
# Code formatieren
npm run format

# Formatierung prüfen
npm run format:check
```

### TypeScript

```bash
# Type-Checking
npm run typecheck
```

## API Integration

The frontend communicates with the backend API through the `api` client in `src/services/api.ts`. All API calls are automatically authenticated using HTTP Basic Auth when a user is logged in.

### Available Endpoints

- **Auth**: `/api/auth/login`
- **Vehicles**: `/api/vehicles`, `/api/vehicles/{id}`
- **Bookings**: `/api/bookings`, `/api/bookings/search`
- **Customers**: `/api/customers/register`, `/api/customers/{id}`, `/api/customers/me`
- **Rentals**: `/api/rentals/checkout`, `/api/rentals/checkin`
- **Employee**: `/api/employee/pickups`, `/api/employee/returns`, `/api/employee/pickup-requests`

**Dokumentation:** Siehe `docs/API_DOCUMENTATION.md` für vollständige API-Dokumentation.

## Features

- 🏠 **Homepage** - Hero section, search bar, featured vehicles
- 🚗 **Vehicle Details** - Detailed vehicle information with booking widget
- 📅 **Booking Flow** - Multi-step booking process (Dates → Details → Payment)
- 👤 **User Dashboard** - View bookings and manage profile
- 🔐 **Authentication** - Login and registration
- 👨‍💼 **Employee Pages** - Check-out und Check-in für Mitarbeiter
- 🌐 **Deutsche UI** - Vollständig auf Deutsch übersetzt
- ⚡ **Performance** - Lighthouse Score: 94% (Performance), 89% (Accessibility)
- 📊 **Code Quality** - ESLint + Prettier konfiguriert

## Environment Variables

Create a `.env` file for environment-specific configuration:

```env
VITE_API_BASE_URL=http://localhost:8081/api
```

**Hinweis:** Der Backend-Server läuft standardmäßig auf Port 8081.

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Dokumentation

- **API-Dokumentation**: `docs/API_DOCUMENTATION.md`
- **User Guide**: `docs/USER_GUIDE.md`
- **Technologie-Dokumentation**: `../docs/technology-documentation.md`
- **E2E Testing Guide**: `e2e/README.md`

## Performance

- **Lighthouse Performance**: 94% ✅
- **Lighthouse Accessibility**: 89%
- **Lighthouse Best Practices**: 100%
- **Lighthouse SEO**: 92%

**Performance-Optimierungen:**
- Code Splitting mit React.lazy()
- Lazy Loading für Bilder
- Vite Build-Optimierungen
- Preload für kritische Ressourcen

## License

Copyright © 2024 RentACar. All rights reserved.


### TypeScript

```bash
# Type-Checking
npm run typecheck
```

## API Integration

The frontend communicates with the backend API through the `api` client in `src/services/api.ts`. All API calls are automatically authenticated using HTTP Basic Auth when a user is logged in.

### Available Endpoints

- **Auth**: `/api/auth/login`
- **Vehicles**: `/api/vehicles`, `/api/vehicles/{id}`
- **Bookings**: `/api/bookings`, `/api/bookings/search`
- **Customers**: `/api/customers/register`, `/api/customers/{id}`, `/api/customers/me`
- **Rentals**: `/api/rentals/checkout`, `/api/rentals/checkin`
- **Employee**: `/api/employee/pickups`, `/api/employee/returns`, `/api/employee/pickup-requests`

**Dokumentation:** Siehe `docs/API_DOCUMENTATION.md` für vollständige API-Dokumentation.

## Features

- 🏠 **Homepage** - Hero section, search bar, featured vehicles
- 🚗 **Vehicle Details** - Detailed vehicle information with booking widget
- 📅 **Booking Flow** - Multi-step booking process (Dates → Details → Payment)
- 👤 **User Dashboard** - View bookings and manage profile
- 🔐 **Authentication** - Login and registration
- 👨‍💼 **Employee Pages** - Check-out und Check-in für Mitarbeiter
- 🌐 **Deutsche UI** - Vollständig auf Deutsch übersetzt
- ⚡ **Performance** - Lighthouse Score: 94% (Performance), 89% (Accessibility)
- 📊 **Code Quality** - ESLint + Prettier konfiguriert

## Environment Variables

Create a `.env` file for environment-specific configuration:

```env
VITE_API_BASE_URL=http://localhost:8081/api
```

**Hinweis:** Der Backend-Server läuft standardmäßig auf Port 8081.

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Dokumentation

- **API-Dokumentation**: `docs/API_DOCUMENTATION.md`
- **User Guide**: `docs/USER_GUIDE.md`
- **Technologie-Dokumentation**: `../docs/technology-documentation.md`
- **E2E Testing Guide**: `e2e/README.md`

## Performance

- **Lighthouse Performance**: 94% ✅
- **Lighthouse Accessibility**: 89%
- **Lighthouse Best Practices**: 100%
- **Lighthouse SEO**: 92%

**Performance-Optimierungen:**
- Code Splitting mit React.lazy()
- Lazy Loading für Bilder
- Vite Build-Optimierungen
- Preload für kritische Ressourcen

## License

Copyright © 2024 RentACar. All rights reserved.

# RentACar Frontend

Modern React frontend application for the RentACar car rental system.

## Tech Stack

- **React 18** with TypeScript
- **Vite** - Build tool and dev server
- **TailwindCSS** - Utility-first CSS framework
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **Jest** + **React Testing Library** - Unit testing
- **Playwright** - E2E testing

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
 - Backend server running on `http://localhost:8080`

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

### Unit Tests

```bash
# Run tests
npm test

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage
```

### E2E Tests

```bash
# Run E2E tests
npm run test:e2e
```

## Code Quality

### Linting

```bash
npm run lint
```

### Formatting

```bash
npm run format
```

## API Integration

The frontend communicates with the backend API through the `api` client in `src/lib/api.ts`. All API calls are automatically authenticated using HTTP Basic Auth when a user is logged in.

### Available Endpoints

- **Auth**: `/api/auth/login`
- **Vehicles**: `/api/vehicles`, `/api/vehicles/{id}`
- **Bookings**: `/api/bookings`, `/api/bookings/search`
- **Customers**: `/api/customers/register`, `/api/customers/{id}`

## Features

- 🏠 **Homepage** - Hero section, search bar, featured vehicles
- 🚗 **Vehicle Details** - Detailed vehicle information with booking widget
- 📅 **Booking Flow** - Multi-step booking process (Dates → Details → Payment)
- 👤 **User Dashboard** - View bookings and manage profile
- 🔐 **Authentication** - Login and registration

## Environment Variables

Create a `.env` file for environment-specific configuration:

```env
VITE_API_BASE_URL=http://localhost:8080/api
```

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

Copyright © 2024 RentACar. All rights reserved.

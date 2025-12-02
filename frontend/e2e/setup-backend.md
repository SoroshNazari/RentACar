# Backend Setup for E2E Tests

## Important: Real Data Testing

The E2E tests use **REAL data** from the backend database. No mocks are used.

## Prerequisites

1. **Backend must be running** on port 8081
2. **Database must be seeded** with test data
3. **Frontend proxy** must be configured to forward `/api` to `http://localhost:8081`

## Starting Backend for E2E Tests

### Option 1: Manual Start
```bash
cd backend
./gradlew bootRun
```

### Option 2: Automatic (via Playwright config)
The Playwright config automatically starts the backend, but you can also start it manually.

## Test Data

The backend `DataInitializer` automatically seeds:

### Users
- `customer` / `customer123` (ROLE_CUSTOMER)
- `employee` / `employee123` (ROLE_EMPLOYEE)
- `admin` / `admin123` (ROLE_ADMIN)

### Vehicles
- 50+ vehicles across multiple cities (Berlin, München, Hamburg, Frankfurt, Köln)
- Various types: KLEINWAGEN, KOMPAKTKLASSE, MITTELKLASSE, OBERKLASSE, SUV, VAN, SPORTWAGEN
- Different brands: BMW, Audi, Mercedes-Benz, Volkswagen, Porsche

### Customers
- Multiple test customers with realistic data

## Verifying Backend is Ready

Before running tests, verify backend is accessible:

```bash
curl http://localhost:8081/api/vehicles
```

Should return a JSON array of vehicles.

## Running E2E Tests

```bash
npm run test:e2e
```

The Playwright config will:
1. Start backend server (if not running)
2. Start frontend server (if not running)
3. Wait for both to be ready
4. Run tests against real backend

## Troubleshooting

### Backend not starting
- Check Java 17 is installed: `java -version`
- Check port 8081 is not in use: `lsof -i :8081`
- Check backend logs for errors

### Database not seeded
- Backend automatically seeds data on first start
- Check `DataInitializer.java` logs for seeding status
- Restart backend to re-seed if needed

### Tests failing with connection errors
- Ensure backend is running: `curl http://localhost:8081/api/vehicles`
- Check frontend proxy config in `vite.config.ts`
- Verify no firewall blocking localhost connections




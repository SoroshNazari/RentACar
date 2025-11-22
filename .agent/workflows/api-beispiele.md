---
description: API Beispiele und Verwendung
---

# Workflow: API Beispiele

## Authentifizierung

### Registrierung
```bash
curl -X POST http://localhost:8080/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "password123",
    "email": "test@example.com",
    "role": "CUSTOMER"
  }'
```

### Login
```bash
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "password123"
  }'
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "type": "Bearer",
  "username": "testuser",
  "role": "CUSTOMER"
}
```

**Token für weitere Requests verwenden:**
```bash
export TOKEN="eyJhbGciOiJIUzI1NiIs..."
```

---

## Fahrzeugverwaltung

### Alle Fahrzeuge abrufen
```bash
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:8080/api/v1/vehicles
```

### Fahrzeug erstellen (Admin/Employee)
```bash
curl -X POST http://localhost:8080/api/v1/vehicles \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "licensePlate": "B-AB-1234",
    "vin": "WBA12345678901234",
    "brand": "BMW",
    "model": "3er",
    "type": "SEDAN",
    "status": "AVAILABLE",
    "mileage": 50000
  }'
```

### Fahrzeug suchen
```bash
# Nach Typ suchen
curl -H "Authorization: Bearer $TOKEN" \
  "http://localhost:8080/api/v1/vehicles/search?type=SEDAN"

# Nach Status suchen
curl -H "Authorization: Bearer $TOKEN" \
  "http://localhost:8080/api/v1/vehicles/search?status=AVAILABLE"

# Kombinierte Suche
curl -H "Authorization: Bearer $TOKEN" \
  "http://localhost:8080/api/v1/vehicles/search?type=SUV&status=AVAILABLE"
```

### Fahrzeugbild hochladen
```bash
curl -X POST http://localhost:8080/api/v1/vehicles/{vehicleId}/images \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@/path/to/image.jpg"
```

---

## Buchungsverwaltung

### Buchung erstellen
```bash
curl -X POST http://localhost:8080/api/v1/bookings \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "customerId": "customer-uuid",
    "vehicleId": "vehicle-uuid",
    "pickupDate": "2024-12-01T10:00:00",
    "returnDate": "2024-12-05T10:00:00",
    "pickupBranchId": "branch-uuid",
    "returnBranchId": "branch-uuid"
  }'
```

### Alle Buchungen abrufen
```bash
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:8080/api/v1/bookings
```

### Buchung stornieren
```bash
curl -X POST http://localhost:8080/api/v1/bookings/{bookingId}/cancel \
  -H "Authorization: Bearer $TOKEN"
```

---

## Vermietungsprozess

### Fahrzeug abholen (Check-out)
```bash
curl -X POST http://localhost:8080/api/v1/rentals/checkout \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "bookingId": "booking-uuid",
    "handoverProtocol": {
      "fuelLevel": 100,
      "mileage": 50000,
      "damages": [],
      "notes": "Fahrzeug in gutem Zustand"
    }
  }'
```

### Fahrzeug zurückgeben (Check-in)
```bash
curl -X POST http://localhost:8080/api/v1/rentals/checkin \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "rentalId": "rental-uuid",
    "handoverProtocol": {
      "fuelLevel": 80,
      "mileage": 50500,
      "damages": ["Kleiner Kratzer an der Tür"],
      "notes": "Fahrzeug zurückgegeben"
    }
  }'
```

---

## Kundenverwaltung

### Kunde erstellen
```bash
curl -X POST http://localhost:8080/api/v1/customers \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Max",
    "lastName": "Mustermann",
    "email": "max@example.com",
    "phoneNumber": "+49123456789",
    "address": "Musterstraße 1, 12345 Berlin",
    "driverLicenseNumber": "B1234567890"
  }'
```

### Alle Kunden abrufen
```bash
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:8080/api/v1/customers
```

---

## Reporting

### Statistiken abrufen (Admin)
```bash
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:8080/api/v1/reports/stats
```

**Response:**
```json
{
  "totalVehicles": 50,
  "availableVehicles": 30,
  "inMaintenanceVehicles": 5,
  "totalBookings": 200,
  "activeBookings": 15,
  "completedBookings": 180,
  "cancelledBookings": 5,
  "totalRevenue": 50000.00,
  "totalCustomers": 100
}
```

---

## Multi-Tenancy

### Anfrage für spezifischen Mandanten
```bash
curl -H "Authorization: Bearer $TOKEN" \
  -H "X-Tenant-ID: company-a" \
  http://localhost:8080/api/v1/vehicles
```

---

## Pagination

### Paginierte Anfrage
```bash
curl -H "Authorization: Bearer $TOKEN" \
  "http://localhost:8080/api/v1/vehicles?page=0&size=10&sort=brand,asc"
```

---

## Swagger UI

Für interaktive API-Dokumentation:
```
http://localhost:8080/swagger-ui.html
```

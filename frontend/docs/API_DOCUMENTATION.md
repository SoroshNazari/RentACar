# Frontend API Client - Dokumentation

**Version:** 1.0.0  
**Datum:** 2025-12-01

---

## 📋 Übersicht

Der Frontend API Client (`src/services/api.ts`) ist eine TypeScript-Klasse, die alle Backend-API-Aufrufe kapselt. Sie verwendet Axios für HTTP-Requests und bietet automatische Authentifizierung, Error-Handling und Daten-Normalisierung.

---

## 🚀 Installation & Import

```typescript
import { api } from '@/services/api'
// oder
import { ApiClient } from '@/services/api'
```

---

## 🔐 Authentifizierung

### Automatische Authentifizierung

Der API Client verwendet **Axios** mit `withCredentials: true` für Session-basierte Authentifizierung. Dies ermöglicht das automatische Senden von Session-Cookies bei Cross-Origin-Requests.

**Axios Konfiguration:**
```typescript
// withCredentials: true ermöglicht das Senden von Cookies
// Dies ist notwendig für Spring Security Session-Management
const client = axios.create({
  baseURL: '/api',
  withCredentials: true, // Wichtig für Session-Cookies
  headers: {
    'Content-Type': 'application/json',
  },
})
```

**Best Practices (Axios):**
- `withCredentials: true` für Session-Cookie-Unterstützung
- Interceptors können für automatische Token-Aktualisierung bei 401-Fehlern verwendet werden
- Retry-Logik bei Netzwerkfehlern möglich
- Zentrale Fehlerbehandlung über Response-Interceptors

**Referenz:** [Axios Documentation - withCredentials](https://axios-http.com/docs/req_config)

### Login

```typescript
const response = await api.login(username: string, password: string)
// Returns: { username: string, roles: string[], authenticated: boolean }
```

**Beispiel:**
```typescript
try {
  const result = await api.login('john.doe', 'password123')
  if (result.authenticated) {
    console.log('Login erfolgreich!', result.roles)
  }
} catch (error) {
  console.error('Login fehlgeschlagen:', error)
}
```

**Backend Endpoint:** `POST /api/auth/login`

---

### Logout

```typescript
api.logout()
// Entfernt alle Auth-Daten aus localStorage
```

**Beispiel:**
```typescript
api.logout()
// Token, username, userRole werden entfernt
```

---

### Authentifizierungs-Status prüfen

```typescript
// Prüft ob User eingeloggt ist
const isAuth = api.isAuthenticated(): boolean

// Aktuelle User-Rolle
const role = api.getUserRole(): string | null

// Alle User-Rollen
const roles = api.getUserRoles(): string[]
```

**Beispiel:**
```typescript
if (api.isAuthenticated()) {
  const role = api.getUserRole()
  if (role === 'ROLE_CUSTOMER') {
    // Customer-spezifische Logik
  }
}
```

---

## 🚗 Vehicles (Fahrzeuge)

### Alle Fahrzeuge abrufen

```typescript
const vehicles: Vehicle[] = await api.getAllVehicles()
```

**Beispiel:**
```typescript
try {
  const vehicles = await api.getAllVehicles()
  console.log(`Gefunden: ${vehicles.length} Fahrzeuge`)
  vehicles.forEach(v => console.log(`${v.brand} ${v.model}`))
} catch (error) {
  console.error('Fehler beim Laden:', error)
}
```

**Backend Endpoint:** `GET /api/vehicles`

**Returns:** `Vehicle[]`

---

### Fahrzeug nach ID abrufen

```typescript
const vehicle: Vehicle = await api.getVehicleById(id: number)
```

**Beispiel:**
```typescript
try {
  const vehicle = await api.getVehicleById(1)
  console.log(`${vehicle.brand} ${vehicle.model} - ${vehicle.dailyPrice}€/Tag`)
} catch (error) {
  if (error.response?.status === 404) {
    console.error('Fahrzeug nicht gefunden')
  }
}
```

**Backend Endpoint:** `GET /api/vehicles/{id}`

**Returns:** `Vehicle`

---

### Verfügbare Fahrzeuge suchen

```typescript
const vehicles: Vehicle[] = await api.searchAvailableVehicles(
  vehicleType: VehicleType,
  location: string,
  startDate: string,  // Format: 'YYYY-MM-DD'
  endDate: string     // Format: 'YYYY-MM-DD'
)
```

**Beispiel:**
```typescript
try {
  const available = await api.searchAvailableVehicles(
    'SEDAN',
    'Berlin',
    '2025-01-15',
    '2025-01-20'
  )
  console.log(`${available.length} verfügbare Fahrzeuge gefunden`)
} catch (error) {
  console.error('Suche fehlgeschlagen:', error)
}
```

**Backend Endpoint:** `GET /api/bookings/search?vehicleType=...&location=...&startDate=...&endDate=...`

**Returns:** `Vehicle[]`

**VehicleType:** `'SEDAN' | 'SUV' | 'COUPE' | 'CONVERTIBLE' | 'HATCHBACK' | 'WAGON' | 'TRUCK' | 'VAN'`

---

## 📅 Bookings (Buchungen)

### Buchung erstellen

```typescript
const booking: Booking = await api.createBooking(request: CreateBookingRequest)
```

**CreateBookingRequest:**
```typescript
interface CreateBookingRequest {
  vehicleId: number
  customerId: number
  pickupDate: string      // Format: 'YYYY-MM-DD'
  dropoffDate: string     // Format: 'YYYY-MM-DD'
  pickupTime?: string     // Format: 'HH:mm'
  dropoffTime?: string    // Format: 'HH:mm'
  extras?: {
    insurance?: boolean
    additionalDriver?: boolean
    childSeat?: boolean
  }
  customerDetails?: {
    fullName: string
    email: string
    phone: string
    driverLicense: string
    address?: string
  }
}
```

**Beispiel:**
```typescript
try {
  const booking = await api.createBooking({
    vehicleId: 1,
    customerId: 5,
    pickupDate: '2025-01-15',
    dropoffDate: '2025-01-20',
    pickupTime: '10:00',
    dropoffTime: '18:00',
    extras: {
      insurance: true,
      additionalDriver: false,
      childSeat: true
    }
  })
  console.log('Buchung erstellt:', booking.id)
} catch (error) {
  console.error('Buchung fehlgeschlagen:', error)
}
```

**Backend Endpoint:** `POST /api/bookings`

**Returns:** `Booking`

---

### Buchung bestätigen

```typescript
await api.confirmBooking(id: number)
```

**Beispiel:**
```typescript
try {
  await api.confirmBooking(bookingId)
  console.log('Buchung bestätigt')
} catch (error) {
  console.error('Bestätigung fehlgeschlagen:', error)
}
```

**Backend Endpoint:** `PUT /api/bookings/{id}/confirm`

---

### Buchung stornieren

```typescript
await api.cancelBooking(id: number)
```

**Beispiel:**
```typescript
try {
  await api.cancelBooking(bookingId)
  console.log('Buchung storniert')
} catch (error) {
  console.error('Stornierung fehlgeschlagen:', error)
}
```

**Backend Endpoint:** `PUT /api/bookings/{id}/cancel`

---

### Buchungshistorie abrufen

```typescript
const bookings: Booking[] = await api.getBookingHistory(customerId: number)
```

**Beispiel:**
```typescript
try {
  const history = await api.getBookingHistory(customerId)
  console.log(`${history.length} Buchungen gefunden`)
  history.forEach(b => console.log(`Buchung #${b.id}: ${b.status}`))
} catch (error) {
  console.error('Fehler beim Laden:', error)
}
```

**Backend Endpoint:** `GET /api/bookings/customer/{customerId}`

**Returns:** `Booking[]`

---

### Pickups abrufen (Employee)

```typescript
const pickups: Booking[] = await api.getPickups(date: string)
```

**Beispiel:**
```typescript
try {
  const pickups = await api.getPickups('2025-01-15')
  console.log(`${pickups.length} Pickups für heute`)
} catch (error) {
  console.error('Fehler:', error)
}
```

**Backend Endpoint:** `GET /api/bookings/pickups?date=...`

**Returns:** `Booking[]`

---

### Pickup Requests abrufen (Employee)

```typescript
const requests: Booking[] = await api.getPickupRequests(date: string)
```

**Backend Endpoint:** `GET /api/bookings/requests?date=...`

**Returns:** `Booking[]`

---

### Checkout durchführen (Employee)

```typescript
const booking: Booking = await api.checkoutBooking(
  id: number,
  mileage: number,
  notes: string
)
```

**Beispiel:**
```typescript
try {
  const updated = await api.checkoutBooking(bookingId, 50000, 'Fahrzeug sauber übergeben')
  console.log('Checkout erfolgreich:', updated.status)
} catch (error) {
  console.error('Checkout fehlgeschlagen:', error)
}
```

**Backend Endpoint:** `PUT /api/bookings/{id}/checkout`

**Returns:** `Booking`

---

### Returns abrufen (Employee)

```typescript
const returns: Booking[] = await api.getReturns(date: string)
```

**Backend Endpoint:** `GET /api/bookings/returns?date=...`

**Returns:** `Booking[]`

---

### Check-in durchführen (Employee)

```typescript
const booking: Booking = await api.checkinBooking(
  id: number,
  payload: {
    mileage: number
    damagePresent: boolean
    damageNotes: string
    damageCost?: number
    actualReturnTime?: string  // Format: 'YYYY-MM-DDTHH:mm:ss'
  }
)
```

**Beispiel:**
```typescript
try {
  const updated = await api.checkinBooking(bookingId, {
    mileage: 50100,
    damagePresent: false,
    damageNotes: '',
    actualReturnTime: '2025-01-20T18:00:00'
  })
  console.log('Check-in erfolgreich:', updated.status)
} catch (error) {
  console.error('Check-in fehlgeschlagen:', error)
}
```

**Backend Endpoint:** `PUT /api/bookings/{id}/checkin`

**Returns:** `Booking`

---

## 👤 Customers (Kunden)

### Kunde registrieren

```typescript
const customer: Customer = await api.registerCustomer(request: RegisterCustomerRequest)
```

**RegisterCustomerRequest:**
```typescript
interface RegisterCustomerRequest {
  username: string
  password: string
  firstName: string
  lastName: string
  email: string
  phone: string
  address?: string
  driverLicenseNumber: string
}
```

**Beispiel:**
```typescript
try {
  const customer = await api.registerCustomer({
    username: 'john.doe',
    password: 'securePassword123',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    phone: '+49 123 456789',
    address: 'Musterstraße 1, 12345 Berlin',
    driverLicenseNumber: 'DL123456'
  })
  console.log('Registrierung erfolgreich:', customer.id)
} catch (error) {
  console.error('Registrierung fehlgeschlagen:', error)
}
```

**Backend Endpoint:** `POST /api/customers/register`

**Returns:** `Customer`

---

### Kunde nach ID abrufen

```typescript
const customer: Customer = await api.getCustomerById(id: number)
```

**Beispiel:**
```typescript
try {
  const customer = await api.getCustomerById(1)
  console.log(`${customer.firstName} ${customer.lastName}`)
} catch (error) {
  console.error('Fehler:', error)
}
```

**Backend Endpoint:** `GET /api/customers/{id}`

**Returns:** `Customer` (sensible Daten werden als `[ENCRYPTED]` angezeigt)

---

### Kunde nach Username abrufen

```typescript
const customer: Customer = await api.getCustomerByUsername(username: string)
```

**Backend Endpoint:** `GET /api/customers/username/{username}`

**Returns:** `Customer`

---

### Aktuellen Kunden abrufen (Me)

```typescript
const customer: Customer = await api.getCustomerMe()
```

**Beispiel:**
```typescript
try {
  const me = await api.getCustomerMe()
  console.log(`Willkommen, ${me.firstName}!`)
} catch (error) {
  if (error.response?.status === 401) {
    console.error('Nicht authentifiziert')
  }
}
```

**Backend Endpoint:** `GET /api/customers/me`

**Returns:** `Customer`

**Hinweis:** Erfordert Authentifizierung

---

### Kunde aktualisieren

```typescript
const customer: Customer = await api.updateCustomer(
  id: number,
  request: UpdateCustomerRequest
)
```

**UpdateCustomerRequest:**
```typescript
interface UpdateCustomerRequest {
  firstName?: string
  lastName?: string
  email?: string
  phone?: string
  address?: string
  driverLicenseNumber?: string
}
```

**Beispiel:**
```typescript
try {
  const updated = await api.updateCustomer(customerId, {
    phone: '+49 987 654321',
    address: 'Neue Straße 2, 54321 München'
  })
  console.log('Profil aktualisiert')
} catch (error) {
  console.error('Update fehlgeschlagen:', error)
}
```

**Backend Endpoint:** `PUT /api/customers/{id}`

**Returns:** `Customer`

---

## 🔧 Error Handling

### Automatisches Error Handling

Der API Client hat einen Response Interceptor, der automatisch:

1. **401 Unauthorized** - Entfernt Auth-Token und leitet zum Login um
2. **Error Logging** - Loggt alle Fehler in die Konsole

### Manuelles Error Handling

```typescript
try {
  const result = await api.getVehicleById(1)
} catch (error) {
  if (error.response) {
    // Server hat geantwortet mit Status-Code außerhalb 2xx
    switch (error.response.status) {
      case 404:
        console.error('Nicht gefunden')
        break
      case 401:
        console.error('Nicht autorisiert')
        break
      case 403:
        console.error('Zugriff verweigert')
        break
      case 500:
        console.error('Server-Fehler')
        break
      default:
        console.error('Unbekannter Fehler:', error.response.status)
    }
  } else if (error.request) {
    // Request wurde gesendet, aber keine Antwort erhalten
    console.error('Keine Verbindung zum Server')
  } else {
    // Fehler beim Erstellen des Requests
    console.error('Request-Fehler:', error.message)
  }
}
```

---

## 📝 TypeScript Types

### Vehicle

```typescript
interface Vehicle {
  id: number
  brand: string
  model: string
  vehicleType: VehicleType
  dailyPrice: number
  status: 'VERFÜGBAR' | 'VERMIETET' | 'WARTUNG'
  location: string
  imageUrl?: string
  imageGallery?: string[]
  licensePlate?: string
  year?: number
  mileage?: number
  fuelType?: string
  transmission?: string
  seats?: number
  features?: string[]
}
```

### Booking

```typescript
interface Booking {
  id: number
  vehicleId: number
  customerId: number
  pickupDate: string
  dropoffDate: string
  pickupTime?: string
  dropoffTime?: string
  status: 'PENDING' | 'CONFIRMED' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED'
  totalPrice: number
  createdAt: string
  updatedAt: string
}
```

### Customer

```typescript
interface Customer {
  id: number
  username: string
  firstName: string
  lastName: string
  email: string
  phone: string
  address?: string
  driverLicenseNumber: string
  createdAt: string
  updatedAt: string
}
```

---

## 🔒 Sicherheit

### Sensible Daten

- **Email, Phone, Address, DriverLicense** werden vom Backend verschlüsselt gespeichert
- Im Frontend werden diese als `[ENCRYPTED]` angezeigt
- Nur das Backend kann die Daten entschlüsseln

### Authentifizierung

- **HTTP Basic Auth** wird für alle authentifizierten Requests verwendet
- Token wird in `localStorage` gespeichert (Base64-encoded `username:password`)
- Bei 401-Fehlern wird der Token automatisch entfernt

---

## 💡 Best Practices

### 1. Immer Error Handling verwenden

```typescript
// ❌ Schlecht
const vehicles = await api.getAllVehicles()

// ✅ Gut
try {
  const vehicles = await api.getAllVehicles()
  // Verarbeite Daten
} catch (error) {
  // Handle Error
  console.error('Fehler:', error)
}
```

### 2. Loading States verwenden

```typescript
const [loading, setLoading] = useState(false)
const [error, setError] = useState<string | null>(null)

const loadData = async () => {
  setLoading(true)
  setError(null)
  try {
    const data = await api.getAllVehicles()
    setVehicles(data)
  } catch (err) {
    setError('Fehler beim Laden')
  } finally {
    setLoading(false)
  }
}
```

### 3. Type Safety nutzen

```typescript
// ✅ TypeScript Types werden automatisch verwendet
const vehicle: Vehicle = await api.getVehicleById(1)
// vehicle hat alle Vehicle-Properties mit korrekten Types
```

---

## 📚 Weitere Ressourcen

- **Backend API Docs:** `http://localhost:8081/swagger-ui.html`
- **Type Definitions:** `src/types/`
- **API Client Source:** `src/services/api.ts`

---

**Status:** ✅ Vollständig dokumentiert


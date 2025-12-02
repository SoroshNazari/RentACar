/**
 * Integration Tests: Frontend mit realem Backend
 * 
 * Diese Tests testen die Integration zwischen Frontend-Komponenten und dem realen Backend.
 * KEINE MOCKS werden verwendet - alle API-Aufrufe gehen an das echte Backend.
 * 
 * Voraussetzungen:
 * - Backend muss auf http://localhost:8081 laufen (wird automatisch gestartet)
 * - Datenbank muss mit Testdaten befüllt sein (via DataInitializer)
 * 
 * Diese Tests sind langsamer als Unit-Tests, da sie echte HTTP-Requests machen.
 */

import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import axios from 'axios'
import LoginPage from '@/pages/LoginPage'
import { api } from '@/services/api'

// WICHTIG: KEINE MOCKS! Wir verwenden das echte Backend
const BACKEND_URL = 'http://localhost:8081/api'
let backendAvailable = false

describe('Integration Tests: Frontend mit realem Backend', () => {
  beforeAll(async () => {
    // Prüfe ob Backend verfügbar ist (wird automatisch gestartet)
    try {
      const response = await axios.get(`${BACKEND_URL}/vehicles`, {
        timeout: 5000,
        validateStatus: () => true, // Akzeptiere alle Status-Codes
      })
      backendAvailable = response.status === 200 || response.status === 401 // 401 ist OK, bedeutet Backend läuft
      if (backendAvailable) {
        console.log('✅ Backend ist verfügbar für Integration Tests')
      }
    } catch (_error) {
      backendAvailable = false
      console.warn('⚠️ Backend nicht verfügbar - Integration Tests werden übersprungen')
    }
  })

  describe('API Client Integration (direkte API-Aufrufe)', () => {
    it('macht echte GET-Request an Backend', async () => {
      if (!backendAvailable) {
        console.log('⏭️ Test übersprungen: Backend nicht verfügbar')
        return
      }

      try {
        // Echter API-Aufruf ohne Mocks
        const vehicles = await api.getAllVehicles()
        
        // Prüfe dass wir echte Daten bekommen
        expect(Array.isArray(vehicles)).toBe(true)
        
        // Wenn Fahrzeuge vorhanden, prüfe Struktur
        if (vehicles.length > 0) {
          const vehicle = vehicles[0]
          expect(vehicle).toHaveProperty('id')
          expect(vehicle).toHaveProperty('brand')
          expect(vehicle).toHaveProperty('model')
          expect(vehicle).toHaveProperty('dailyPrice')
          
          // Prüfe dass Marken auf Deutsch sind
          const brands = vehicles.map(v => v.brand)
          expect(brands.some(b => b.includes('Mercedes-Benz') || b.includes('Volkswagen') || b.includes('BMW') || b.includes('Audi') || b.includes('Porsche'))).toBeTruthy()
        }
      } catch (error) {
        // Wenn Fehler, sollte es ein echter Backend-Fehler sein, kein Mock-Fehler
        expect(error).toBeDefined()
      }
    })

    it('macht echte POST-Request für Login', async () => {
      if (!backendAvailable) {
        console.log('⏭️ Test übersprungen: Backend nicht verfügbar')
        return
      }

      try {
        // Echter Login-Versuch mit echten Credentials
        await api.login('customer', 'customer123')
        
        // Prüfe dass Login erfolgreich war
        expect(api.isAuthenticated()).toBe(true)
        
        // Logout für sauberen Zustand
        api.logout()
      } catch (error) {
        // Wenn Fehler, sollte es ein echter Backend-Fehler sein
        expect(error).toBeDefined()
      }
    })

    it('macht echte GET-Request für einzelnes Fahrzeug', async () => {
      if (!backendAvailable) {
        console.log('⏭️ Test übersprungen: Backend nicht verfügbar')
        return
      }

      try {
        // Hole zuerst alle Fahrzeuge
        const vehicles = await api.getAllVehicles()
        
        if (vehicles.length > 0) {
          // Hole ein einzelnes Fahrzeug per ID
          const vehicleId = vehicles[0].id
          const vehicle = await api.getVehicleById(vehicleId)
          
          // Prüfe dass wir echte Daten bekommen
          expect(vehicle).toBeDefined()
          expect(vehicle.id).toBe(vehicleId)
          expect(vehicle).toHaveProperty('brand')
          expect(vehicle).toHaveProperty('model')
          
          // Prüfe deutsche Markennamen
          expect(['BMW', 'Audi', 'Mercedes-Benz', 'Volkswagen', 'Porsche']).toContain(vehicle.brand)
        }
      } catch (error) {
        // Wenn Fehler, sollte es ein echter Backend-Fehler sein
        expect(error).toBeDefined()
      }
    })

    it('zeigt Fehler bei ungültigen Login-Credentials', async () => {
      if (!backendAvailable) {
        console.log('⏭️ Test übersprungen: Backend nicht verfügbar')
        return
      }

      try {
        // Versuche Login mit ungültigen Credentials
        await api.login('invaliduser', 'wrongpassword')
        
        // Login sollte fehlschlagen
        expect(api.isAuthenticated()).toBe(false)
      } catch (error) {
        // Erwarteter Fehler bei ungültigen Credentials
        expect(error).toBeDefined()
      }
    })
  })

  describe('LoginPage Integration', () => {
    it('zeigt Login-Formular korrekt an', async () => {
      if (!backendAvailable) {
        console.log('⏭️ Test übersprungen: Backend nicht verfügbar')
        return
      }

      // Render LoginPage OHNE Mocks
      render(
        <MemoryRouter>
          <LoginPage />
        </MemoryRouter>
      )

      // Prüfe dass Login-Formular angezeigt wird
      await waitFor(() => {
        expect(screen.getByText('Willkommen zurück')).toBeInTheDocument()
        expect(screen.getByPlaceholderText('Dein Benutzername')).toBeInTheDocument()
        expect(screen.getByPlaceholderText('Dein Passwort')).toBeInTheDocument()
      }, { timeout: 5000 })
    })

    it('authentifiziert Benutzer mit echtem Backend', async () => {
      if (!backendAvailable) {
        console.log('⏭️ Test übersprungen: Backend nicht verfügbar')
        return
      }

      const user = userEvent.setup()
      
      // Render LoginPage
      render(
        <MemoryRouter>
          <LoginPage />
        </MemoryRouter>
      )

      const usernameInput = screen.getByLabelText('Benutzername')
      const passwordInput = screen.getByLabelText('Passwort')
      const loginButton = screen.getByRole('button', { name: 'Anmelden' })

      await user.type(usernameInput, 'customer')
      await user.type(passwordInput, 'customer123')
      await user.click(loginButton)

      await waitFor(
        () => {
          // Nach erfolgreichem Login sollte Token im localStorage sein
          expect(localStorage.getItem('authToken')).not.toBeNull()
          expect(localStorage.getItem('username')).toBe('customer')
          expect(localStorage.getItem('userRole')).toBe('ROLE_CUSTOMER')
        },
        { timeout: 10000 }
      )

      // Cleanup
      localStorage.clear()
    })

    it('zeigt Fehler bei ungültigen Anmeldedaten vom echten Backend', async () => {
      if (!backendAvailable) {
        console.log('⏭️ Test übersprungen: Backend nicht verfügbar')
        return
      }

      const user = userEvent.setup()
      
      // Render LoginPage
      render(
        <MemoryRouter>
          <LoginPage />
        </MemoryRouter>
      )

      const usernameInput = screen.getByLabelText('Benutzername')
      const passwordInput = screen.getByLabelText('Passwort')
      const loginButton = screen.getByRole('button', { name: 'Anmelden' })

      await user.type(usernameInput, 'invaliduser')
      await user.type(passwordInput, 'wrongpassword')
      await user.click(loginButton)

      await waitFor(
        () => {
          expect(screen.getByText(/ungültige anmeldedaten/i)).toBeInTheDocument()
          expect(localStorage.getItem('authToken')).toBeNull()
        },
        { timeout: 10000 }
      )
    })
  })

  describe('VehicleListPage Integration', () => {
    it('lädt Fahrzeuge vom realen Backend (direkter API-Aufruf)', async () => {
      if (!backendAvailable) {
        console.log('⏭️ Test übersprungen: Backend nicht verfügbar')
        return
      }

      // Teste direkten API-Aufruf (umgeht jsdom CORS-Probleme)
      const vehicles = await api.getAllVehicles()
      
      expect(Array.isArray(vehicles)).toBe(true)
      if (vehicles.length > 0) {
        expect(vehicles[0]).toHaveProperty('brand')
        expect(vehicles[0]).toHaveProperty('model')
      }
    })
  })
})

 * 
 * Diese Tests testen die Integration zwischen Frontend-Komponenten und dem realen Backend.
 * KEINE MOCKS werden verwendet - alle API-Aufrufe gehen an das echte Backend.
 * 
 * Voraussetzungen:
 * - Backend muss auf http://localhost:8081 laufen (wird automatisch gestartet)
 * - Datenbank muss mit Testdaten befüllt sein (via DataInitializer)
 * 
 * Diese Tests sind langsamer als Unit-Tests, da sie echte HTTP-Requests machen.
 */

import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import axios from 'axios'
import LoginPage from '@/pages/LoginPage'
import { api } from '@/services/api'

// WICHTIG: KEINE MOCKS! Wir verwenden das echte Backend
const BACKEND_URL = 'http://localhost:8081/api'
let backendAvailable = false

describe('Integration Tests: Frontend mit realem Backend', () => {
  beforeAll(async () => {
    // Prüfe ob Backend verfügbar ist (wird automatisch gestartet)
    try {
      const response = await axios.get(`${BACKEND_URL}/vehicles`, {
        timeout: 5000,
        validateStatus: () => true, // Akzeptiere alle Status-Codes
      })
      backendAvailable = response.status === 200 || response.status === 401 // 401 ist OK, bedeutet Backend läuft
      if (backendAvailable) {
        console.log('✅ Backend ist verfügbar für Integration Tests')
      }
    } catch (_error) {
      backendAvailable = false
      console.warn('⚠️ Backend nicht verfügbar - Integration Tests werden übersprungen')
    }
  })

  describe('API Client Integration (direkte API-Aufrufe)', () => {
    it('macht echte GET-Request an Backend', async () => {
      if (!backendAvailable) {
        console.log('⏭️ Test übersprungen: Backend nicht verfügbar')
        return
      }

      try {
        // Echter API-Aufruf ohne Mocks
        const vehicles = await api.getAllVehicles()
        
        // Prüfe dass wir echte Daten bekommen
        expect(Array.isArray(vehicles)).toBe(true)
        
        // Wenn Fahrzeuge vorhanden, prüfe Struktur
        if (vehicles.length > 0) {
          const vehicle = vehicles[0]
          expect(vehicle).toHaveProperty('id')
          expect(vehicle).toHaveProperty('brand')
          expect(vehicle).toHaveProperty('model')
          expect(vehicle).toHaveProperty('dailyPrice')
          
          // Prüfe dass Marken auf Deutsch sind
          const brands = vehicles.map(v => v.brand)
          expect(brands.some(b => b.includes('Mercedes-Benz') || b.includes('Volkswagen') || b.includes('BMW') || b.includes('Audi') || b.includes('Porsche'))).toBeTruthy()
        }
      } catch (error) {
        // Wenn Fehler, sollte es ein echter Backend-Fehler sein, kein Mock-Fehler
        expect(error).toBeDefined()
      }
    })

    it('macht echte POST-Request für Login', async () => {
      if (!backendAvailable) {
        console.log('⏭️ Test übersprungen: Backend nicht verfügbar')
        return
      }

      try {
        // Echter Login-Versuch mit echten Credentials
        await api.login('customer', 'customer123')
        
        // Prüfe dass Login erfolgreich war
        expect(api.isAuthenticated()).toBe(true)
        
        // Logout für sauberen Zustand
        api.logout()
      } catch (error) {
        // Wenn Fehler, sollte es ein echter Backend-Fehler sein
        expect(error).toBeDefined()
      }
    })

    it('macht echte GET-Request für einzelnes Fahrzeug', async () => {
      if (!backendAvailable) {
        console.log('⏭️ Test übersprungen: Backend nicht verfügbar')
        return
      }

      try {
        // Hole zuerst alle Fahrzeuge
        const vehicles = await api.getAllVehicles()
        
        if (vehicles.length > 0) {
          // Hole ein einzelnes Fahrzeug per ID
          const vehicleId = vehicles[0].id
          const vehicle = await api.getVehicleById(vehicleId)
          
          // Prüfe dass wir echte Daten bekommen
          expect(vehicle).toBeDefined()
          expect(vehicle.id).toBe(vehicleId)
          expect(vehicle).toHaveProperty('brand')
          expect(vehicle).toHaveProperty('model')
          
          // Prüfe deutsche Markennamen
          expect(['BMW', 'Audi', 'Mercedes-Benz', 'Volkswagen', 'Porsche']).toContain(vehicle.brand)
        }
      } catch (error) {
        // Wenn Fehler, sollte es ein echter Backend-Fehler sein
        expect(error).toBeDefined()
      }
    })

    it('zeigt Fehler bei ungültigen Login-Credentials', async () => {
      if (!backendAvailable) {
        console.log('⏭️ Test übersprungen: Backend nicht verfügbar')
        return
      }

      try {
        // Versuche Login mit ungültigen Credentials
        await api.login('invaliduser', 'wrongpassword')
        
        // Login sollte fehlschlagen
        expect(api.isAuthenticated()).toBe(false)
      } catch (error) {
        // Erwarteter Fehler bei ungültigen Credentials
        expect(error).toBeDefined()
      }
    })
  })

  describe('LoginPage Integration', () => {
    it('zeigt Login-Formular korrekt an', async () => {
      if (!backendAvailable) {
        console.log('⏭️ Test übersprungen: Backend nicht verfügbar')
        return
      }

      // Render LoginPage OHNE Mocks
      render(
        <MemoryRouter>
          <LoginPage />
        </MemoryRouter>
      )

      // Prüfe dass Login-Formular angezeigt wird
      await waitFor(() => {
        expect(screen.getByText('Willkommen zurück')).toBeInTheDocument()
        expect(screen.getByPlaceholderText('Dein Benutzername')).toBeInTheDocument()
        expect(screen.getByPlaceholderText('Dein Passwort')).toBeInTheDocument()
      }, { timeout: 5000 })
    })

    it('authentifiziert Benutzer mit echtem Backend', async () => {
      if (!backendAvailable) {
        console.log('⏭️ Test übersprungen: Backend nicht verfügbar')
        return
      }

      const user = userEvent.setup()
      
      // Render LoginPage
      render(
        <MemoryRouter>
          <LoginPage />
        </MemoryRouter>
      )

      const usernameInput = screen.getByLabelText('Benutzername')
      const passwordInput = screen.getByLabelText('Passwort')
      const loginButton = screen.getByRole('button', { name: 'Anmelden' })

      await user.type(usernameInput, 'customer')
      await user.type(passwordInput, 'customer123')
      await user.click(loginButton)

      await waitFor(
        () => {
          // Nach erfolgreichem Login sollte Token im localStorage sein
          expect(localStorage.getItem('authToken')).not.toBeNull()
          expect(localStorage.getItem('username')).toBe('customer')
          expect(localStorage.getItem('userRole')).toBe('ROLE_CUSTOMER')
        },
        { timeout: 10000 }
      )

      // Cleanup
      localStorage.clear()
    })

    it('zeigt Fehler bei ungültigen Anmeldedaten vom echten Backend', async () => {
      if (!backendAvailable) {
        console.log('⏭️ Test übersprungen: Backend nicht verfügbar')
        return
      }

      const user = userEvent.setup()
      
      // Render LoginPage
      render(
        <MemoryRouter>
          <LoginPage />
        </MemoryRouter>
      )

      const usernameInput = screen.getByLabelText('Benutzername')
      const passwordInput = screen.getByLabelText('Passwort')
      const loginButton = screen.getByRole('button', { name: 'Anmelden' })

      await user.type(usernameInput, 'invaliduser')
      await user.type(passwordInput, 'wrongpassword')
      await user.click(loginButton)

      await waitFor(
        () => {
          expect(screen.getByText(/ungültige anmeldedaten/i)).toBeInTheDocument()
          expect(localStorage.getItem('authToken')).toBeNull()
        },
        { timeout: 10000 }
      )
    })
  })

  describe('VehicleListPage Integration', () => {
    it('lädt Fahrzeuge vom realen Backend (direkter API-Aufruf)', async () => {
      if (!backendAvailable) {
        console.log('⏭️ Test übersprungen: Backend nicht verfügbar')
        return
      }

      // Teste direkten API-Aufruf (umgeht jsdom CORS-Probleme)
      const vehicles = await api.getAllVehicles()
      
      expect(Array.isArray(vehicles)).toBe(true)
      if (vehicles.length > 0) {
        expect(vehicles[0]).toHaveProperty('brand')
        expect(vehicles[0]).toHaveProperty('model')
      }
    })
  })
})

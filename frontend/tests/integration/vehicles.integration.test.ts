/**
 * Integration Test: Backend API direkt
 * 
 * Dieser Test testet die Backend-API direkt (ohne Frontend-Komponenten).
 * Für Frontend-Backend-Integration siehe: frontend-backend.integration.test.tsx
 */

import axios from 'axios'

describe('Integration: Backend API (direkt)', () => {
  const baseUrl = 'http://localhost:8081/api'

  let backendHealthy = false

  beforeAll(async () => {
    try {
      const res = await axios.get(`${baseUrl}/vehicles`, {
        timeout: 5000,
        validateStatus: () => true, // Akzeptiere alle Status-Codes
      })
      backendHealthy = res.status === 200 || res.status === 401 // 401 bedeutet Backend läuft
      if (backendHealthy) {
        console.log('✅ Backend API ist verfügbar für Integration Tests')
      }
    } catch {
      backendHealthy = false
      console.warn('⚠️ Backend API nicht verfügbar - Integration Tests werden übersprungen')
    }
  })

  it('GET /vehicles returns list from real backend', async () => {
    if (!backendHealthy) {
      console.log('⏭️ Test übersprungen: Backend nicht verfügbar')
      return
    }
    
    // Echter API-Aufruf an reales Backend
    const res = await axios.get(`${baseUrl}/vehicles`, {
      timeout: 10000,
    })
    
    expect(res.status).toBe(200)
    expect(Array.isArray(res.data)).toBe(true)
    
    // Prüfe dass echte Fahrzeuge mit deutschen Markennamen zurückkommen
    if (res.data.length > 0) {
      const vehicle = res.data[0]
      expect(vehicle).toHaveProperty('id')
      expect(vehicle).toHaveProperty('brand')
      expect(vehicle).toHaveProperty('model')
      
      // Prüfe deutsche Markennamen
      const brands = res.data.map((v: { brand: string }) => v.brand)
      expect(
        brands.some((b: string) => 
          b.includes('Mercedes-Benz') || 
          b.includes('Volkswagen') || 
          b === 'BMW' || 
          b === 'Audi' || 
          b === 'Porsche'
        )
      ).toBeTruthy()
    }
  })

  it('POST /auth/login authenticates customer with real backend', async () => {
    if (!backendHealthy) {
      console.log('⏭️ Test übersprungen: Backend nicht verfügbar')
      return
    }
    
    // Echter Login-Versuch an reales Backend
    const res = await axios.post(
      `${baseUrl}/auth/login`,
      {
        username: 'customer',
        password: 'customer123',
      },
      {
        timeout: 10000,
      }
    )
    
    expect(res.status).toBe(200)
    expect(res.data.authenticated).toBe(true)
    expect(res.data.username).toBe('customer')
  })

  it('GET /vehicles/{id} returns single vehicle from real backend', async () => {
    if (!backendHealthy) {
      console.log('⏭️ Test übersprungen: Backend nicht verfügbar')
      return
    }

    // Hole zuerst alle Fahrzeuge
    const vehiclesRes = await axios.get(`${baseUrl}/vehicles`, { timeout: 10000 })
    expect(vehiclesRes.status).toBe(200)
    expect(Array.isArray(vehiclesRes.data)).toBe(true)
    
    if (vehiclesRes.data.length > 0) {
      const vehicleId = vehiclesRes.data[0].id
      
      // Hole einzelnes Fahrzeug
      const vehicleRes = await axios.get(`${baseUrl}/vehicles/${vehicleId}`, {
        timeout: 10000,
      })
      
      expect(vehicleRes.status).toBe(200)
      expect(vehicleRes.data).toHaveProperty('id')
      expect(vehicleRes.data.id).toBe(vehicleId)
      expect(vehicleRes.data).toHaveProperty('brand')
      expect(vehicleRes.data).toHaveProperty('model')
    }
  })
})

    })
    
    expect(res.status).toBe(200)
    expect(Array.isArray(res.data)).toBe(true)
    
    // Prüfe dass echte Fahrzeuge mit deutschen Markennamen zurückkommen
    if (res.data.length > 0) {
      const vehicle = res.data[0]
      expect(vehicle).toHaveProperty('id')
      expect(vehicle).toHaveProperty('brand')
      expect(vehicle).toHaveProperty('model')
      
      // Prüfe deutsche Markennamen
      const brands = res.data.map((v: { brand: string }) => v.brand)
      expect(
        brands.some((b: string) => 
          b.includes('Mercedes-Benz') || 
          b.includes('Volkswagen') || 
          b === 'BMW' || 
          b === 'Audi' || 
          b === 'Porsche'
        )
      ).toBeTruthy()
    }
  })

  it('POST /auth/login authenticates customer with real backend', async () => {
    if (!backendHealthy) {
      console.log('⏭️ Test übersprungen: Backend nicht verfügbar')
      return
    }
    
    // Echter Login-Versuch an reales Backend
    const res = await axios.post(
      `${baseUrl}/auth/login`,
      {
        username: 'customer',
        password: 'customer123',
      },
      {
        timeout: 10000,
      }
    )
    
    expect(res.status).toBe(200)
    expect(res.data.authenticated).toBe(true)
    expect(res.data.username).toBe('customer')
  })

  it('GET /vehicles/{id} returns single vehicle from real backend', async () => {
    if (!backendHealthy) {
      console.log('⏭️ Test übersprungen: Backend nicht verfügbar')
      return
    }

    // Hole zuerst alle Fahrzeuge
    const vehiclesRes = await axios.get(`${baseUrl}/vehicles`, { timeout: 10000 })
    expect(vehiclesRes.status).toBe(200)
    expect(Array.isArray(vehiclesRes.data)).toBe(true)
    
    if (vehiclesRes.data.length > 0) {
      const vehicleId = vehiclesRes.data[0].id
      
      // Hole einzelnes Fahrzeug
      const vehicleRes = await axios.get(`${baseUrl}/vehicles/${vehicleId}`, {
        timeout: 10000,
      })
      
      expect(vehicleRes.status).toBe(200)
      expect(vehicleRes.data).toHaveProperty('id')
      expect(vehicleRes.data.id).toBe(vehicleId)
      expect(vehicleRes.data).toHaveProperty('brand')
      expect(vehicleRes.data).toHaveProperty('model')
    }
  })
})

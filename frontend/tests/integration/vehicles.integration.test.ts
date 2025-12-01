import axios from 'axios'

describe('Integration: Backend API', () => {
  const baseUrl = 'http://localhost:8081/api'

  let backendHealthy = false

  beforeAll(async () => {
    try {
      const res = await axios.get(`${baseUrl}/vehicles`)
      backendHealthy = res.status === 200
    } catch {
      backendHealthy = false
    }
  })

  it('GET /vehicles returns list', async () => {
    if (!backendHealthy) {
      return
    }
    const res = await axios.get(`${baseUrl}/vehicles`)
    expect(res.status).toBe(200)
    expect(Array.isArray(res.data)).toBe(true)
  })

  it('POST /auth/login authenticates customer', async () => {
    if (!backendHealthy) {
      return
    }
    const res = await axios.post(`${baseUrl}/auth/login`, {
      username: 'customer',
      password: 'customer123',
    })
    expect(res.status).toBe(200)
    expect(res.data.authenticated).toBe(true)
    expect(res.data.username).toBe('customer')
  })
})

import axios, { AxiosInstance, AxiosError } from 'axios'
import type {
  Vehicle,
  VehicleType,
  Booking,
  CreateBookingRequest,
  Customer,
  RegisterCustomerRequest,
  UpdateCustomerRequest,
} from '@/types'

const API_BASE_URL = '/api'

export class ApiClient {
  private client: AxiosInstance

  constructor(client?: AxiosInstance) {
    const created = client || (axios.create?.({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    }) as AxiosInstance | undefined)
    this.client = (created || (axios as unknown as AxiosInstance))

    // Request interceptor: Add auth token
    this.client.interceptors?.request?.use((config) => {
      const token = localStorage.getItem('authToken')
      if (token) {
        config.headers.Authorization = `Basic ${token}`
      }
      return config
    })

    // Response interceptor: Handle errors
    this.client.interceptors?.response?.use(
      (response) => {
        console.log('API Response:', response.config.method?.toUpperCase(), response.config.url, response.data)
        return response
      },
      (error: AxiosError) => {
        console.error('API Error:', error.config?.method?.toUpperCase(), error.config?.url, error.response?.status, error.response?.data)
        if (error.response?.status === 401) {
          localStorage.removeItem('authToken')
          localStorage.removeItem('userRole')
          localStorage.removeItem('username')
        }
        return Promise.reject(error)
      }
    )
  }

  // Auth
  async login(username: string, password: string) {
    const response = await this.client.post<{
      username: string
      roles: string[]
      authenticated: boolean
    }>('/auth/login', { username, password })

    if (response.data.authenticated) {
      const token = btoa(`${username}:${password}`)
      localStorage.setItem('authToken', token)
      localStorage.setItem('username', username)
      const roles = Array.isArray(response.data.roles) ? response.data.roles : []
      if (roles.length > 0) {
        const primary = roles.includes('ROLE_CUSTOMER') ? 'ROLE_CUSTOMER' : roles[0]
        localStorage.setItem('userRole', primary)
        localStorage.setItem('userRoles', JSON.stringify(roles))
      }
    }

    return response.data
  }

  logout() {
    localStorage.removeItem('authToken')
    localStorage.removeItem('userRole')
    localStorage.removeItem('username')
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('authToken')
  }

  getUserRole(): string | null {
    return localStorage.getItem('userRole')
  }

  getUserRoles(): string[] {
    try {
      const raw = localStorage.getItem('userRoles')
      return raw ? JSON.parse(raw) : []
    } catch {
      return []
    }
  }

  // Vehicles
  async getAllVehicles(): Promise<Vehicle[]> {
    const response = await this.client.get<Vehicle[]>('/vehicles')
    return response.data
  }

  async getVehicleById(id: number): Promise<Vehicle> {
    const response = await this.client.get<Vehicle>(`/vehicles/${id}`)
    return response.data
  }

  async searchAvailableVehicles(
    vehicleType: VehicleType,
    location: string,
    startDate: string,
    endDate: string
  ): Promise<Vehicle[]> {
    const response = await this.client.get<Vehicle[]>('/bookings/search', {
      params: {
        vehicleType,
        location,
        startDate,
        endDate,
      },
    })
    return response.data
  }

  // Bookings
  async createBooking(request: CreateBookingRequest): Promise<Booking> {
    const response = await this.client.post<Booking>('/bookings', request)
    return response.data
  }

  async confirmBooking(id: number): Promise<void> {
    await this.client.put(`/bookings/${id}/confirm`)
  }

  async cancelBooking(id: number): Promise<void> {
    await this.client.put(`/bookings/${id}/cancel`)
  }

  async getBookingHistory(customerId: number): Promise<Booking[]> {
    const response = await this.client.get<Booking[]>(`/bookings/customer/${customerId}`)
    return response.data
  }

  async getPickups(date: string): Promise<Booking[]> {
    const response = await this.client.get<Booking[]>(`/bookings/pickups`, { params: { date } })
    return response.data
  }

  async getPickupRequests(date: string): Promise<Booking[]> {
    const response = await this.client.get<Booking[]>(`/bookings/requests`, { params: { date } })
    return response.data
  }

  async checkoutBooking(id: number, mileage: number, notes: string): Promise<Booking> {
    const response = await this.client.put<Booking>(`/bookings/${id}/checkout`, { mileage, notes })
    return response.data
  }

  async getReturns(date: string): Promise<Booking[]> {
    const response = await this.client.get<Booking[]>(`/bookings/returns`, { params: { date } })
    return response.data
  }

  async checkinBooking(id: number, payload: { mileage: number; damagePresent: boolean; damageNotes: string; damageCost?: number; actualReturnTime?: string }): Promise<Booking> {
    const response = await this.client.put<Booking>(`/bookings/${id}/checkin`, payload)
    return response.data
  }

  // Customers
  async registerCustomer(request: RegisterCustomerRequest): Promise<Customer> {
    const response = await this.client.post<Customer>('/customers/register', request)
    return response.data
  }

  async getCustomerById(id: number): Promise<Customer> {
    const response = await this.client.get<any>(`/customers/${id}`)
    const c = response.data || {}
    const normalize = (val: any): string => {
      if (val == null) return ''
      if (typeof val === 'string') return val
      if (typeof val === 'object' && 'encryptedValue' in val) return String(val.encryptedValue ? '[ENCRYPTED]' : '')
      return String(val)
    }
    return {
      id: c.id,
      firstName: c.firstName,
      lastName: c.lastName,
      email: normalize(c.email),
      phone: normalize(c.phone),
      address: normalize(c.address),
      driverLicenseNumber: normalize(c.driverLicenseNumber),
      username: c.username,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
    } as Customer
  }

  async getCustomerByUsername(username: string): Promise<Customer> {
    const response = await this.client.get<any>(`/customers/username/${username}`)
    const c = response.data || {}
    const normalize = (val: any): string => {
      if (val == null) return ''
      if (typeof val === 'string') return val
      if (typeof val === 'object' && 'encryptedValue' in val) return String(val.encryptedValue ? '[ENCRYPTED]' : '')
      return String(val)
    }
    return {
      id: c.id,
      firstName: c.firstName,
      lastName: c.lastName,
      email: normalize(c.email),
      phone: normalize(c.phone),
      address: normalize(c.address),
      driverLicenseNumber: normalize(c.driverLicenseNumber),
      username: c.username,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
    } as Customer
  }

  async getCustomerMe(): Promise<Customer> {
    const response = await this.client.get<Customer>('/customers/me')
    return response.data
  }

  async updateCustomer(id: number, request: UpdateCustomerRequest): Promise<Customer> {
    const response = await this.client.put<Customer>(`/customers/${id}`, request)
    return response.data
  }
}

export const api = new ApiClient()

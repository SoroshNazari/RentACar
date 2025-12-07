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

  private normalizePlate(val: unknown): string {
    if (val == null) return ''
    if (typeof val === 'string') return val
    if (typeof val === 'object') {
      const maybe = val as { value?: unknown; encryptedValue?: unknown }
      if (typeof maybe.value === 'string') return maybe.value
      if (maybe.encryptedValue != null) return '[ENCRYPTED]'
    }
    return String(val)
  }

  private normalizeVehicle(v: Vehicle | (Vehicle & { licensePlate?: unknown })): Vehicle {
    const lp = (v as unknown as { licensePlate?: unknown }).licensePlate
    return { ...v, licensePlate: this.normalizePlate(lp) }
  }

  constructor(client?: AxiosInstance) {
    const created =
      client ||
      (axios.create?.({
        baseURL: API_BASE_URL,
        headers: {
          'Content-Type': 'application/json',
        },
        withCredentials: true, // Wichtig: Session-Cookies mit jeder Anfrage senden
      }) as AxiosInstance | undefined)
    this.client = created || (axios as unknown as AxiosInstance)

    // Request interceptor: Add auth token and credentials
    this.client.interceptors?.request?.use(config => {
      const token = localStorage.getItem('authToken')
      if (token) {
        config.headers.Authorization = `Basic ${token}`
      }
      // Wichtig: Cookies (Session) mit jeder Anfrage senden
      config.withCredentials = true
      return config
    })

    // Response interceptor: Handle errors
    this.client.interceptors?.response?.use(
      response => {
        // Logging removed for production - use browser DevTools Network tab for debugging
        return response
      },
      (error: AxiosError) => {
        console.error(
          'API Error:',
          error.config?.method?.toUpperCase(),
          error.config?.url,
          error.response?.status,
          error.response?.data
        )
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
    const list = Array.isArray(response.data) ? response.data : []
    return list.map(v => this.normalizeVehicle(v))
  }

  async getVehicleById(id: number): Promise<Vehicle> {
    const response = await this.client.get<Vehicle>(`/vehicles/${id}`)
    return this.normalizeVehicle(response.data)
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
    const list = Array.isArray(response.data) ? response.data : []
    return list.map(v => this.normalizeVehicle(v))
  }

  async createVehicle(request: {
    licensePlate: string
    brand: string
    model: string
    type: VehicleType
    year?: number
    mileage: number
    location: string
    dailyPrice: number
    imageUrl?: string
    imageGallery?: string[]
  }): Promise<Vehicle> {
    const response = await this.client.post<Vehicle>('/vehicles', request)
    return this.normalizeVehicle(response.data)
  }

  async updateVehicle(
    id: number,
    request: {
      brand: string
      model: string
      type: VehicleType
      year?: number
      location: string
      dailyPrice: number
      imageUrl?: string
      imageGallery?: string[]
    }
  ): Promise<Vehicle> {
    const response = await this.client.put<Vehicle>(`/vehicles/${id}`, request)
    return this.normalizeVehicle(response.data)
  }

  async setVehicleOutOfService(id: number): Promise<void> {
    await this.client.put(`/vehicles/${id}/out-of-service`)
  }

  async updateVehicleLocation(id: number, location: string): Promise<Vehicle> {
    const response = await this.client.patch<Vehicle>(`/vehicles/${id}/location`, { location })
    return this.normalizeVehicle(response.data)
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

  async getAllBookings(): Promise<Booking[]> {
    const response = await this.client.get<Booking[]>('/bookings')
    return Array.isArray(response.data) ? response.data : []
  }

  private normalizeCustomer(c: any): Customer {
    const normalize = (val: unknown): string => {
      if (val == null) return ''
      if (typeof val === 'string') return val
      if (typeof val === 'object' && val !== null && 'encryptedValue' in val)
        return String((val as { encryptedValue?: string }).encryptedValue ? '[ENCRYPTED]' : '')
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

  async getAllCustomers(): Promise<Customer[]> {
    const response = await this.client.get<Customer[]>('/customers')
    const customers = Array.isArray(response.data) ? response.data : []
    return customers.map(c => this.normalizeCustomer(c))
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

  async checkinBooking(
    id: number,
    payload: {
      mileage: number
      damagePresent: boolean
      damageNotes: string
      damageCost?: number
      actualReturnTime?: string
    }
  ): Promise<Booking> {
    const response = await this.client.put<Booking>(`/bookings/${id}/checkin`, payload)
    return response.data
  }

  // Customers
  async registerCustomer(request: RegisterCustomerRequest): Promise<Customer | any> {
    const response = await this.client.post<any>('/customers/register', request)
    return response.data
  }

  async getCustomerById(id: number): Promise<Customer> {
    const response = await this.client.get<Customer>(`/customers/${id}`)
    const c = response.data || {}
    const normalize = (val: unknown): string => {
      if (val == null) return ''
      if (typeof val === 'string') return val
      if (typeof val === 'object' && val !== null && 'encryptedValue' in val)
        return String((val as { encryptedValue?: string }).encryptedValue ? '[ENCRYPTED]' : '')
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
    const response = await this.client.get<Customer>(`/customers/username/${username}`)
    const c = response.data || {}
    const normalize = (val: unknown): string => {
      if (val == null) return ''
      if (typeof val === 'string') return val
      if (typeof val === 'object' && val !== null && 'encryptedValue' in val)
        return String((val as { encryptedValue?: string }).encryptedValue ? '[ENCRYPTED]' : '')
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
    try {
      const response = await this.client.get<any>('/customers/me')
      // Der Backend-Endpunkt gibt CustomerDetailsResponse zurück (nicht Customer)
      // Wir müssen es in Customer umwandeln
      const data = response.data
      
      // Debug: Log die Antwort
      console.log('getCustomerMe raw response:', response)
      console.log('getCustomerMe response.data:', data)
      console.log('getCustomerMe data.id:', data?.id, 'type:', typeof data?.id)
      
      if (!data) {
        console.error('No data in response:', response)
        throw new Error('Keine Daten in der Serverantwort')
      }
      
      // Prüfe verschiedene mögliche Formate
      const id = data.id !== undefined && data.id !== null ? Number(data.id) : null
      
      if (id === null || isNaN(id)) {
        console.error('Invalid or missing id:', data)
        // Versuche alternative Felder
        if (data.customerId) {
          console.log('Found customerId instead of id:', data.customerId)
          return {
            id: Number(data.customerId),
            firstName: data.firstName || '',
            lastName: data.lastName || '',
            email: data.email || '',
            phone: data.phone || '',
            address: data.address || '',
            driverLicenseNumber: data.driverLicenseNumber || '',
            username: data.username || '',
            createdAt: data.createdAt || new Date().toISOString(),
            updatedAt: data.updatedAt || new Date().toISOString(),
          } as Customer
        }
        throw new Error('ID fehlt in der Serverantwort')
      }
      
      return {
        id: id,
        firstName: data.firstName || '',
        lastName: data.lastName || '',
        email: data.email || '',
        phone: data.phone || '',
        address: data.address || '',
        driverLicenseNumber: data.driverLicenseNumber || '',
        username: data.username || '',
        createdAt: data.createdAt || new Date().toISOString(),
        updatedAt: data.updatedAt || new Date().toISOString(),
      } as Customer
    } catch (error) {
      console.error('Error in getCustomerMe:', error)
      throw error
    }
  }

  async updateCustomer(id: number, request: UpdateCustomerRequest): Promise<Customer> {
    const response = await this.client.put<Customer>(`/customers/${id}`, request)
    return response.data
  }
}

export const api = new ApiClient()

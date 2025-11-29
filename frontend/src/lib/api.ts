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

class ApiClient {
  private client: AxiosInstance

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    // Request interceptor: Add auth token
    this.client.interceptors.request.use((config) => {
      const token = localStorage.getItem('authToken')
      if (token) {
        config.headers.Authorization = `Basic ${token}`
      }
      return config
    })

    // Response interceptor: Handle errors
    this.client.interceptors.response.use(
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
          window.location.href = '/login'
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
      if (response.data.roles && response.data.roles.length > 0) {
        localStorage.setItem('userRole', response.data.roles[0])
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

  // Customers
  async registerCustomer(request: RegisterCustomerRequest): Promise<Customer> {
    const response = await this.client.post<Customer>('/customers/register', request)
    return response.data
  }

  async getCustomerById(id: number): Promise<Customer> {
    const response = await this.client.get<Customer>(`/customers/${id}`)
    return response.data
  }

  async getCustomerByUsername(username: string): Promise<Customer> {
    const response = await this.client.get<Customer>(`/customers/username/${username}`)
    return response.data
  }

  async updateCustomer(id: number, request: UpdateCustomerRequest): Promise<Customer> {
    const response = await this.client.put<Customer>(`/customers/${id}`, request)
    return response.data
  }
}

export const api = new ApiClient()


import axios from 'axios'
import { ApiClient } from '../api'
import type { Vehicle, Booking, Customer, CreateBookingRequest, RegisterCustomerRequest, UpdateCustomerRequest } from '@/types'

jest.mock('axios')

const mockedAxios = axios as jest.Mocked<typeof axios>

describe('ApiClient - Comprehensive Tests', () => {
  let api: ApiClient
  let mockClient: any

  beforeEach(() => {
    jest.clearAllMocks()
    localStorage.clear()
    
    mockClient = {
      get: jest.fn(),
      post: jest.fn(),
      put: jest.fn(),
      interceptors: {
        request: { use: jest.fn() },
        response: { use: jest.fn() }
      }
    }
    
    mockedAxios.create = jest.fn().mockReturnValue(mockClient)
    api = new ApiClient(mockClient)
  })

  describe('Authentication', () => {
    it('should login successfully and store auth data', async () => {
      const mockResponse = {
        data: {
          username: 'testuser',
          roles: ['ROLE_CUSTOMER'],
          authenticated: true
        }
      }
      mockClient.post.mockResolvedValue(mockResponse)

      const result = await api.login('testuser', 'password123')

      expect(mockClient.post).toHaveBeenCalledWith('/auth/login', { 
        username: 'testuser', 
        password: 'password123' 
      })
      expect(result).toEqual(mockResponse.data)
      expect(localStorage.getItem('authToken')).toBe(btoa('testuser:password123'))
      expect(localStorage.getItem('username')).toBe('testuser')
      expect(localStorage.getItem('userRole')).toBe('ROLE_CUSTOMER')
    })

    it('should handle login with multiple roles', async () => {
      const mockResponse = {
        data: {
          username: 'admin',
          roles: ['ROLE_ADMIN', 'ROLE_EMPLOYEE'],
          authenticated: true
        }
      }
      mockClient.post.mockResolvedValue(mockResponse)

      await api.login('admin', 'admin123')

      expect(localStorage.getItem('userRole')).toBe('ROLE_ADMIN')
      expect(localStorage.getItem('userRoles')).toBe(JSON.stringify(['ROLE_ADMIN', 'ROLE_EMPLOYEE']))
    })

    it('should logout and clear localStorage', () => {
      localStorage.setItem('authToken', 'token')
      localStorage.setItem('userRole', 'ROLE_CUSTOMER')
      localStorage.setItem('username', 'testuser')

      api.logout()

      expect(localStorage.getItem('authToken')).toBeNull()
      expect(localStorage.getItem('userRole')).toBeNull()
      expect(localStorage.getItem('username')).toBeNull()
    })

    it('should check authentication status', () => {
      expect(api.isAuthenticated()).toBe(false)
      
      localStorage.setItem('authToken', 'valid-token')
      expect(api.isAuthenticated()).toBe(true)
    })

    it('should get user role', () => {
      expect(api.getUserRole()).toBeNull()
      
      localStorage.setItem('userRole', 'ROLE_CUSTOMER')
      expect(api.getUserRole()).toBe('ROLE_CUSTOMER')
    })

    it('should get user roles', () => {
      expect(api.getUserRoles()).toEqual([])
      
      localStorage.setItem('userRoles', JSON.stringify(['ROLE_CUSTOMER']))
      expect(api.getUserRoles()).toEqual(['ROLE_CUSTOMER'])
      
      localStorage.setItem('userRoles', 'invalid-json')
      expect(api.getUserRoles()).toEqual([])
    })
  })

  describe('Vehicle Operations', () => {
    it('should get all vehicles', async () => {
      const mockVehicles: Vehicle[] = [
        {
          id: 1,
          brand: 'BMW',
          model: 'X5',
          vehicleType: 'SUV',
          pricePerDay: 100,
          location: 'Berlin',
          available: true,
          imageUrl: 'bmw-x5.jpg'
        }
      ]
      mockClient.get.mockResolvedValue({ data: mockVehicles })

      const result = await api.getAllVehicles()

      expect(mockClient.get).toHaveBeenCalledWith('/vehicles')
      expect(result).toEqual(mockVehicles)
    })

    it('should get vehicle by id', async () => {
      const mockVehicle: Vehicle = {
        id: 1,
        brand: 'BMW',
        model: 'X5',
        vehicleType: 'SUV',
        pricePerDay: 100,
        location: 'Berlin',
        available: true,
        imageUrl: 'bmw-x5.jpg'
      }
      mockClient.get.mockResolvedValue({ data: mockVehicle })

      const result = await api.getVehicleById(1)

      expect(mockClient.get).toHaveBeenCalledWith('/vehicles/1')
      expect(result).toEqual(mockVehicle)
    })

    it('should search available vehicles', async () => {
      const mockVehicles: Vehicle[] = [
        {
          id: 1,
          brand: 'VW',
          model: 'Golf',
          vehicleType: 'CAR',
          pricePerDay: 50,
          location: 'Munich',
          available: true,
          imageUrl: 'vw-golf.jpg'
        }
      ]
      mockClient.get.mockResolvedValue({ data: mockVehicles })

      const result = await api.searchAvailableVehicles(
        'CAR',
        'Munich',
        '2024-01-01',
        '2024-01-05'
      )

      expect(mockClient.get).toHaveBeenCalledWith('/bookings/search', {
        params: {
          vehicleType: 'CAR',
          location: 'Munich',
          startDate: '2024-01-01',
          endDate: '2024-01-05'
        }
      })
      expect(result).toEqual(mockVehicles)
    })
  })

  describe('Booking Operations', () => {
    it('should create booking', async () => {
      const bookingRequest: CreateBookingRequest = {
        vehicleId: 1,
        customerId: 1,
        startDate: '2024-01-01',
        endDate: '2024-01-05',
        totalPrice: 200
      }
      
      const mockBooking: Booking = {
        id: 1,
        vehicleId: 1,
        customerId: 1,
        startDate: '2024-01-01',
        endDate: '2024-01-05',
        totalPrice: 200,
        status: 'CONFIRMED',
        createdAt: '2024-01-01T00:00:00Z'
      }
      
      mockClient.post.mockResolvedValue({ data: mockBooking })

      const result = await api.createBooking(bookingRequest)

      expect(mockClient.post).toHaveBeenCalledWith('/bookings', bookingRequest)
      expect(result).toEqual(mockBooking)
    })

    it('should confirm booking', async () => {
      mockClient.put.mockResolvedValue({ data: {} })

      await api.confirmBooking(1)

      expect(mockClient.put).toHaveBeenCalledWith('/bookings/1/confirm')
    })

    it('should cancel booking', async () => {
      mockClient.put.mockResolvedValue({ data: {} })

      await api.cancelBooking(1)

      expect(mockClient.put).toHaveBeenCalledWith('/bookings/1/cancel')
    })

    it('should get booking history', async () => {
      const mockBookings: Booking[] = [
        {
          id: 1,
          vehicleId: 1,
          customerId: 1,
          startDate: '2024-01-01',
          endDate: '2024-01-05',
          totalPrice: 200,
          status: 'COMPLETED',
          createdAt: '2024-01-01T00:00:00Z'
        }
      ]
      mockClient.get.mockResolvedValue({ data: mockBookings })

      const result = await api.getBookingHistory(1)

      expect(mockClient.get).toHaveBeenCalledWith('/bookings/customer/1')
      expect(result).toEqual(mockBookings)
    })

    it('should get pickups', async () => {
      const mockBookings: Booking[] = [
        {
          id: 1,
          vehicleId: 1,
          customerId: 1,
          startDate: '2024-01-01',
          endDate: '2024-01-05',
          totalPrice: 200,
          status: 'CONFIRMED',
          createdAt: '2024-01-01T00:00:00Z'
        }
      ]
      mockClient.get.mockResolvedValue({ data: mockBookings })

      const result = await api.getPickups('2024-01-01')

      expect(mockClient.get).toHaveBeenCalledWith('/bookings/pickups', { params: { date: '2024-01-01' } })
      expect(result).toEqual(mockBookings)
    })

    it('should get pickup requests', async () => {
      const mockBookings: Booking[] = [
        {
          id: 1,
          vehicleId: 1,
          customerId: 1,
          startDate: '2024-01-01',
          endDate: '2024-01-05',
          totalPrice: 200,
          status: 'CONFIRMED',
          createdAt: '2024-01-01T00:00:00Z'
        }
      ]
      mockClient.get.mockResolvedValue({ data: mockBookings })

      const result = await api.getPickupRequests('2024-01-01')

      expect(mockClient.get).toHaveBeenCalledWith('/bookings/requests', { params: { date: '2024-01-01' } })
      expect(result).toEqual(mockBookings)
    })

    it('should checkout booking', async () => {
      const mockBooking: Booking = {
        id: 1,
        vehicleId: 1,
        customerId: 1,
        startDate: '2024-01-01',
        endDate: '2024-01-05',
        totalPrice: 200,
        status: 'CHECKED_OUT',
        createdAt: '2024-01-01T00:00:00Z'
      }
      mockClient.put.mockResolvedValue({ data: mockBooking })

      const result = await api.checkoutBooking(1, 50000, 'Good condition')

      expect(mockClient.put).toHaveBeenCalledWith('/bookings/1/checkout', { 
        mileage: 50000, 
        notes: 'Good condition' 
      })
      expect(result).toEqual(mockBooking)
    })

    it('should get returns', async () => {
      const mockBookings: Booking[] = [
        {
          id: 1,
          vehicleId: 1,
          customerId: 1,
          startDate: '2024-01-01',
          endDate: '2024-01-05',
          totalPrice: 200,
          status: 'CHECKED_OUT',
          createdAt: '2024-01-01T00:00:00Z'
        }
      ]
      mockClient.get.mockResolvedValue({ data: mockBookings })

      const result = await api.getReturns('2024-01-01')

      expect(mockClient.get).toHaveBeenCalledWith('/bookings/returns', { params: { date: '2024-01-01' } })
      expect(result).toEqual(mockBookings)
    })

    it('should checkin booking', async () => {
      const mockBooking: Booking = {
        id: 1,
        vehicleId: 1,
        customerId: 1,
        startDate: '2024-01-01',
        endDate: '2024-01-05',
        totalPrice: 200,
        status: 'COMPLETED',
        createdAt: '2024-01-01T00:00:00Z'
      }
      mockClient.put.mockResolvedValue({ data: mockBooking })

      const result = await api.checkinBooking(1, {
        mileage: 50100,
        damagePresent: false,
        damageNotes: 'No damage',
        actualReturnTime: '2024-01-05T10:00:00Z'
      })

      expect(mockClient.put).toHaveBeenCalledWith('/bookings/1/checkin', {
        mileage: 50100,
        damagePresent: false,
        damageNotes: 'No damage',
        actualReturnTime: '2024-01-05T10:00:00Z'
      })
      expect(result).toEqual(mockBooking)
    })
  })

  describe('Customer Operations', () => {
    it('should register customer', async () => {
      const registerRequest: RegisterCustomerRequest = {
        username: 'newuser',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        phone: '+1234567890',
        address: '123 Main St',
        driverLicenseNumber: 'DL123456'
      }
      
      const mockCustomer: Customer = {
        id: 1,
        username: 'newuser',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        phone: '+1234567890',
        address: '123 Main St',
        driverLicenseNumber: 'DL123456',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z'
      }
      
      mockClient.post.mockResolvedValue({ data: mockCustomer })

      const result = await api.registerCustomer(registerRequest)

      expect(mockClient.post).toHaveBeenCalledWith('/customers/register', registerRequest)
      expect(result).toEqual(mockCustomer)
    })

    it('should get customer by id with encrypted data handling', async () => {
      const mockResponse = {
        data: {
          id: 1,
          firstName: 'John',
          lastName: 'Doe',
          email: { encryptedValue: true },
          phone: '+1234567890',
          address: '123 Main St',
          driverLicenseNumber: { encryptedValue: false },
          username: 'johndoe',
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z'
        }
      }
      mockClient.get.mockResolvedValue(mockResponse)

      const result = await api.getCustomerById(1)

      expect(mockClient.get).toHaveBeenCalledWith('/customers/1')
      expect(result.email).toBe('[ENCRYPTED]')
      expect(result.driverLicenseNumber).toBe('')
    })

    it('should get customer by username', async () => {
      const mockCustomer: Customer = {
        id: 1,
        username: 'johndoe',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        phone: '+1234567890',
        address: '123 Main St',
        driverLicenseNumber: 'DL123456',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z'
      }
      mockClient.get.mockResolvedValue({ data: mockCustomer })

      const result = await api.getCustomerByUsername('johndoe')

      expect(mockClient.get).toHaveBeenCalledWith('/customers/username/johndoe')
      expect(result).toEqual(mockCustomer)
    })

    it('should get current customer', async () => {
      const mockCustomer: Customer = {
        id: 1,
        username: 'currentuser',
        firstName: 'Current',
        lastName: 'User',
        email: 'current@example.com',
        phone: '+1234567890',
        address: '123 Main St',
        driverLicenseNumber: 'DL123456',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z'
      }
      mockClient.get.mockResolvedValue({ data: mockCustomer })

      const result = await api.getCustomerMe()

      expect(mockClient.get).toHaveBeenCalledWith('/customers/me')
      expect(result).toEqual(mockCustomer)
    })

    it('should update customer', async () => {
      const updateRequest: UpdateCustomerRequest = {
        firstName: 'Jane',
        lastName: 'Doe',
        email: 'jane@example.com',
        phone: '+0987654321',
        address: '456 Oak St',
        driverLicenseNumber: 'DL654321'
      }
      
      const mockCustomer: Customer = {
        id: 1,
        username: 'johndoe',
        firstName: 'Jane',
        lastName: 'Doe',
        email: 'jane@example.com',
        phone: '+0987654321',
        address: '456 Oak St',
        driverLicenseNumber: 'DL654321',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T12:00:00Z'
      }
      
      mockClient.put.mockResolvedValue({ data: mockCustomer })

      const result = await api.updateCustomer(1, updateRequest)

      expect(mockClient.put).toHaveBeenCalledWith('/customers/1', updateRequest)
      expect(result).toEqual(mockCustomer)
    })
  })
})
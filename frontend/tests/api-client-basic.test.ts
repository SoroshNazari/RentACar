import { ApiClient } from '../src/services/api'

// Mock axios
jest.mock('axios', () => ({
  create: jest.fn(() => ({
    interceptors: {
      request: { use: jest.fn() },
      response: { use: jest.fn() }
    },
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn()
  }))
}))

describe('ApiClient Basic Tests', () => {
  let client: ApiClient

  beforeEach(() => {
    jest.clearAllMocks()
    client = new ApiClient()
  })

  it('creates an ApiClient instance', () => {
    expect(client).toBeInstanceOf(ApiClient)
  })

  it('has authentication methods', () => {
    expect(typeof client.isAuthenticated).toBe('function')
    expect(typeof client.getUserRole).toBe('function')
    expect(typeof client.getUserRoles).toBe('function')
    expect(typeof client.login).toBe('function')
    expect(typeof client.logout).toBe('function')
  })

  it('has vehicle methods', () => {
    expect(typeof client.getAllVehicles).toBe('function')
    expect(typeof client.getVehicleById).toBe('function')
    expect(typeof client.searchAvailableVehicles).toBe('function')
  })

  it('has booking methods', () => {
    expect(typeof client.createBooking).toBe('function')
    expect(typeof client.getBookingHistory).toBe('function')
    expect(typeof client.cancelBooking).toBe('function')
    expect(typeof client.confirmBooking).toBe('function')
  })

  it('has customer methods', () => {
    expect(typeof client.registerCustomer).toBe('function')
    expect(typeof client.getCustomerById).toBe('function')
    expect(typeof client.getCustomerMe).toBe('function')
    expect(typeof client.updateCustomer).toBe('function')
  })

  it('has rental methods', () => {
    expect(typeof client.getPickups).toBe('function')
    expect(typeof client.getPickupRequests).toBe('function')
    expect(typeof client.getReturns).toBe('function')
    expect(typeof client.checkinBooking).toBe('function')
    expect(typeof client.checkoutBooking).toBe('function')
  })
})

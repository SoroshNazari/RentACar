import { ApiClient } from '../api'

describe('ApiClient methods', () => {
  const mockClient = {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    interceptors: {
      request: { use: jest.fn() },
      response: { use: jest.fn() },
    },
  } as any

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('getAllVehicles returns data', async () => {
    const data = [{ id: '1' }]
    mockClient.get.mockResolvedValue({ status: 200, data })
    const api = new ApiClient(mockClient)
    const res = await api.getAllVehicles()
    expect(res).toEqual(data)
    expect(mockClient.get).toHaveBeenCalledWith('/vehicles')
  })

  it('getVehicleById returns item', async () => {
    const data = { id: '1' }
    mockClient.get.mockResolvedValue({ status: 200, data })
    const api = new ApiClient(mockClient)
    const res = await api.getVehicleById(1 as any)
    expect(res).toEqual(data)
    expect(mockClient.get).toHaveBeenCalledWith('/vehicles/1')
  })

  it('createBooking posts payload', async () => {
    const payload = { vehicleId: '1' }
    mockClient.post.mockResolvedValue({ status: 201, data: { id: 'bk1' } })
    const api = new ApiClient(mockClient)
    const res = await api.createBooking(payload as any)
    expect(res.id).toBe('bk1')
    expect(mockClient.post).toHaveBeenCalledWith('/bookings', payload)
  })

  it('searchAvailableVehicles passes params', async () => {
    const data = []
    mockClient.get.mockResolvedValue({ status: 200, data })
    const api = new ApiClient(mockClient)
    const res = await api.searchAvailableVehicles('SUV' as any, 'Berlin', '2025-01-01', '2025-01-05')
    expect(res).toEqual(data)
    expect(mockClient.get).toHaveBeenCalledWith('/bookings/search', {
      params: {
        vehicleType: 'SUV',
        location: 'Berlin',
        startDate: '2025-01-01',
        endDate: '2025-01-05',
      },
    })
  })
})

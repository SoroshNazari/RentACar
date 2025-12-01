import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import VehicleListPage from '../VehicleListPage'

jest.mock('@/lib/api', () => ({
  api: {
    getAllVehicles: jest.fn().mockResolvedValue([]),
    searchAvailableVehicles: jest.fn().mockResolvedValue([])
  }
}))

describe('VehicleListPage - Basic Tests', () => {
  it('renders without crashing', () => {
    render(
      <MemoryRouter>
        <VehicleListPage />
      </MemoryRouter>
    )
    
    expect(screen.getByText('Loading vehicles...')).toBeInTheDocument()
  })

  it('shows error message when loading fails', async () => {
    const { api } = jest.requireMock('@/lib/api')
    api.getAllVehicles.mockRejectedValueOnce({ response: { data: 'failure' } })

    render(
      <MemoryRouter>
        <VehicleListPage />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText('Error: "failure"')).toBeInTheDocument()
    })
  })

  it('renders available vehicles list', async () => {
    const { api } = jest.requireMock('@/lib/api')
    api.getAllVehicles.mockResolvedValueOnce([
      { id: 10, brand: 'BMW', model: '320d', type: 'MITTELKLASSE', dailyPrice: 60, status: 'VERFÜGBAR', location: 'Berlin', licensePlate: 'B-AB 1234' },
    ])

    render(
      <MemoryRouter>
        <VehicleListPage />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText('Available Vehicles')).toBeInTheDocument()
      expect(screen.getByText('BMW 320d')).toBeInTheDocument()
      expect(screen.getByText('Mid-size')).toBeInTheDocument()
      expect(screen.getByText(/60,00\s*€/)).toBeInTheDocument()
    })
  })

  it('uses searchAvailableVehicles when query params are present', async () => {
    const { api } = jest.requireMock('@/lib/api')
    api.searchAvailableVehicles.mockResolvedValueOnce([
      { id: 11, brand: 'Audi', model: 'A4', type: 'OBERKLASSE', dailyPrice: 90, status: 'VERFÜGBAR', location: 'Berlin', licensePlate: 'B-CD 5678' },
    ])

    render(
      <MemoryRouter initialEntries={[`/vehicles?location=Berlin&startDate=2025-12-01&endDate=2025-12-03&vehicleType=MITTELKLASSE`]}>
        <VehicleListPage />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText('Audi A4')).toBeInTheDocument()
    })
  })
})

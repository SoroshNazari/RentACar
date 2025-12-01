import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import VehicleDetailPage from '../VehicleDetailPage'

// Mock hooks
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({ id: '1' }),
  useSearchParams: () => [new URLSearchParams(), jest.fn()]
}))

jest.mock('@/lib/api', () => ({
  api: {
    getVehicleById: jest.fn().mockResolvedValue({
      id: 1,
      brand: 'BMW',
      model: '320d',
      type: 'MITTELKLASSE',
      dailyPrice: 60,
      location: 'Berlin',
      mileage: 50000,
      licensePlate: 'B-AB 1234',
      imageUrl: '',
    })
  }
}))

describe('VehicleDetailPage - Basic Tests', () => {
  it('renders without crashing', () => {
    render(
      <MemoryRouter>
        <VehicleDetailPage />
      </MemoryRouter>
    )
    
    expect(screen.getByText('Loading vehicle details...')).toBeInTheDocument()
  })

  it('renders vehicle details on successful load', async () => {
    const { api } = jest.requireMock('@/lib/api')
    api.getVehicleById.mockResolvedValueOnce({
      id: 1,
      brand: 'BMW',
      model: '320d',
      type: 'MITTELKLASSE',
      dailyPrice: 60,
      location: 'Berlin',
      mileage: 50000,
      licensePlate: 'B-AB 1234',
      imageUrl: '',
    })

    render(
      <MemoryRouter>
        <VehicleDetailPage />
      </MemoryRouter>
    )

    expect(await screen.findByText(/60,00\s*€/)).toBeInTheDocument()
    expect(await screen.findByText('Book Now')).toBeInTheDocument()
  })

  it('shows not found when API returns 404', async () => {
    const { api } = jest.requireMock('@/lib/api')
    api.getVehicleById.mockRejectedValueOnce({ response: { status: 404 } })

    render(
      <MemoryRouter>
        <VehicleDetailPage />
      </MemoryRouter>
    )
    expect(await screen.findByText('Vehicle not found')).toBeInTheDocument()
  })
})

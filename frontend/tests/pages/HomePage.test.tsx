import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import HomePage from '../HomePage'

// Mock the API module
jest.mock('@/lib/api', () => ({
  api: {
    getAllVehicles: jest.fn().mockResolvedValue([])
  }
}))

// Mock useNavigate
const mockNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate
}))

describe('HomePage - Basic Tests', () => {
  it('renders without crashing', () => {
    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>
    )
    
    expect(screen.getByText('Premium Car Rental Made Simple')).toBeInTheDocument()
  })

  it('displays hero section', () => {
    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>
    )
    
    expect(screen.getByText('Explore our fleet of top-tier vehicles for any occasion.')).toBeInTheDocument()
    expect(screen.getByText('Browse Vehicles')).toBeInTheDocument()
  })

  it('displays search form', () => {
    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>
    )
    
    expect(screen.getByText('Location')).toBeInTheDocument()
    expect(screen.getByText('Pick-up Date')).toBeInTheDocument()
    expect(screen.getByText('Drop-off Date')).toBeInTheDocument()
    expect(screen.getByText('Vehicle Type')).toBeInTheDocument()
    expect(screen.getByText('Search')).toBeInTheDocument()
  })

  it('displays features section', () => {
    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>
    )
    
    expect(screen.getByText('Best Prices Guaranteed')).toBeInTheDocument()
    expect(screen.getByText('24/7 Customer Support')).toBeInTheDocument()
    expect(screen.getByText('Fully Insured Rentals')).toBeInTheDocument()
  })

  it('shows empty state when no vehicles are available', async () => {
    const { api } = jest.requireMock('@/lib/api')
    api.getAllVehicles.mockResolvedValueOnce([])

    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText('No vehicles available at the moment.')).toBeInTheDocument()
    })
  })

  it('renders featured vehicles when available', async () => {
    const { api } = jest.requireMock('@/lib/api')
    api.getAllVehicles.mockResolvedValueOnce([
      { id: 1, brand: 'BMW', model: '320d', type: 'MITTELKLASSE', dailyPrice: 60, status: 'VERFÜGBAR', licensePlate: 'B-AB 1234' },
      { id: 2, brand: 'Audi', model: 'A4', type: 'OBERKLASSE', dailyPrice: 90, status: 'VERFÜGBAR', licensePlate: 'B-CD 5678' },
      { id: 3, brand: 'VW', model: 'Golf', type: 'KOMPAKTKLASSE', dailyPrice: 50, status: 'VERFÜGBAR', licensePlate: 'B-EF 9012' },
      { id: 4, brand: 'Mercedes', model: 'C200', type: 'OBERKLASSE', dailyPrice: 95, status: 'WARTUNG', licensePlate: 'B-GH 3456' }
    ])

    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText('Our Featured Vehicles')).toBeInTheDocument()
      expect(screen.getByText('BMW 320d')).toBeInTheDocument()
      expect(screen.getByText('Audi A4')).toBeInTheDocument()
      expect(screen.getByText('VW Golf')).toBeInTheDocument()
    })
  })

  it('search validation prevents navigation on missing fields', async () => {
    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>
    )

    const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {})
    fireEvent.click(screen.getByText('Search'))
    expect(alertSpy).toHaveBeenCalled()
    alertSpy.mockRestore()
  })

  it('navigates to vehicle list when search is valid', async () => {
    const { container } = render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>
    )

    fireEvent.change(screen.getByPlaceholderText('City, Airport, or Address'), { target: { value: 'Berlin' } })
    const today = new Date()
    const start = today.toISOString().split('T')[0]
    const end = new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    const dateInputs = Array.from(container.querySelectorAll('input[type="date"]')) as HTMLInputElement[]
    fireEvent.change(dateInputs[0], { target: { value: start } })
    fireEvent.change(dateInputs[1], { target: { value: end } })

    fireEvent.click(screen.getByText('Search'))
    expect(mockNavigate).toHaveBeenCalled()
  })
})

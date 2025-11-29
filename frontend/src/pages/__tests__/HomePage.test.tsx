import { render, screen, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import HomePage from '../HomePage'
import { api } from '@/lib/api'

jest.mock('@/lib/api')
const mockedApi = api as jest.Mocked<typeof api>

describe('HomePage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders homepage with hero section', () => {
    mockedApi.getAllVehicles = jest.fn().mockResolvedValue([])

    render(
      <BrowserRouter>
        <HomePage />
      </BrowserRouter>
    )

    expect(screen.getByText('Premium Car Rental Made Simple')).toBeInTheDocument()
    expect(screen.getByText('Browse Vehicles')).toBeInTheDocument()
  })

  it('displays search bar', () => {
    mockedApi.getAllVehicles = jest.fn().mockResolvedValue([])

    render(
      <BrowserRouter>
        <HomePage />
      </BrowserRouter>
    )

    expect(screen.getByPlaceholderText(/City, Airport/i)).toBeInTheDocument()
    expect(screen.getByText('Search')).toBeInTheDocument()
  })

  it('displays featured vehicles section', () => {
    mockedApi.getAllVehicles = jest.fn().mockResolvedValue([])

    render(
      <BrowserRouter>
        <HomePage />
      </BrowserRouter>
    )

    expect(screen.getByText('Our Featured Vehicles')).toBeInTheDocument()
  })
})


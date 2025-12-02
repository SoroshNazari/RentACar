import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import VehicleListPage from '@/pages/VehicleListPage'

jest.mock('@/services/api', () => ({
  api: {
    getAllVehicles: jest.fn().mockResolvedValue([]),
    searchAvailableVehicles: jest.fn().mockResolvedValue([]),
  },
}))

describe('VehicleListPage', () => {
  it('renders without crashing', () => {
    render(
      <MemoryRouter>
        <VehicleListPage />
      </MemoryRouter>
    )

    expect(screen.getByText('Fahrzeuge werden geladen...')).toBeInTheDocument()
  })

  it('shows error message when loading fails', async () => {
    const { api } = jest.requireMock('@/services/api')
    api.getAllVehicles.mockRejectedValueOnce({ response: { data: 'failure' } })

    render(
      <MemoryRouter>
        <VehicleListPage />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText(/Fehler:/i)).toBeInTheDocument()
    })
  })

  it('renders available vehicles list', async () => {
    const { api } = jest.requireMock('@/services/api')
    api.getAllVehicles.mockResolvedValueOnce([
      {
        id: 10,
        brand: 'BMW',
        model: '320d',
        type: 'MITTELKLASSE',
        dailyPrice: 60,
        status: 'VERFÜGBAR',
        location: 'Berlin',
        licensePlate: 'B-AB 1234',
      },
    ])

    render(
      <MemoryRouter>
        <VehicleListPage />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText('Verfügbare Fahrzeuge')).toBeInTheDocument()
      expect(screen.getByText('BMW 320d')).toBeInTheDocument()
      expect(screen.getByText(/Mittelklasse|Komaktklasse/i)).toBeInTheDocument()
      expect(screen.getByText(/60,00\s*€/)).toBeInTheDocument()
    })
  })

  it('uses searchAvailableVehicles when query params are present', async () => {
    const { api } = jest.requireMock('@/services/api')
    api.searchAvailableVehicles.mockResolvedValueOnce([
      {
        id: 11,
        brand: 'Audi',
        model: 'A4',
        type: 'OBERKLASSE',
        dailyPrice: 90,
        status: 'VERFÜGBAR',
        location: 'Berlin',
        licensePlate: 'B-CD 5678',
      },
    ])

    render(
      <MemoryRouter
        initialEntries={[
          `/vehicles?location=Berlin&startDate=2025-12-01&endDate=2025-12-03&vehicleType=MITTELKLASSE`,
        ]}
      >
        <VehicleListPage />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText('Audi A4')).toBeInTheDocument()
    })
  })

  it('displays empty state when no vehicles found', async () => {
    const { api } = jest.requireMock('@/services/api')
    api.getAllVehicles.mockResolvedValueOnce([])

    render(
      <MemoryRouter>
        <VehicleListPage />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText(/keine fahrzeuge verfügbar/i)).toBeInTheDocument()
    })
  })

  it('handles error with generic message', async () => {
    const { api } = jest.requireMock('@/services/api')
    api.getAllVehicles.mockRejectedValueOnce({ message: 'Network error' })

    render(
      <MemoryRouter>
        <VehicleListPage />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText(/fahrzeuge konnten nicht geladen werden/i)).toBeInTheDocument()
    })
  })

  it('handles error without response data', async () => {
    const { api } = jest.requireMock('@/services/api')
    api.getAllVehicles.mockRejectedValueOnce({})

    render(
      <MemoryRouter>
        <VehicleListPage />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText(/fahrzeuge konnten nicht geladen werden/i)).toBeInTheDocument()
    })
  })

  it('handles ECONNREFUSED error', async () => {
    const { api } = jest.requireMock('@/services/api')
    api.getAllVehicles.mockRejectedValueOnce({ code: 'ECONNREFUSED' })

    render(
      <MemoryRouter>
        <VehicleListPage />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText(/backend-server läuft nicht/i)).toBeInTheDocument()
    })
  })

  it('handles 403 error', async () => {
    const { api } = jest.requireMock('@/services/api')
    api.getAllVehicles.mockRejectedValueOnce({ response: { status: 403 } })

    render(
      <MemoryRouter>
        <VehicleListPage />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText(/zugriff verweigert/i)).toBeInTheDocument()
    })
  })

  it('displays multiple vehicles correctly', async () => {
    const { api } = jest.requireMock('@/services/api')
    api.getAllVehicles.mockResolvedValueOnce([
      {
        id: 1,
        brand: 'BMW',
        model: '320d',
        type: 'MITTELKLASSE',
        dailyPrice: 60,
        status: 'VERFÜGBAR',
        location: 'Berlin',
        licensePlate: 'B-AB 1234',
      },
      {
        id: 2,
        brand: 'Audi',
        model: 'A4',
        type: 'OBERKLASSE',
        dailyPrice: 90,
        status: 'VERFÜGBAR',
        location: 'Munich',
        licensePlate: 'M-CD 5678',
      },
    ])

    render(
      <MemoryRouter>
        <VehicleListPage />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText('BMW 320d')).toBeInTheDocument()
      expect(screen.getByText('Audi A4')).toBeInTheDocument()
    })
  })

  it('handles image error and shows fallback', async () => {
    const { api } = jest.requireMock('@/services/api')
    api.getAllVehicles.mockResolvedValueOnce([
      {
        id: 1,
        brand: 'BMW',
        model: '320d',
        type: 'MITTELKLASSE',
        dailyPrice: 60,
        status: 'VERFÜGBAR',
        location: 'Berlin',
        licensePlate: 'B-AB 1234',
        imageUrl: 'invalid-url',
      },
    ])

    const { container } = render(
      <MemoryRouter>
        <VehicleListPage />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText('BMW 320d')).toBeInTheDocument()
    })

    const img = container.querySelector('img') as HTMLImageElement
    if (img) {
      fireEvent.error(img)
      await waitFor(() => {
        expect(container.querySelector('span.text-6xl')).toBeInTheDocument()
      }, { timeout: 5000 })
    }
  })

  it('renders vehicle cards with correct structure', async () => {
    const { api } = jest.requireMock('@/services/api')
    api.getAllVehicles.mockResolvedValueOnce([
      {
        id: 1,
        brand: 'BMW',
        model: '320d',
        type: 'MITTELKLASSE',
        dailyPrice: 60,
        status: 'VERFÜGBAR',
        location: 'Berlin',
        licensePlate: 'B-AB 1234',
      },
    ])

    const { container } = render(
      <MemoryRouter>
        <VehicleListPage />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText('BMW 320d')).toBeInTheDocument()
    })

    const vehicleCards = container.querySelectorAll('.card')
    expect(vehicleCards.length).toBeGreaterThan(0)
  })
})

        model: '320d',
        type: 'MITTELKLASSE',
        dailyPrice: 60,
        status: 'VERFÜGBAR',
        location: 'Berlin',
        licensePlate: 'B-AB 1234',
      },
      {
        id: 2,
        brand: 'Audi',
        model: 'A4',
        type: 'OBERKLASSE',
        dailyPrice: 90,
        status: 'VERFÜGBAR',
        location: 'Munich',
        licensePlate: 'M-CD 5678',
      },
    ])

    render(
      <MemoryRouter>
        <VehicleListPage />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText('BMW 320d')).toBeInTheDocument()
      expect(screen.getByText('Audi A4')).toBeInTheDocument()
    })
  })

  it('handles image error and shows fallback', async () => {
    const { api } = jest.requireMock('@/services/api')
    api.getAllVehicles.mockResolvedValueOnce([
      {
        id: 1,
        brand: 'BMW',
        model: '320d',
        type: 'MITTELKLASSE',
        dailyPrice: 60,
        status: 'VERFÜGBAR',
        location: 'Berlin',
        licensePlate: 'B-AB 1234',
        imageUrl: 'invalid-url',
      },
    ])

    const { container } = render(
      <MemoryRouter>
        <VehicleListPage />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText('BMW 320d')).toBeInTheDocument()
    })

    const img = container.querySelector('img') as HTMLImageElement
    if (img) {
      fireEvent.error(img)
      await waitFor(() => {
        expect(container.querySelector('span.text-6xl')).toBeInTheDocument()
      }, { timeout: 5000 })
    }
  })

  it('renders vehicle cards with correct structure', async () => {
    const { api } = jest.requireMock('@/services/api')
    api.getAllVehicles.mockResolvedValueOnce([
      {
        id: 1,
        brand: 'BMW',
        model: '320d',
        type: 'MITTELKLASSE',
        dailyPrice: 60,
        status: 'VERFÜGBAR',
        location: 'Berlin',
        licensePlate: 'B-AB 1234',
      },
    ])

    const { container } = render(
      <MemoryRouter>
        <VehicleListPage />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText('BMW 320d')).toBeInTheDocument()
    })

    const vehicleCards = container.querySelectorAll('.card')
    expect(vehicleCards.length).toBeGreaterThan(0)
  })
})

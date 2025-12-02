import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import HomePage from '@/pages/HomePage'

// Mock the API module
jest.mock('@/services/api', () => ({
  api: {
    getAllVehicles: jest.fn().mockResolvedValue([]),
  },
}))

// Mock useNavigate
const mockNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}))

describe('HomePage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockNavigate.mockClear()
  })

  it('renders without crashing', () => {
    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>
    )

    expect(screen.getByText('Premium Autovermietung einfach gemacht')).toBeInTheDocument()
  })

  it('displays hero section with German text', () => {
    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>
    )

    expect(screen.getByText('Premium Autovermietung einfach gemacht')).toBeInTheDocument()
    expect(screen.getByText('Entdecke unsere Flotte erstklassiger Fahrzeuge für jeden Anlass.')).toBeInTheDocument()
    expect(screen.getByText('Fahrzeuge durchsuchen')).toBeInTheDocument()
  })

  it('displays search form with German labels', () => {
    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>
    )

    expect(screen.getByText('Standort')).toBeInTheDocument()
    expect(screen.getByText('Abholdatum')).toBeInTheDocument()
    expect(screen.getByText('Rückgabedatum')).toBeInTheDocument()
    expect(screen.getByText('Fahrzeugtyp')).toBeInTheDocument()
    expect(screen.getByText('Suchen')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Stadt, Flughafen oder Adresse')).toBeInTheDocument()
  })

  it('displays features section with German text', () => {
    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>
    )

    expect(screen.getByText('Beste Preise garantiert')).toBeInTheDocument()
    expect(screen.getByText('24/7 Kundensupport')).toBeInTheDocument()
    expect(screen.getByText('Vollständig versicherte Mieten')).toBeInTheDocument()
  })

  it('shows empty state when no vehicles are available', async () => {
    const { api } = jest.requireMock('@/services/api')
    api.getAllVehicles.mockResolvedValueOnce([])

    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText(/keine fahrzeuge verfügbar/i)).toBeInTheDocument()
    })
  })

  it('renders featured vehicles when available', async () => {
    const { api } = jest.requireMock('@/services/api')
    api.getAllVehicles.mockResolvedValueOnce([
      {
        id: 1,
        brand: 'BMW',
        model: '320d',
        type: 'MITTELKLASSE',
        dailyPrice: 60,
        status: 'VERFÜGBAR',
        licensePlate: 'B-AB 1234',
      },
      {
        id: 2,
        brand: 'Audi',
        model: 'A4',
        type: 'OBERKLASSE',
        dailyPrice: 90,
        status: 'VERFÜGBAR',
        licensePlate: 'B-CD 5678',
      },
    ])

    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText('Unsere Featured Fahrzeuge')).toBeInTheDocument()
      expect(screen.getByText('BMW 320d')).toBeInTheDocument()
      expect(screen.getByText('Audi A4')).toBeInTheDocument()
    })
  })

  it('navigates to vehicle list when search is valid', async () => {
    const { container } = render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>
    )

    fireEvent.change(screen.getByPlaceholderText('Stadt, Flughafen oder Adresse'), {
      target: { value: 'Berlin' },
    })
    const today = new Date()
    const start = today.toISOString().split('T')[0]
    const end = new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    const dateInputs = Array.from(container.querySelectorAll('input[type="date"]')) as HTMLInputElement[]
    fireEvent.change(dateInputs[0], { target: { value: start } })
    fireEvent.change(dateInputs[1], { target: { value: end } })

    fireEvent.click(screen.getByText('Suchen'))
    expect(mockNavigate).toHaveBeenCalled()
  })

  it('shows alert when search fields are incomplete', () => {
    window.alert = jest.fn()
    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>
    )

    fireEvent.click(screen.getByText('Suchen'))
    expect(window.alert).toHaveBeenCalledWith('Bitte füllen Sie alle Suchfelder aus')
  })

  it('shows alert when dropoff date is before pickup date', () => {
    window.alert = jest.fn()
    const { container } = render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>
    )

    fireEvent.change(screen.getByPlaceholderText('Stadt, Flughafen oder Adresse'), {
      target: { value: 'Berlin' },
    })
    const today = new Date()
    const start = new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    const end = today.toISOString().split('T')[0]
    const dateInputs = Array.from(container.querySelectorAll('input[type="date"]')) as HTMLInputElement[]
    fireEvent.change(dateInputs[0], { target: { value: start } })
    fireEvent.change(dateInputs[1], { target: { value: end } })

    fireEvent.click(screen.getByText('Suchen'))
    expect(window.alert).toHaveBeenCalledWith('Das Rückgabedatum muss nach dem Abholdatum liegen')
  })

  it('handles error when loading vehicles fails', async () => {
    const { api } = jest.requireMock('@/services/api')
    api.getAllVehicles.mockRejectedValueOnce({ code: 'ECONNREFUSED' })

    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.queryByText('Fahrzeuge werden geladen...')).not.toBeInTheDocument()
    }, { timeout: 5000 })
  })

  it('filters vehicles to show only available ones', async () => {
    const { api } = jest.requireMock('@/services/api')
    api.getAllVehicles.mockResolvedValueOnce([
      {
        id: 1,
        brand: 'BMW',
        model: '320d',
        type: 'MITTELKLASSE',
        dailyPrice: 60,
        status: 'VERFÜGBAR',
        licensePlate: 'B-AB 1234',
      },
      {
        id: 2,
        brand: 'Audi',
        model: 'A4',
        type: 'OBERKLASSE',
        dailyPrice: 90,
        status: 'VERMIETET',
        licensePlate: 'B-CD 5678',
      },
    ])

    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText('BMW 320d')).toBeInTheDocument()
      expect(screen.queryByText('Audi A4')).not.toBeInTheDocument()
    })
  })

  it('allows selecting vehicle type in search', () => {
    const { container } = render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>
    )

    const vehicleTypeSelect = container.querySelector('select') as HTMLSelectElement
    if (vehicleTypeSelect) {
      fireEvent.change(vehicleTypeSelect, { target: { value: 'MITTELKLASSE' } })
      expect(vehicleTypeSelect.value).toBe('MITTELKLASSE')
    }
  })

  it('handles search with vehicle type', () => {
    const { container } = render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>
    )

    fireEvent.change(screen.getByPlaceholderText('Stadt, Flughafen oder Adresse'), {
      target: { value: 'Berlin' },
    })
    const today = new Date()
    const start = today.toISOString().split('T')[0]
    const end = new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    const dateInputs = Array.from(container.querySelectorAll('input[type="date"]')) as HTMLInputElement[]
    fireEvent.change(dateInputs[0], { target: { value: start } })
    fireEvent.change(dateInputs[1], { target: { value: end } })

    const vehicleTypeSelect = container.querySelector('select') as HTMLSelectElement
    if (vehicleTypeSelect) {
      fireEvent.change(vehicleTypeSelect, { target: { value: 'MITTELKLASSE' } })
    }

    fireEvent.click(screen.getByText('Suchen'))
    expect(mockNavigate).toHaveBeenCalled()
  })
})

    const dateInputs = Array.from(container.querySelectorAll('input[type="date"]')) as HTMLInputElement[]
    fireEvent.change(dateInputs[0], { target: { value: start } })
    fireEvent.change(dateInputs[1], { target: { value: end } })

    fireEvent.click(screen.getByText('Suchen'))
    expect(mockNavigate).toHaveBeenCalled()
  })

  it('shows alert when search fields are incomplete', () => {
    window.alert = jest.fn()
    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>
    )

    fireEvent.click(screen.getByText('Suchen'))
    expect(window.alert).toHaveBeenCalledWith('Bitte füllen Sie alle Suchfelder aus')
  })

  it('shows alert when dropoff date is before pickup date', () => {
    window.alert = jest.fn()
    const { container } = render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>
    )

    fireEvent.change(screen.getByPlaceholderText('Stadt, Flughafen oder Adresse'), {
      target: { value: 'Berlin' },
    })
    const today = new Date()
    const start = new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    const end = today.toISOString().split('T')[0]
    const dateInputs = Array.from(container.querySelectorAll('input[type="date"]')) as HTMLInputElement[]
    fireEvent.change(dateInputs[0], { target: { value: start } })
    fireEvent.change(dateInputs[1], { target: { value: end } })

    fireEvent.click(screen.getByText('Suchen'))
    expect(window.alert).toHaveBeenCalledWith('Das Rückgabedatum muss nach dem Abholdatum liegen')
  })

  it('handles error when loading vehicles fails', async () => {
    const { api } = jest.requireMock('@/services/api')
    api.getAllVehicles.mockRejectedValueOnce({ code: 'ECONNREFUSED' })

    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.queryByText('Fahrzeuge werden geladen...')).not.toBeInTheDocument()
    }, { timeout: 5000 })
  })

  it('filters vehicles to show only available ones', async () => {
    const { api } = jest.requireMock('@/services/api')
    api.getAllVehicles.mockResolvedValueOnce([
      {
        id: 1,
        brand: 'BMW',
        model: '320d',
        type: 'MITTELKLASSE',
        dailyPrice: 60,
        status: 'VERFÜGBAR',
        licensePlate: 'B-AB 1234',
      },
      {
        id: 2,
        brand: 'Audi',
        model: 'A4',
        type: 'OBERKLASSE',
        dailyPrice: 90,
        status: 'VERMIETET',
        licensePlate: 'B-CD 5678',
      },
    ])

    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText('BMW 320d')).toBeInTheDocument()
      expect(screen.queryByText('Audi A4')).not.toBeInTheDocument()
    })
  })

  it('allows selecting vehicle type in search', () => {
    const { container } = render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>
    )

    const vehicleTypeSelect = container.querySelector('select') as HTMLSelectElement
    if (vehicleTypeSelect) {
      fireEvent.change(vehicleTypeSelect, { target: { value: 'MITTELKLASSE' } })
      expect(vehicleTypeSelect.value).toBe('MITTELKLASSE')
    }
  })

  it('handles search with vehicle type', () => {
    const { container } = render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>
    )

    fireEvent.change(screen.getByPlaceholderText('Stadt, Flughafen oder Adresse'), {
      target: { value: 'Berlin' },
    })
    const today = new Date()
    const start = today.toISOString().split('T')[0]
    const end = new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    const dateInputs = Array.from(container.querySelectorAll('input[type="date"]')) as HTMLInputElement[]
    fireEvent.change(dateInputs[0], { target: { value: start } })
    fireEvent.change(dateInputs[1], { target: { value: end } })

    const vehicleTypeSelect = container.querySelector('select') as HTMLSelectElement
    if (vehicleTypeSelect) {
      fireEvent.change(vehicleTypeSelect, { target: { value: 'MITTELKLASSE' } })
    }

    fireEvent.click(screen.getByText('Suchen'))
    expect(mockNavigate).toHaveBeenCalled()
  })
})

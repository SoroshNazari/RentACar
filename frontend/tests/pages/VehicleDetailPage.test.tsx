import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import VehicleDetailPage from '@/pages/VehicleDetailPage'

// Mock hooks
const mockNavigate = jest.fn()

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({ id: '1' }),
  useNavigate: () => mockNavigate,
  useSearchParams: () => [new URLSearchParams(), jest.fn()],
}))

const mockGetVehicleById = jest.fn()

jest.mock('@/services/api', () => ({
  api: {
    getVehicleById: (...args: unknown[]) => mockGetVehicleById(...args),
  },
}))

// Mock window.alert
window.alert = jest.fn()

const mockVehicle = {
  id: 1,
  brand: 'BMW',
  model: '320d',
  type: 'MITTELKLASSE' as const,
  dailyPrice: 60,
  location: 'Berlin',
  mileage: 50000,
  licensePlate: 'B-AB 1234',
  imageUrl: 'https://example.com/image.jpg',
  status: 'VERFÜGBAR' as const,
}

describe('VehicleDetailPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockNavigate.mockClear()
    mockGetVehicleById.mockClear()
    window.alert = jest.fn()
  })

  it('renders loading state initially', () => {
    mockGetVehicleById.mockImplementation(() => new Promise(() => {}))

    render(
      <MemoryRouter>
        <VehicleDetailPage />
      </MemoryRouter>
    )

    expect(screen.getByText('Fahrzeugdetails werden geladen...')).toBeInTheDocument()
  })

  it('shows not found when API returns 404', async () => {
    mockGetVehicleById.mockRejectedValue({ response: { status: 404 } })

    render(
      <MemoryRouter>
        <VehicleDetailPage />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText(/Fahrzeug nicht gefunden/i)).toBeInTheDocument()
    }, { timeout: 5000 })
  })

  it('shows access denied when API returns 403', async () => {
    mockGetVehicleById.mockRejectedValue({ response: { status: 403 } })

    render(
      <MemoryRouter>
        <VehicleDetailPage />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText(/Zugriff verweigert/i)).toBeInTheDocument()
    }, { timeout: 5000 })
  })

  it('shows error when backend is not running', async () => {
    mockGetVehicleById.mockRejectedValue({ code: 'ECONNREFUSED' })

    render(
      <MemoryRouter>
        <VehicleDetailPage />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText(/backend-server läuft nicht/i)).toBeInTheDocument()
    }, { timeout: 5000 })
  })

  it('allows user to select dates and calculate price', async () => {
    const user = userEvent.setup()
    mockGetVehicleById.mockResolvedValue(mockVehicle)

    render(
      <MemoryRouter>
        <VehicleDetailPage />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.queryByText('Fahrzeugdetails werden geladen...')).not.toBeInTheDocument()
    }, { timeout: 10000 })

    const pickupInput = screen.getByLabelText(/abholdatum/i) as HTMLInputElement
    const dropoffInput = screen.getByLabelText(/rückgabedatum/i) as HTMLInputElement

    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    const dayAfter = new Date(today)
    dayAfter.setDate(dayAfter.getDate() + 2)

    await user.type(pickupInput, tomorrow.toISOString().split('T')[0])
    await user.type(dropoffInput, dayAfter.toISOString().split('T')[0])

    await waitFor(() => {
      expect(pickupInput.value).toBe(tomorrow.toISOString().split('T')[0])
      expect(dropoffInput.value).toBe(dayAfter.toISOString().split('T')[0])
    }, { timeout: 5000 })
  })

  it('shows alert when dropoff date is before pickup date', async () => {
    const user = userEvent.setup()
    mockGetVehicleById.mockResolvedValue(mockVehicle)

    render(
      <MemoryRouter>
        <VehicleDetailPage />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.queryByText('Fahrzeugdetails werden geladen...')).not.toBeInTheDocument()
    }, { timeout: 10000 })

    const pickupInput = screen.getByLabelText(/abholdatum/i) as HTMLInputElement
    const dropoffInput = screen.getByLabelText(/rückgabedatum/i) as HTMLInputElement

    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 2)
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    await user.type(pickupInput, tomorrow.toISOString().split('T')[0])
    await user.type(dropoffInput, yesterday.toISOString().split('T')[0])

    const bookButton = screen.getByText('Jetzt buchen')
    await user.click(bookButton)

    expect(window.alert).toHaveBeenCalledWith('Rückgabedatum muss nach dem Abholdatum liegen')
  })

  it('navigates to booking page with correct parameters when dates are valid', async () => {
    const user = userEvent.setup()
    mockGetVehicleById.mockResolvedValue(mockVehicle)

    render(
      <MemoryRouter>
        <VehicleDetailPage />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.queryByText('Fahrzeugdetails werden geladen...')).not.toBeInTheDocument()
    }, { timeout: 10000 })

    const pickupInput = screen.getByLabelText(/abholdatum/i) as HTMLInputElement
    const dropoffInput = screen.getByLabelText(/rückgabedatum/i) as HTMLInputElement

    const today = new Date()
    const pickupDateStr = today.toISOString().split('T')[0]
    const dropoffDateObj = new Date(today)
    dropoffDateObj.setDate(dropoffDateObj.getDate() + 2)
    const dropoffDateStr = dropoffDateObj.toISOString().split('T')[0]

    await user.type(pickupInput, pickupDateStr)
    await user.type(dropoffInput, dropoffDateStr)

    const bookButton = screen.getByText('Jetzt buchen')
    await user.click(bookButton)

    expect(mockNavigate).toHaveBeenCalledWith(
      `/booking/1?pickupDate=${pickupDateStr}&dropoffDate=${dropoffDateStr}`
    )
  })

  it('shows alert when booking without dates', async () => {
    const user = userEvent.setup()
    mockGetVehicleById.mockResolvedValue(mockVehicle)

    render(
      <MemoryRouter>
        <VehicleDetailPage />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.queryByText('Fahrzeugdetails werden geladen...')).not.toBeInTheDocument()
    }, { timeout: 10000 })

    const bookButton = screen.getByText('Jetzt buchen')
    await user.click(bookButton)

    expect(window.alert).toHaveBeenCalledWith('Bitte wähle Abhol- und Rückgabedatum')
  })

  it('handles error with response data', async () => {
    mockGetVehicleById.mockRejectedValue({
      response: { status: 500, data: { message: 'Server error' } },
    })

    render(
      <MemoryRouter>
        <VehicleDetailPage />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText(/Fehler:/i)).toBeInTheDocument()
    }, { timeout: 10000 })
  })

  it('handles error without response', async () => {
    mockGetVehicleById.mockRejectedValue({
      message: 'Network error',
    })

    render(
      <MemoryRouter>
        <VehicleDetailPage />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText(/Fahrzeug konnte nicht geladen werden/i)).toBeInTheDocument()
    }, { timeout: 10000 })
  })

  it('handles missing vehicle ID', async () => {
    const { useParams } = jest.requireMock('react-router-dom')
    useParams.mockReturnValueOnce({ id: undefined })

    render(
      <MemoryRouter>
        <VehicleDetailPage />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText(/Ungültige Fahrzeug-ID/i)).toBeInTheDocument()
    }, { timeout: 10000 })
  })

  it('displays vehicle with image gallery', async () => {
    const vehicleWithGallery = {
      ...mockVehicle,
      imageGallery: ['https://example.com/image1.jpg', 'https://example.com/image2.jpg'],
    }
    mockGetVehicleById.mockResolvedValue(vehicleWithGallery)

    render(
      <MemoryRouter>
        <VehicleDetailPage />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.queryByText('Fahrzeugdetails werden geladen...')).not.toBeInTheDocument()
    }, { timeout: 10000 })

    expect(screen.getByText(/BMW.*320d/i)).toBeInTheDocument()
  })

})

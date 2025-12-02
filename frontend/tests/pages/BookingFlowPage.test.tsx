import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import BookingFlowPage from '@/pages/BookingFlowPage'

// Mock hooks
const mockNavigate = jest.fn()

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({ vehicleId: '1' }),
  useNavigate: () => mockNavigate,
  useSearchParams: () => [new URLSearchParams(), jest.fn()],
}))

const mockGetVehicleById = jest.fn()
const mockIsAuthenticated = jest.fn(() => false)
const mockGetCustomerMe = jest.fn()
const mockCreateBooking = jest.fn()

const mockGetCustomerByUsername = jest.fn()

jest.mock('@/services/api', () => ({
  api: {
    getVehicleById: (...args: unknown[]) => mockGetVehicleById(...args),
    isAuthenticated: (...args: unknown[]) => mockIsAuthenticated(...args),
    getCustomerMe: (...args: unknown[]) => mockGetCustomerMe(...args),
    getCustomerByUsername: (...args: unknown[]) => mockGetCustomerByUsername(...args),
    createBooking: (...args: unknown[]) => mockCreateBooking(...args),
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

describe('BookingFlowPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockNavigate.mockClear()
    mockGetVehicleById.mockClear()
    window.alert = jest.fn()
    mockIsAuthenticated.mockReturnValue(false)
  })

  it('renders loading state initially', () => {
    mockGetVehicleById.mockImplementation(() => new Promise(() => {}))

    render(
      <MemoryRouter>
        <BookingFlowPage />
      </MemoryRouter>
    )

    expect(screen.getByText('Lädt...')).toBeInTheDocument()
  })

  it('renders booking flow steps with German labels', async () => {
    mockGetVehicleById.mockResolvedValue(mockVehicle)

    render(
      <MemoryRouter>
        <BookingFlowPage />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText('Datum wählen')).toBeInTheDocument()
      expect(screen.getByText('Kundendaten')).toBeInTheDocument()
      expect(screen.getByText('Zahlung')).toBeInTheDocument()
    }, { timeout: 5000 })
  })

  it('shows date selection step with German labels', async () => {
    mockGetVehicleById.mockResolvedValue(mockVehicle)

    render(
      <MemoryRouter>
        <BookingFlowPage />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText('Wähle deine Mietdaten')).toBeInTheDocument()
      expect(screen.getByText('Abholinformationen')).toBeInTheDocument()
      expect(screen.getByText('Rückgabeinformationen')).toBeInTheDocument()
    }, { timeout: 5000 })
  })

  it('shows alert when continuing without dates', async () => {
    const user = userEvent.setup()
    mockGetVehicleById.mockResolvedValue(mockVehicle)

    render(
      <MemoryRouter>
        <BookingFlowPage />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText('Weiter zu Schritt 2 →')).toBeInTheDocument()
    }, { timeout: 5000 })

    const continueButton = screen.getByText('Weiter zu Schritt 2 →')
    await user.click(continueButton)

    expect(window.alert).toHaveBeenCalledWith('Bitte wähle Abhol- und Rückgabedatum')
  })

  it('allows user to fill in dates and continue to details step', async () => {
    const user = userEvent.setup()
    mockGetVehicleById.mockResolvedValue(mockVehicle)

    const { container } = render(
      <MemoryRouter>
        <BookingFlowPage />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText('Wähle deine Mietdaten')).toBeInTheDocument()
    }, { timeout: 5000 })

    const pickupDateInput = container.querySelector('#bookingPickupDate') as HTMLInputElement
    const dropoffDateInput = container.querySelector('#bookingDropoffDate') as HTMLInputElement

    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    const dayAfter = new Date(today)
    dayAfter.setDate(dayAfter.getDate() + 2)

    if (pickupDateInput) {
      await user.type(pickupDateInput, tomorrow.toISOString().split('T')[0])
    }
    if (dropoffDateInput) {
      await user.type(dropoffDateInput, dayAfter.toISOString().split('T')[0])
    }

    const continueButton = screen.getByText('Weiter zu Schritt 2 →')
    await user.click(continueButton)

    await waitFor(() => {
      expect(screen.getByText('Gib deine Daten ein')).toBeInTheDocument()
    }, { timeout: 5000 })
  })

  it('shows customer details form in step 2', async () => {
    const user = userEvent.setup()
    mockGetVehicleById.mockResolvedValue(mockVehicle)

    const { container } = render(
      <MemoryRouter>
        <BookingFlowPage />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText('Wähle deine Mietdaten')).toBeInTheDocument()
    }, { timeout: 5000 })

    const pickupDateInput = container.querySelector('#bookingPickupDate') as HTMLInputElement
    const dropoffDateInput = container.querySelector('#bookingDropoffDate') as HTMLInputElement

    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    const dayAfter = new Date(today)
    dayAfter.setDate(dayAfter.getDate() + 2)

    if (pickupDateInput) {
      await user.type(pickupDateInput, tomorrow.toISOString().split('T')[0])
    }
    if (dropoffDateInput) {
      await user.type(dropoffDateInput, dayAfter.toISOString().split('T')[0])
    }

    const continueButton = screen.getByText('Weiter zu Schritt 2 →')
    await user.click(continueButton)

    await waitFor(() => {
      expect(screen.getByText('Vollständiger Name')).toBeInTheDocument()
      expect(screen.getByText('E-Mail-Adresse')).toBeInTheDocument()
      expect(screen.getByText('Telefonnummer')).toBeInTheDocument()
      expect(screen.getByText('Führerscheinnummer')).toBeInTheDocument()
      expect(screen.getByText('Adresse')).toBeInTheDocument()
    }, { timeout: 5000 })
  })

  it('shows alert when continuing to payment without required fields', async () => {
    const user = userEvent.setup()
    mockGetVehicleById.mockResolvedValue(mockVehicle)

    const { container } = render(
      <MemoryRouter>
        <BookingFlowPage />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText('Wähle deine Mietdaten')).toBeInTheDocument()
    }, { timeout: 5000 })

    const pickupDateInput = container.querySelector('#bookingPickupDate') as HTMLInputElement
    const dropoffDateInput = container.querySelector('#bookingDropoffDate') as HTMLInputElement

    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    const dayAfter = new Date(today)
    dayAfter.setDate(dayAfter.getDate() + 2)

    if (pickupDateInput) {
      await user.type(pickupDateInput, tomorrow.toISOString().split('T')[0])
    }
    if (dropoffDateInput) {
      await user.type(dropoffDateInput, dayAfter.toISOString().split('T')[0])
    }

    const continueButton = screen.getByText('Weiter zu Schritt 2 →')
    await user.click(continueButton)

    await waitFor(() => {
      expect(screen.getByText('Gib deine Daten ein')).toBeInTheDocument()
    }, { timeout: 5000 })

    const paymentButton = screen.getByText('Weiter zur Zahlung →')
    await user.click(paymentButton)

    expect(window.alert).toHaveBeenCalledWith('Bitte fülle alle erforderlichen Felder aus')
  })

  it('allows user to fill customer details and continue to payment', async () => {
    const user = userEvent.setup()
    mockGetVehicleById.mockResolvedValue(mockVehicle)

    const { container } = render(
      <MemoryRouter>
        <BookingFlowPage />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText('Wähle deine Mietdaten')).toBeInTheDocument()
    }, { timeout: 5000 })

    const pickupDateInput = container.querySelector('#bookingPickupDate') as HTMLInputElement
    const dropoffDateInput = container.querySelector('#bookingDropoffDate') as HTMLInputElement

    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    const dayAfter = new Date(today)
    dayAfter.setDate(dayAfter.getDate() + 2)

    if (pickupDateInput) {
      await user.type(pickupDateInput, tomorrow.toISOString().split('T')[0])
    }
    if (dropoffDateInput) {
      await user.type(dropoffDateInput, dayAfter.toISOString().split('T')[0])
    }

    const continueButton = screen.getByText('Weiter zu Schritt 2 →')
    await user.click(continueButton)

    await waitFor(() => {
      expect(screen.getByText('Gib deine Daten ein')).toBeInTheDocument()
    }, { timeout: 5000 })

    const nameInput = screen.getByPlaceholderText('Max Mustermann')
    const emailInput = screen.getByPlaceholderText('max@example.com')
    const phoneInput = screen.getByPlaceholderText('+49 123 456789')
    const licenseInput = screen.getByPlaceholderText('B123456789')
    const addressInput = screen.getByPlaceholderText('Musterstraße 1, 12345 Berlin')

    await user.type(nameInput, 'Max Mustermann')
    await user.type(emailInput, 'max@example.com')
    await user.type(phoneInput, '0123456789')
    await user.type(licenseInput, 'B123456789')
    await user.type(addressInput, 'Musterstraße 1')

    const paymentButton = screen.getByText('Weiter zur Zahlung →')
    await user.click(paymentButton)

    await waitFor(() => {
      expect(screen.getByText('Zahlungsdetails')).toBeInTheDocument()
    }, { timeout: 5000 })
  })


  it('shows vehicle not found when API returns null', async () => {
    mockGetVehicleById.mockResolvedValue(null)

    render(
      <MemoryRouter>
        <BookingFlowPage />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText(/fahrzeug nicht gefunden/i)).toBeInTheDocument()
    }, { timeout: 5000 })
  })

  it('allows navigation back from details to dates step', async () => {
    const user = userEvent.setup()
    mockGetVehicleById.mockResolvedValue(mockVehicle)

    const { container } = render(
      <MemoryRouter>
        <BookingFlowPage />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText('Wähle deine Mietdaten')).toBeInTheDocument()
    }, { timeout: 5000 })

    const pickupDateInput = container.querySelector('#bookingPickupDate') as HTMLInputElement
    const dropoffDateInput = container.querySelector('#bookingDropoffDate') as HTMLInputElement

    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    const dayAfter = new Date(today)
    dayAfter.setDate(dayAfter.getDate() + 2)

    if (pickupDateInput) {
      await user.type(pickupDateInput, tomorrow.toISOString().split('T')[0])
    }
    if (dropoffDateInput) {
      await user.type(dropoffDateInput, dayAfter.toISOString().split('T')[0])
    }

    const continueButton = screen.getByText('Weiter zu Schritt 2 →')
    await user.click(continueButton)

    await waitFor(() => {
      expect(screen.getByText('Gib deine Daten ein')).toBeInTheDocument()
    }, { timeout: 5000 })

    const backButton = screen.getByText('← Zurück')
    await user.click(backButton)

    await waitFor(() => {
      expect(screen.getByText('Wähle deine Mietdaten')).toBeInTheDocument()
    }, { timeout: 5000 })
  })

  it('handles error when loading vehicle fails', async () => {
    mockGetVehicleById.mockRejectedValue(new Error('Failed to load'))

    render(
      <MemoryRouter>
        <BookingFlowPage />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.queryByText('Lädt...')).not.toBeInTheDocument()
    }, { timeout: 5000 })
  })

  it('loads customer data when authenticated', async () => {
    mockGetVehicleById.mockResolvedValue(mockVehicle)
    mockIsAuthenticated.mockReturnValue(true)
    mockGetCustomerMe.mockResolvedValue({
      id: 1,
      firstName: 'Max',
      lastName: 'Mustermann',
      email: 'max@example.com',
      phone: '0123456789',
      driverLicenseNumber: 'B123456789',
      address: 'Musterstraße 1',
    })

    render(
      <MemoryRouter>
        <BookingFlowPage />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(mockGetCustomerMe).toHaveBeenCalled()
    }, { timeout: 5000 })
  })

  it('loads customer by username when getCustomerMe fails', async () => {
    mockGetVehicleById.mockResolvedValue(mockVehicle)
    mockIsAuthenticated.mockReturnValue(true)
    mockGetCustomerMe.mockRejectedValue(new Error('Failed'))
    mockGetCustomerByUsername.mockResolvedValue({
      id: 1,
      firstName: 'Max',
      lastName: 'Mustermann',
      email: 'max@example.com',
      phone: '0123456789',
      driverLicenseNumber: 'B123456789',
      address: 'Musterstraße 1',
    })
    localStorage.setItem('username', 'testuser')

    render(
      <MemoryRouter>
        <BookingFlowPage />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(mockGetCustomerByUsername).toHaveBeenCalledWith('testuser')
    }, { timeout: 5000 })
  })

  it('allows switching payment method to PayPal', async () => {
    const user = userEvent.setup()
    mockGetVehicleById.mockResolvedValue(mockVehicle)

    const { container } = render(
      <MemoryRouter>
        <BookingFlowPage />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText('Wähle deine Mietdaten')).toBeInTheDocument()
    }, { timeout: 5000 })

    const pickupDateInput = container.querySelector('#bookingPickupDate') as HTMLInputElement
    const dropoffDateInput = container.querySelector('#bookingDropoffDate') as HTMLInputElement

    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    const dayAfter = new Date(today)
    dayAfter.setDate(dayAfter.getDate() + 2)

    if (pickupDateInput) {
      await user.type(pickupDateInput, tomorrow.toISOString().split('T')[0])
    }
    if (dropoffDateInput) {
      await user.type(dropoffDateInput, dayAfter.toISOString().split('T')[0])
    }

    const continueButton = screen.getByText('Weiter zu Schritt 2 →')
    await user.click(continueButton)

    await waitFor(() => {
      expect(screen.getByText('Gib deine Daten ein')).toBeInTheDocument()
    }, { timeout: 5000 })

    const nameInput = screen.getByPlaceholderText('Max Mustermann')
    const emailInput = screen.getByPlaceholderText('max@example.com')
    const phoneInput = screen.getByPlaceholderText('+49 123 456789')
    const licenseInput = screen.getByPlaceholderText('B123456789')
    const addressInput = screen.getByPlaceholderText('Musterstraße 1, 12345 Berlin')

    await user.type(nameInput, 'Max Mustermann')
    await user.type(emailInput, 'max@example.com')
    await user.type(phoneInput, '0123456789')
    await user.type(licenseInput, 'B123456789')
    await user.type(addressInput, 'Musterstraße 1')

    const paymentButton = screen.getByText('Weiter zur Zahlung →')
    await user.click(paymentButton)

    await waitFor(() => {
      expect(screen.getByText('Zahlungsdetails')).toBeInTheDocument()
    }, { timeout: 5000 })

    const paypalButton = screen.getByText('PayPal')
    await user.click(paypalButton)

    await waitFor(() => {
      expect(screen.queryByText('Kartennummer')).not.toBeInTheDocument()
    }, { timeout: 5000 })
  })

  it('allows toggling extras', async () => {
    const user = userEvent.setup()
    mockGetVehicleById.mockResolvedValue(mockVehicle)

    const { container } = render(
      <MemoryRouter>
        <BookingFlowPage />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText('Wähle deine Mietdaten')).toBeInTheDocument()
    }, { timeout: 5000 })

    const pickupDateInput = container.querySelector('#bookingPickupDate') as HTMLInputElement
    const dropoffDateInput = container.querySelector('#bookingDropoffDate') as HTMLInputElement

    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    const dayAfter = new Date(today)
    dayAfter.setDate(dayAfter.getDate() + 2)

    if (pickupDateInput) {
      await user.type(pickupDateInput, tomorrow.toISOString().split('T')[0])
    }
    if (dropoffDateInput) {
      await user.type(dropoffDateInput, dayAfter.toISOString().split('T')[0])
    }

    const continueButton = screen.getByText('Weiter zu Schritt 2 →')
    await user.click(continueButton)

    await waitFor(() => {
      expect(screen.getByText('Gib deine Daten ein')).toBeInTheDocument()
    }, { timeout: 5000 })

    const nameInput = screen.getByPlaceholderText('Max Mustermann')
    const emailInput = screen.getByPlaceholderText('max@example.com')
    const phoneInput = screen.getByPlaceholderText('+49 123 456789')
    const licenseInput = screen.getByPlaceholderText('B123456789')
    const addressInput = screen.getByPlaceholderText('Musterstraße 1, 12345 Berlin')

    await user.type(nameInput, 'Max Mustermann')
    await user.type(emailInput, 'max@example.com')
    await user.type(phoneInput, '0123456789')
    await user.type(licenseInput, 'B123456789')
    await user.type(addressInput, 'Musterstraße 1')

    const paymentButton = screen.getByText('Weiter zur Zahlung →')
    await user.click(paymentButton)

    await waitFor(() => {
      expect(screen.getByText('Zahlungsdetails')).toBeInTheDocument()
    }, { timeout: 5000 })

    const insuranceCheckbox = screen.getByText('Versicherung (+10€/Tag)').parentElement?.querySelector('input[type="checkbox"]') as HTMLInputElement
    if (insuranceCheckbox) {
      await user.click(insuranceCheckbox)
      expect(insuranceCheckbox.checked).toBe(true)
    }
  })

  it('shows alert when confirming booking without authentication', async () => {
    const user = userEvent.setup()
    mockGetVehicleById.mockResolvedValue(mockVehicle)
    mockIsAuthenticated.mockReturnValue(false)

    const { container } = render(
      <MemoryRouter>
        <BookingFlowPage />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText('Wähle deine Mietdaten')).toBeInTheDocument()
    }, { timeout: 5000 })

    const pickupDateInput = container.querySelector('#bookingPickupDate') as HTMLInputElement
    const dropoffDateInput = container.querySelector('#bookingDropoffDate') as HTMLInputElement

    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    const dayAfter = new Date(today)
    dayAfter.setDate(dayAfter.getDate() + 2)

    if (pickupDateInput) {
      await user.type(pickupDateInput, tomorrow.toISOString().split('T')[0])
    }
    if (dropoffDateInput) {
      await user.type(dropoffDateInput, dayAfter.toISOString().split('T')[0])
    }

    const continueButton = screen.getByText('Weiter zu Schritt 2 →')
    await user.click(continueButton)

    await waitFor(() => {
      expect(screen.getByText('Gib deine Daten ein')).toBeInTheDocument()
    }, { timeout: 5000 })

    const nameInput = screen.getByPlaceholderText('Max Mustermann')
    const emailInput = screen.getByPlaceholderText('max@example.com')
    const phoneInput = screen.getByPlaceholderText('+49 123 456789')
    const licenseInput = screen.getByPlaceholderText('B123456789')
    const addressInput = screen.getByPlaceholderText('Musterstraße 1, 12345 Berlin')

    await user.type(nameInput, 'Max Mustermann')
    await user.type(emailInput, 'max@example.com')
    await user.type(phoneInput, '0123456789')
    await user.type(licenseInput, 'B123456789')
    await user.type(addressInput, 'Musterstraße 1')

    const paymentButton = screen.getByText('Weiter zur Zahlung →')
    await user.click(paymentButton)

    await waitFor(() => {
      expect(screen.getByText('Zahlungsdetails')).toBeInTheDocument()
    }, { timeout: 5000 })

    const confirmButton = screen.getByText('Bestätigen & Bezahlen')
    await user.click(confirmButton)

    expect(window.alert).toHaveBeenCalledWith('Bitte melde dich an, um die Buchung abzuschließen')
    expect(mockNavigate).toHaveBeenCalledWith('/login')
  })

  it('handles booking creation error', async () => {
    const user = userEvent.setup()
    mockGetVehicleById.mockResolvedValue(mockVehicle)
    mockIsAuthenticated.mockReturnValue(true)
    mockGetCustomerMe.mockResolvedValue({
      id: 1,
      firstName: 'Max',
      lastName: 'Mustermann',
      email: 'max@example.com',
      phone: '0123456789',
      driverLicenseNumber: 'B123456789',
      address: 'Musterstraße 1',
    })
    mockCreateBooking.mockRejectedValue(new Error('Booking failed'))

    const { container } = render(
      <MemoryRouter>
        <BookingFlowPage />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText('Wähle deine Mietdaten')).toBeInTheDocument()
    }, { timeout: 5000 })

    const pickupDateInput = container.querySelector('#bookingPickupDate') as HTMLInputElement
    const dropoffDateInput = container.querySelector('#bookingDropoffDate') as HTMLInputElement

    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    const dayAfter = new Date(today)
    dayAfter.setDate(dayAfter.getDate() + 2)

    if (pickupDateInput) {
      await user.type(pickupDateInput, tomorrow.toISOString().split('T')[0])
    }
    if (dropoffDateInput) {
      await user.type(dropoffDateInput, dayAfter.toISOString().split('T')[0])
    }

    const continueButton = screen.getByText('Weiter zu Schritt 2 →')
    await user.click(continueButton)

    await waitFor(() => {
      expect(screen.getByText('Gib deine Daten ein')).toBeInTheDocument()
    }, { timeout: 5000 })

    const nameInput = screen.getByPlaceholderText('Max Mustermann')
    const emailInput = screen.getByPlaceholderText('max@example.com')
    const phoneInput = screen.getByPlaceholderText('+49 123 456789')
    const licenseInput = screen.getByPlaceholderText('B123456789')
    const addressInput = screen.getByPlaceholderText('Musterstraße 1, 12345 Berlin')

    await user.type(nameInput, 'Max Mustermann')
    await user.type(emailInput, 'max@example.com')
    await user.type(phoneInput, '0123456789')
    await user.type(licenseInput, 'B123456789')
    await user.type(addressInput, 'Musterstraße 1')

    const paymentButton = screen.getByText('Weiter zur Zahlung →')
    await user.click(paymentButton)

    await waitFor(() => {
      expect(screen.getByText('Zahlungsdetails')).toBeInTheDocument()
    }, { timeout: 5000 })

    const confirmButton = screen.getByText('Bestätigen & Bezahlen')
    await user.click(confirmButton)

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith('Buchung fehlgeschlagen. Bitte versuche es erneut.')
    }, { timeout: 5000 })
  })
})

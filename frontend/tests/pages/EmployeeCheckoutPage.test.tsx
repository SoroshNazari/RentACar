import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import EmployeeCheckoutPage from '@/pages/EmployeeCheckoutPage'
import type { Booking } from '@/types/booking'

const mockBooking: Booking = {
  id: 1,
  customerId: 1,
  vehicleId: 1,
  vehicle: {
    id: 1,
    brand: 'BMW',
    model: '320d',
    type: 'MITTELKLASSE',
    dailyPrice: 60,
    location: 'Berlin',
    mileage: 50000,
    licensePlate: 'B-AB 1234',
    imageUrl: 'https://example.com/image.jpg',
    status: 'VERFÜGBAR',
  },
  pickupDate: '2024-01-01',
  dropoffDate: '2024-01-05',
  pickupLocation: 'Berlin',
  returnLocation: 'Berlin',
  status: 'BESTÄTIGT',
  totalPrice: 300,
  checkoutTime: null,
  returnTime: null,
}

const mockRequest: Booking = {
  ...mockBooking,
  id: 2,
  status: 'ANFRAGE',
}

jest.mock('@/services/api', () => ({
  api: {
    getUserRole: jest.fn().mockReturnValue('ROLE_EMPLOYEE'),
    getPickups: jest.fn().mockResolvedValue([]),
    getPickupRequests: jest.fn().mockResolvedValue([]),
    getVehicleById: jest.fn().mockResolvedValue({ mileage: 50000 }),
    checkoutBooking: jest.fn().mockResolvedValue(undefined),
    confirmBooking: jest.fn().mockResolvedValue(undefined),
  },
}))

// Mock window.alert
window.alert = jest.fn()

describe('EmployeeCheckoutPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    window.alert = jest.fn()
  })

  it('renders page with German title', () => {
    render(
      <MemoryRouter>
        <EmployeeCheckoutPage />
      </MemoryRouter>
    )

    expect(screen.getByText('Fahrzeugausgabe')).toBeInTheDocument()
  })

  it('displays date selector with German label', () => {
    render(
      <MemoryRouter>
        <EmployeeCheckoutPage />
      </MemoryRouter>
    )

    expect(screen.getByText('Abholdatum')).toBeInTheDocument()
  })

  it('shows empty state when no pickups available', async () => {
    render(
      <MemoryRouter>
        <EmployeeCheckoutPage />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(
        screen.queryByText(/keine bestätigten abholungen/i) ||
          screen.queryByText(/keine/i)
      ).toBeInTheDocument()
    }, { timeout: 5000 })
  })

  it('shows loading state initially', () => {
    const { api } = jest.requireMock('@/services/api')
    api.getPickups.mockImplementation(() => new Promise(() => {}))

    render(
      <MemoryRouter>
        <EmployeeCheckoutPage />
      </MemoryRouter>
    )

    expect(screen.getByText(/daten werden geladen/i)).toBeInTheDocument()
  })

  it('handles non-employee role', async () => {
    const { api } = jest.requireMock('@/services/api')
    api.getUserRole.mockReturnValueOnce('ROLE_CUSTOMER')

    render(
      <MemoryRouter>
        <EmployeeCheckoutPage />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.queryByText(/daten werden geladen/i)).not.toBeInTheDocument()
    }, { timeout: 5000 })
  })

  it('handles error when loading pickups fails', async () => {
    const { api } = jest.requireMock('@/services/api')
    api.getPickups.mockRejectedValueOnce(new Error('Failed to load'))

    render(
      <MemoryRouter>
        <EmployeeCheckoutPage />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.queryByText(/daten werden geladen/i)).not.toBeInTheDocument()
    }, { timeout: 5000 })
  })

  it('displays confirmed pickups when available', async () => {
    const { api } = jest.requireMock('@/services/api')
    api.getPickups.mockResolvedValueOnce([mockBooking])

    render(
      <MemoryRouter>
        <EmployeeCheckoutPage />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText(/bestätigte abholungen/i)).toBeInTheDocument()
      expect(screen.getByText(/BMW.*320d/i)).toBeInTheDocument()
    }, { timeout: 5000 })
  })

  it('displays pickup requests when available', async () => {
    const { api } = jest.requireMock('@/services/api')
    api.getPickups.mockResolvedValueOnce([])
    api.getPickupRequests.mockResolvedValueOnce([mockRequest])

    render(
      <MemoryRouter>
        <EmployeeCheckoutPage />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText(/offene anfragen/i)).toBeInTheDocument()
      expect(screen.getByText(/BMW.*320d/i)).toBeInTheDocument()
    }, { timeout: 5000 })
  })

  it('enriches bookings with mileage when missing', async () => {
    const { api } = jest.requireMock('@/services/api')
    const bookingWithoutMileage = {
      ...mockBooking,
      vehicle: { ...mockBooking.vehicle, mileage: undefined },
    }
    api.getPickups.mockResolvedValueOnce([bookingWithoutMileage])
    api.getPickupRequests.mockResolvedValueOnce([])
    api.getVehicleById.mockResolvedValueOnce({ mileage: 50000 })

    render(
      <MemoryRouter>
        <EmployeeCheckoutPage />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(api.getVehicleById).toHaveBeenCalledWith(1)
    }, { timeout: 5000 })
  })

  it('allows user to input notes', async () => {
    const user = userEvent.setup()
    const { api } = jest.requireMock('@/services/api')
    api.getPickups.mockResolvedValueOnce([mockBooking])
    api.getPickupRequests.mockResolvedValueOnce([])

    render(
      <MemoryRouter>
        <EmployeeCheckoutPage />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText(/BMW.*320d/i)).toBeInTheDocument()
    }, { timeout: 5000 })

    const notesTextarea = screen.getByPlaceholderText(/kratzer/i) as HTMLTextAreaElement
    await user.type(notesTextarea, 'Fahrzeug in gutem Zustand')

    expect(notesTextarea.value).toBe('Fahrzeug in gutem Zustand')
  })

  it('performs checkout successfully', async () => {
    const user = userEvent.setup()
    const { api } = jest.requireMock('@/services/api')
    api.getPickups.mockResolvedValueOnce([mockBooking])
    api.getPickupRequests.mockResolvedValueOnce([])
    api.checkoutBooking.mockResolvedValueOnce(undefined)
    api.getPickups.mockResolvedValueOnce([]) // After checkout, pickups empty

    render(
      <MemoryRouter>
        <EmployeeCheckoutPage />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText(/BMW.*320d/i)).toBeInTheDocument()
    }, { timeout: 5000 })

    const checkoutButton = screen.getByText(/check-out durchführen/i)
    await user.click(checkoutButton)

    await waitFor(() => {
      expect(api.checkoutBooking).toHaveBeenCalledWith(1, 50000, '')
    }, { timeout: 5000 })
  })

  it('shows alert when mileage is invalid', async () => {
    const user = userEvent.setup()
    const { api } = jest.requireMock('@/services/api')
    const bookingWithoutMileage = {
      ...mockBooking,
      vehicle: { ...mockBooking.vehicle, mileage: undefined },
    }
    api.getPickups.mockResolvedValueOnce([bookingWithoutMileage])
    api.getPickupRequests.mockResolvedValueOnce([])
    api.getVehicleById.mockResolvedValueOnce({ mileage: undefined })

    render(
      <MemoryRouter>
        <EmployeeCheckoutPage />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText(/BMW.*320d/i)).toBeInTheDocument()
    }, { timeout: 5000 })

    const checkoutButton = screen.getByText(/check-out durchführen/i)
    await user.click(checkoutButton)

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith('Kilometerstand nicht verfügbar')
    }, { timeout: 5000 })
  })

  it('handles checkout error with 409 status', async () => {
    const user = userEvent.setup()
    const { api } = jest.requireMock('@/services/api')
    api.getPickups.mockResolvedValueOnce([mockBooking])
    api.getPickupRequests.mockResolvedValueOnce([])
    api.checkoutBooking.mockRejectedValueOnce({
      response: { status: 409, data: { message: 'Already checked out' } },
    })

    render(
      <MemoryRouter>
        <EmployeeCheckoutPage />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText(/BMW.*320d/i)).toBeInTheDocument()
    }, { timeout: 5000 })

    const checkoutButton = screen.getByText(/check-out durchführen/i)
    await user.click(checkoutButton)

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith('Check-out fehlgeschlagen: Buchung wurde bereits ausgecheckt')
    }, { timeout: 5000 })
  })

  it('handles checkout error with 400 status', async () => {
    const user = userEvent.setup()
    const { api } = jest.requireMock('@/services/api')
    api.getPickups.mockResolvedValueOnce([mockBooking])
    api.getPickupRequests.mockResolvedValueOnce([])
    api.checkoutBooking.mockRejectedValueOnce({
      response: { status: 400, data: { message: 'Invalid input' } },
    })

    render(
      <MemoryRouter>
        <EmployeeCheckoutPage />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText(/BMW.*320d/i)).toBeInTheDocument()
    }, { timeout: 5000 })

    const checkoutButton = screen.getByText(/check-out durchführen/i)
    await user.click(checkoutButton)

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith('Check-out fehlgeschlagen: Ungültige Eingabe - bitte überprüfe deine Daten')
    }, { timeout: 5000 })
  })

  it('handles checkout error with generic error', async () => {
    const user = userEvent.setup()
    const { api } = jest.requireMock('@/services/api')
    api.getPickups.mockResolvedValueOnce([mockBooking])
    api.getPickupRequests.mockResolvedValueOnce([])
    api.checkoutBooking.mockRejectedValueOnce({
      response: { status: 500, data: { error: 'Server error' } },
      message: 'Network error',
    })

    render(
      <MemoryRouter>
        <EmployeeCheckoutPage />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText(/BMW.*320d/i)).toBeInTheDocument()
    }, { timeout: 5000 })

    const checkoutButton = screen.getByText(/check-out durchführen/i)
    await user.click(checkoutButton)

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith(expect.stringContaining('Check-out fehlgeschlagen'))
    }, { timeout: 5000 })
  })

  it('disables checkout button when booking is not confirmed', async () => {
    const { api } = jest.requireMock('@/services/api')
    const unconfirmedBooking = {
      ...mockBooking,
      status: 'ANFRAGE' as const,
    }
    api.getPickups.mockResolvedValueOnce([unconfirmedBooking])
    api.getPickupRequests.mockResolvedValueOnce([])

    render(
      <MemoryRouter>
        <EmployeeCheckoutPage />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText(/BMW.*320d/i)).toBeInTheDocument()
    }, { timeout: 5000 })

    const checkoutButton = screen.getByText(/check-out durchführen/i) as HTMLButtonElement
    expect(checkoutButton.disabled).toBe(true)
  })

  it('disables checkout button when already checked out', async () => {
    const { api } = jest.requireMock('@/services/api')
    const checkedOutBooking = {
      ...mockBooking,
      checkoutTime: '2024-01-01T10:00:00Z',
    }
    api.getPickups.mockResolvedValueOnce([checkedOutBooking])
    api.getPickupRequests.mockResolvedValueOnce([])

    render(
      <MemoryRouter>
        <EmployeeCheckoutPage />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText(/BMW.*320d/i)).toBeInTheDocument()
    }, { timeout: 5000 })

    const checkoutButton = screen.getByText(/check-out durchführen/i) as HTMLButtonElement
    expect(checkoutButton.disabled).toBe(true)
  })

  it('confirms booking request', async () => {
    const user = userEvent.setup()
    const { api } = jest.requireMock('@/services/api')
    api.getPickups.mockResolvedValueOnce([])
    api.getPickupRequests.mockResolvedValueOnce([mockRequest])
    api.confirmBooking.mockResolvedValueOnce(undefined)
    api.getPickups.mockResolvedValueOnce([]) // After confirmation
    api.getPickupRequests.mockResolvedValueOnce([])

    render(
      <MemoryRouter>
        <EmployeeCheckoutPage />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText(/offene anfragen/i)).toBeInTheDocument()
    }, { timeout: 5000 })

    const confirmButton = screen.getByText(/anfrage bestätigen/i)
    await user.click(confirmButton)

    await waitFor(() => {
      expect(api.confirmBooking).toHaveBeenCalledWith(2)
    }, { timeout: 5000 })
  })

  it('handles confirm booking error', async () => {
    const user = userEvent.setup()
    const { api } = jest.requireMock('@/services/api')
    api.getPickups.mockResolvedValueOnce([])
    api.getPickupRequests.mockResolvedValueOnce([mockRequest])
    api.confirmBooking.mockRejectedValueOnce(new Error('Confirmation failed'))

    render(
      <MemoryRouter>
        <EmployeeCheckoutPage />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText(/offene anfragen/i)).toBeInTheDocument()
    }, { timeout: 5000 })

    const confirmButton = screen.getByText(/anfrage bestätigen/i)
    await user.click(confirmButton)

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith('Bestätigung fehlgeschlagen')
    }, { timeout: 5000 })
  })

  it('handles date change', async () => {
    const user = userEvent.setup()
    const { api } = jest.requireMock('@/services/api')
    api.getPickups.mockResolvedValue([])
    api.getPickupRequests.mockResolvedValue([])

    render(
      <MemoryRouter>
        <EmployeeCheckoutPage />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.queryByText(/daten werden geladen/i)).not.toBeInTheDocument()
    }, { timeout: 10000 })

    const dateInput = screen.getByLabelText(/abholdatum/i) as HTMLInputElement
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    const tomorrowStr = tomorrow.toISOString().split('T')[0]
    
    await user.clear(dateInput)
    await user.type(dateInput, tomorrowStr)

    await waitFor(() => {
      expect(api.getPickups).toHaveBeenCalledTimes(2) // Initial load + date change
      expect(api.getPickupRequests).toHaveBeenCalledTimes(2)
    }, { timeout: 10000 })
  })

  it('handles ADMIN role', async () => {
    const { api } = jest.requireMock('@/services/api')
    api.getUserRole.mockReturnValueOnce('ROLE_ADMIN')
    api.getPickups.mockResolvedValueOnce([])
    api.getPickupRequests.mockResolvedValueOnce([])

    render(
      <MemoryRouter>
        <EmployeeCheckoutPage />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(api.getPickups).toHaveBeenCalled()
      expect(api.getPickupRequests).toHaveBeenCalled()
    }, { timeout: 5000 })
  })

})

  it('displays pickup requests when available', async () => {
    const { api } = jest.requireMock('@/services/api')
    api.getPickups.mockResolvedValueOnce([])
    api.getPickupRequests.mockResolvedValueOnce([mockRequest])

    render(
      <MemoryRouter>
        <EmployeeCheckoutPage />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText(/offene anfragen/i)).toBeInTheDocument()
      expect(screen.getByText(/BMW.*320d/i)).toBeInTheDocument()
    }, { timeout: 5000 })
  })

  it('enriches bookings with mileage when missing', async () => {
    const { api } = jest.requireMock('@/services/api')
    const bookingWithoutMileage = {
      ...mockBooking,
      vehicle: { ...mockBooking.vehicle, mileage: undefined },
    }
    api.getPickups.mockResolvedValueOnce([bookingWithoutMileage])
    api.getPickupRequests.mockResolvedValueOnce([])
    api.getVehicleById.mockResolvedValueOnce({ mileage: 50000 })

    render(
      <MemoryRouter>
        <EmployeeCheckoutPage />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(api.getVehicleById).toHaveBeenCalledWith(1)
    }, { timeout: 5000 })
  })

  it('allows user to input notes', async () => {
    const user = userEvent.setup()
    const { api } = jest.requireMock('@/services/api')
    api.getPickups.mockResolvedValueOnce([mockBooking])
    api.getPickupRequests.mockResolvedValueOnce([])

    render(
      <MemoryRouter>
        <EmployeeCheckoutPage />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText(/BMW.*320d/i)).toBeInTheDocument()
    }, { timeout: 5000 })

    const notesTextarea = screen.getByPlaceholderText(/kratzer/i) as HTMLTextAreaElement
    await user.type(notesTextarea, 'Fahrzeug in gutem Zustand')

    expect(notesTextarea.value).toBe('Fahrzeug in gutem Zustand')
  })

  it('performs checkout successfully', async () => {
    const user = userEvent.setup()
    const { api } = jest.requireMock('@/services/api')
    api.getPickups.mockResolvedValueOnce([mockBooking])
    api.getPickupRequests.mockResolvedValueOnce([])
    api.checkoutBooking.mockResolvedValueOnce(undefined)
    api.getPickups.mockResolvedValueOnce([]) // After checkout, pickups empty

    render(
      <MemoryRouter>
        <EmployeeCheckoutPage />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText(/BMW.*320d/i)).toBeInTheDocument()
    }, { timeout: 5000 })

    const checkoutButton = screen.getByText(/check-out durchführen/i)
    await user.click(checkoutButton)

    await waitFor(() => {
      expect(api.checkoutBooking).toHaveBeenCalledWith(1, 50000, '')
    }, { timeout: 5000 })
  })

  it('shows alert when mileage is invalid', async () => {
    const user = userEvent.setup()
    const { api } = jest.requireMock('@/services/api')
    const bookingWithoutMileage = {
      ...mockBooking,
      vehicle: { ...mockBooking.vehicle, mileage: undefined },
    }
    api.getPickups.mockResolvedValueOnce([bookingWithoutMileage])
    api.getPickupRequests.mockResolvedValueOnce([])
    api.getVehicleById.mockResolvedValueOnce({ mileage: undefined })

    render(
      <MemoryRouter>
        <EmployeeCheckoutPage />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText(/BMW.*320d/i)).toBeInTheDocument()
    }, { timeout: 5000 })

    const checkoutButton = screen.getByText(/check-out durchführen/i)
    await user.click(checkoutButton)

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith('Kilometerstand nicht verfügbar')
    }, { timeout: 5000 })
  })

  it('handles checkout error with 409 status', async () => {
    const user = userEvent.setup()
    const { api } = jest.requireMock('@/services/api')
    api.getPickups.mockResolvedValueOnce([mockBooking])
    api.getPickupRequests.mockResolvedValueOnce([])
    api.checkoutBooking.mockRejectedValueOnce({
      response: { status: 409, data: { message: 'Already checked out' } },
    })

    render(
      <MemoryRouter>
        <EmployeeCheckoutPage />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText(/BMW.*320d/i)).toBeInTheDocument()
    }, { timeout: 5000 })

    const checkoutButton = screen.getByText(/check-out durchführen/i)
    await user.click(checkoutButton)

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith('Check-out fehlgeschlagen: Buchung wurde bereits ausgecheckt')
    }, { timeout: 5000 })
  })

  it('handles checkout error with 400 status', async () => {
    const user = userEvent.setup()
    const { api } = jest.requireMock('@/services/api')
    api.getPickups.mockResolvedValueOnce([mockBooking])
    api.getPickupRequests.mockResolvedValueOnce([])
    api.checkoutBooking.mockRejectedValueOnce({
      response: { status: 400, data: { message: 'Invalid input' } },
    })

    render(
      <MemoryRouter>
        <EmployeeCheckoutPage />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText(/BMW.*320d/i)).toBeInTheDocument()
    }, { timeout: 5000 })

    const checkoutButton = screen.getByText(/check-out durchführen/i)
    await user.click(checkoutButton)

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith('Check-out fehlgeschlagen: Ungültige Eingabe - bitte überprüfe deine Daten')
    }, { timeout: 5000 })
  })

  it('handles checkout error with generic error', async () => {
    const user = userEvent.setup()
    const { api } = jest.requireMock('@/services/api')
    api.getPickups.mockResolvedValueOnce([mockBooking])
    api.getPickupRequests.mockResolvedValueOnce([])
    api.checkoutBooking.mockRejectedValueOnce({
      response: { status: 500, data: { error: 'Server error' } },
      message: 'Network error',
    })

    render(
      <MemoryRouter>
        <EmployeeCheckoutPage />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText(/BMW.*320d/i)).toBeInTheDocument()
    }, { timeout: 5000 })

    const checkoutButton = screen.getByText(/check-out durchführen/i)
    await user.click(checkoutButton)

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith(expect.stringContaining('Check-out fehlgeschlagen'))
    }, { timeout: 5000 })
  })

  it('disables checkout button when booking is not confirmed', async () => {
    const { api } = jest.requireMock('@/services/api')
    const unconfirmedBooking = {
      ...mockBooking,
      status: 'ANFRAGE' as const,
    }
    api.getPickups.mockResolvedValueOnce([unconfirmedBooking])
    api.getPickupRequests.mockResolvedValueOnce([])

    render(
      <MemoryRouter>
        <EmployeeCheckoutPage />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText(/BMW.*320d/i)).toBeInTheDocument()
    }, { timeout: 5000 })

    const checkoutButton = screen.getByText(/check-out durchführen/i) as HTMLButtonElement
    expect(checkoutButton.disabled).toBe(true)
  })

  it('disables checkout button when already checked out', async () => {
    const { api } = jest.requireMock('@/services/api')
    const checkedOutBooking = {
      ...mockBooking,
      checkoutTime: '2024-01-01T10:00:00Z',
    }
    api.getPickups.mockResolvedValueOnce([checkedOutBooking])
    api.getPickupRequests.mockResolvedValueOnce([])

    render(
      <MemoryRouter>
        <EmployeeCheckoutPage />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText(/BMW.*320d/i)).toBeInTheDocument()
    }, { timeout: 5000 })

    const checkoutButton = screen.getByText(/check-out durchführen/i) as HTMLButtonElement
    expect(checkoutButton.disabled).toBe(true)
  })

  it('confirms booking request', async () => {
    const user = userEvent.setup()
    const { api } = jest.requireMock('@/services/api')
    api.getPickups.mockResolvedValueOnce([])
    api.getPickupRequests.mockResolvedValueOnce([mockRequest])
    api.confirmBooking.mockResolvedValueOnce(undefined)
    api.getPickups.mockResolvedValueOnce([]) // After confirmation
    api.getPickupRequests.mockResolvedValueOnce([])

    render(
      <MemoryRouter>
        <EmployeeCheckoutPage />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText(/offene anfragen/i)).toBeInTheDocument()
    }, { timeout: 5000 })

    const confirmButton = screen.getByText(/anfrage bestätigen/i)
    await user.click(confirmButton)

    await waitFor(() => {
      expect(api.confirmBooking).toHaveBeenCalledWith(2)
    }, { timeout: 5000 })
  })

  it('handles confirm booking error', async () => {
    const user = userEvent.setup()
    const { api } = jest.requireMock('@/services/api')
    api.getPickups.mockResolvedValueOnce([])
    api.getPickupRequests.mockResolvedValueOnce([mockRequest])
    api.confirmBooking.mockRejectedValueOnce(new Error('Confirmation failed'))

    render(
      <MemoryRouter>
        <EmployeeCheckoutPage />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText(/offene anfragen/i)).toBeInTheDocument()
    }, { timeout: 5000 })

    const confirmButton = screen.getByText(/anfrage bestätigen/i)
    await user.click(confirmButton)

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith('Bestätigung fehlgeschlagen')
    }, { timeout: 5000 })
  })

  it('handles date change', async () => {
    const user = userEvent.setup()
    const { api } = jest.requireMock('@/services/api')
    api.getPickups.mockResolvedValue([])
    api.getPickupRequests.mockResolvedValue([])

    render(
      <MemoryRouter>
        <EmployeeCheckoutPage />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.queryByText(/daten werden geladen/i)).not.toBeInTheDocument()
    }, { timeout: 10000 })

    const dateInput = screen.getByLabelText(/abholdatum/i) as HTMLInputElement
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    const tomorrowStr = tomorrow.toISOString().split('T')[0]
    
    await user.clear(dateInput)
    await user.type(dateInput, tomorrowStr)

    await waitFor(() => {
      expect(api.getPickups).toHaveBeenCalledTimes(2) // Initial load + date change
      expect(api.getPickupRequests).toHaveBeenCalledTimes(2)
    }, { timeout: 10000 })
  })

  it('handles ADMIN role', async () => {
    const { api } = jest.requireMock('@/services/api')
    api.getUserRole.mockReturnValueOnce('ROLE_ADMIN')
    api.getPickups.mockResolvedValueOnce([])
    api.getPickupRequests.mockResolvedValueOnce([])

    render(
      <MemoryRouter>
        <EmployeeCheckoutPage />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(api.getPickups).toHaveBeenCalled()
      expect(api.getPickupRequests).toHaveBeenCalled()
    }, { timeout: 5000 })
  })

})

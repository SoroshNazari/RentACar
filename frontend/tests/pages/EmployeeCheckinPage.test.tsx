import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import EmployeeCheckinPage from '@/pages/EmployeeCheckinPage'
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

jest.mock('@/services/api', () => ({
  api: {
    getUserRole: jest.fn().mockReturnValue('ROLE_EMPLOYEE'),
    getReturns: jest.fn().mockResolvedValue([]),
    getVehicleById: jest.fn().mockResolvedValue({ mileage: 50000 }),
    checkinBooking: jest.fn().mockResolvedValue(undefined),
  },
}))

// Mock window.alert
window.alert = jest.fn()

describe('EmployeeCheckinPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    window.alert = jest.fn()
  })

  it('renders page with German title', () => {
    render(
      <MemoryRouter>
        <EmployeeCheckinPage />
      </MemoryRouter>
    )

    expect(screen.getByText('Fahrzeugrücknahme')).toBeInTheDocument()
  })

  it('displays date selector with German label', () => {
    render(
      <MemoryRouter>
        <EmployeeCheckinPage />
      </MemoryRouter>
    )

    expect(screen.getByText('Rückgabedatum')).toBeInTheDocument()
  })

  it('shows empty state when no returns available', async () => {
    render(
      <MemoryRouter>
        <EmployeeCheckinPage />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.queryByText(/keine/i)).toBeInTheDocument()
    })
  })

  it('shows loading state initially', () => {
    const { api } = jest.requireMock('@/services/api')
    api.getReturns.mockImplementation(() => new Promise(() => {}))

    render(
      <MemoryRouter>
        <EmployeeCheckinPage />
      </MemoryRouter>
    )

    expect(screen.getByText(/daten werden geladen/i)).toBeInTheDocument()
  })

  it('handles non-employee role', async () => {
    const { api } = jest.requireMock('@/services/api')
    api.getUserRole.mockReturnValueOnce('ROLE_CUSTOMER')

    render(
      <MemoryRouter>
        <EmployeeCheckinPage />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.queryByText(/daten werden geladen/i)).not.toBeInTheDocument()
    }, { timeout: 5000 })
  })

  it('handles error when loading returns fails', async () => {
    const { api } = jest.requireMock('@/services/api')
    api.getReturns.mockRejectedValueOnce(new Error('Failed to load'))

    render(
      <MemoryRouter>
        <EmployeeCheckinPage />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.queryByText(/daten werden geladen/i)).not.toBeInTheDocument()
    }, { timeout: 5000 })
  })

  it('displays bookings when available', async () => {
    const { api } = jest.requireMock('@/services/api')
    api.getReturns.mockResolvedValueOnce([mockBooking])

    render(
      <MemoryRouter>
        <EmployeeCheckinPage />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText(/BMW.*320d/i)).toBeInTheDocument()
    }, { timeout: 5000 })
  })

  it('enriches bookings with mileage when missing', async () => {
    const { api } = jest.requireMock('@/services/api')
    const bookingWithoutMileage = {
      ...mockBooking,
      vehicle: { ...mockBooking.vehicle, mileage: undefined },
    }
    api.getReturns.mockResolvedValueOnce([bookingWithoutMileage])
    api.getVehicleById.mockResolvedValueOnce({ mileage: 50000 })

    render(
      <MemoryRouter>
        <EmployeeCheckinPage />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(api.getVehicleById).toHaveBeenCalledWith(1)
    }, { timeout: 5000 })
  })

  it('allows user to input mileage', async () => {
    const user = userEvent.setup()
    const { api } = jest.requireMock('@/services/api')
    api.getReturns.mockResolvedValueOnce([mockBooking])

    render(
      <MemoryRouter>
        <EmployeeCheckinPage />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText(/BMW.*320d/i)).toBeInTheDocument()
    }, { timeout: 10000 })

    const mileageInputs = screen.getAllByPlaceholderText(/z\.B\./i) as HTMLInputElement[]
    const returnMileageInput = mileageInputs.find(input => input.min === '50000') || mileageInputs[1]
    await user.clear(returnMileageInput)
    await user.type(returnMileageInput, '51000')

    expect(returnMileageInput.value).toBe('51000')
  })

  it('allows user to toggle damage checkbox', async () => {
    const user = userEvent.setup()
    const { api } = jest.requireMock('@/services/api')
    api.getReturns.mockResolvedValueOnce([mockBooking])

    render(
      <MemoryRouter>
        <EmployeeCheckinPage />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText(/BMW.*320d/i)).toBeInTheDocument()
    }, { timeout: 10000 })

    const damageCheckbox = screen.getByRole('checkbox') as HTMLInputElement
    expect(damageCheckbox.checked).toBe(false)
    await user.click(damageCheckbox)

    expect(damageCheckbox.checked).toBe(true)
  })

  it('allows user to input damage notes', async () => {
    const user = userEvent.setup()
    const { api } = jest.requireMock('@/services/api')
    api.getReturns.mockResolvedValueOnce([mockBooking])

    render(
      <MemoryRouter>
        <EmployeeCheckinPage />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText(/BMW.*320d/i)).toBeInTheDocument()
    }, { timeout: 5000 })

    const notesTextarea = screen.getByPlaceholderText(/kratzer/i) as HTMLTextAreaElement
    await user.type(notesTextarea, 'Kratzer an der Tür')

    expect(notesTextarea.value).toBe('Kratzer an der Tür')
  })

  it('allows user to input damage cost', async () => {
    const user = userEvent.setup()
    const { api } = jest.requireMock('@/services/api')
    api.getReturns.mockResolvedValueOnce([mockBooking])

    render(
      <MemoryRouter>
        <EmployeeCheckinPage />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText(/BMW.*320d/i)).toBeInTheDocument()
    }, { timeout: 5000 })

    const costInput = screen.getByPlaceholderText(/z\.B\. 150/i) as HTMLInputElement
    await user.type(costInput, '150')

    expect(costInput.value).toBe('150')
  })

  it('shows alert when mileage is invalid', async () => {
    const user = userEvent.setup()
    const { api } = jest.requireMock('@/services/api')
    api.getReturns.mockResolvedValueOnce([mockBooking])

    render(
      <MemoryRouter>
        <EmployeeCheckinPage />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText(/BMW.*320d/i)).toBeInTheDocument()
    }, { timeout: 5000 })

    const mileageInput = screen.getByPlaceholderText(/z\.B\./i) as HTMLInputElement
    await user.type(mileageInput, '0')

    const checkinButton = screen.getByText(/check-in durchführen/i)
    await user.click(checkinButton)

    expect(window.alert).toHaveBeenCalledWith('Bitte gib einen gültigen Kilometerstand ein')
  })

  it('shows alert when mileage is less than current mileage', async () => {
    const user = userEvent.setup()
    const { api } = jest.requireMock('@/services/api')
    api.getReturns.mockResolvedValueOnce([mockBooking])

    render(
      <MemoryRouter>
        <EmployeeCheckinPage />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText(/BMW.*320d/i)).toBeInTheDocument()
    }, { timeout: 5000 })

    const mileageInputs = screen.getAllByPlaceholderText(/z\.B\./i) as HTMLInputElement[]
    const returnMileageInput = mileageInputs.find(input => input.min === '50000') || mileageInputs[1]
    await user.clear(returnMileageInput)
    await user.type(returnMileageInput, '49000')

    const checkinButton = screen.getByText(/check-in durchführen/i)
    await user.click(checkinButton)

    expect(window.alert).toHaveBeenCalledWith('Kilometerstand muss mindestens 50000 sein')
  })

  it('performs check-in successfully', async () => {
    const user = userEvent.setup()
    const { api } = jest.requireMock('@/services/api')
    api.getReturns.mockResolvedValueOnce([mockBooking])
    api.checkinBooking.mockResolvedValueOnce(undefined)
    api.getReturns.mockResolvedValueOnce([]) // After check-in, returns empty list

    render(
      <MemoryRouter>
        <EmployeeCheckinPage />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText(/BMW.*320d/i)).toBeInTheDocument()
    }, { timeout: 5000 })

    const mileageInputs = screen.getAllByPlaceholderText(/z\.B\./i) as HTMLInputElement[]
    const returnMileageInput = mileageInputs.find(input => input.min === '50000') || mileageInputs[1]
    await user.clear(returnMileageInput)
    await user.type(returnMileageInput, '51000')

    const checkinButton = screen.getByText(/check-in durchführen/i)
    await user.click(checkinButton)

    await waitFor(() => {
      expect(api.checkinBooking).toHaveBeenCalledWith(1, expect.objectContaining({
        mileage: 51000,
        damagePresent: false,
        damageNotes: '',
        damageCost: undefined,
      }))
    }, { timeout: 5000 })
  })

  it('handles check-in error', async () => {
    const user = userEvent.setup()
    const { api } = jest.requireMock('@/services/api')
    api.getReturns.mockResolvedValueOnce([mockBooking])
    api.checkinBooking.mockRejectedValueOnce(new Error('Check-in failed'))
    api.getReturns.mockResolvedValueOnce([mockBooking]) // After error, still show booking

    render(
      <MemoryRouter>
        <EmployeeCheckinPage />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText(/BMW.*320d/i)).toBeInTheDocument()
    }, { timeout: 10000 })

    const mileageInput = screen.getByPlaceholderText(/z\.B\./i) as HTMLInputElement
    await user.clear(mileageInput)
    await user.type(mileageInput, '51000')

    const checkinButton = screen.getByText(/check-in durchführen/i)
    await user.click(checkinButton)

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith('Check-in fehlgeschlagen')
    }, { timeout: 10000 })
  })

  it('handles date change', async () => {
    const user = userEvent.setup()
    const { api } = jest.requireMock('@/services/api')
    api.getReturns.mockResolvedValue([])

    render(
      <MemoryRouter>
        <EmployeeCheckinPage />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.queryByText(/daten werden geladen/i)).not.toBeInTheDocument()
    }, { timeout: 10000 })

    const dateInput = screen.getByLabelText(/rückgabedatum/i) as HTMLInputElement
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    const tomorrowStr = tomorrow.toISOString().split('T')[0]
    
    await user.clear(dateInput)
    await user.type(dateInput, tomorrowStr)

    await waitFor(() => {
      expect(api.getReturns).toHaveBeenCalledTimes(2) // Initial load + date change
    }, { timeout: 10000 })
  })

  it('handles ADMIN role', async () => {
    const { api } = jest.requireMock('@/services/api')
    api.getUserRole.mockReturnValueOnce('ROLE_ADMIN')
    api.getReturns.mockResolvedValueOnce([])

    render(
      <MemoryRouter>
        <EmployeeCheckinPage />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(api.getReturns).toHaveBeenCalled()
    }, { timeout: 5000 })
  })

})

        <EmployeeCheckinPage />
      </MemoryRouter>
    )

    expect(screen.getByText('Rückgabedatum')).toBeInTheDocument()
  })

  it('shows empty state when no returns available', async () => {
    render(
      <MemoryRouter>
        <EmployeeCheckinPage />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.queryByText(/keine/i)).toBeInTheDocument()
    })
  })

  it('shows loading state initially', () => {
    const { api } = jest.requireMock('@/services/api')
    api.getReturns.mockImplementation(() => new Promise(() => {}))

    render(
      <MemoryRouter>
        <EmployeeCheckinPage />
      </MemoryRouter>
    )

    expect(screen.getByText(/daten werden geladen/i)).toBeInTheDocument()
  })

  it('handles non-employee role', async () => {
    const { api } = jest.requireMock('@/services/api')
    api.getUserRole.mockReturnValueOnce('ROLE_CUSTOMER')

    render(
      <MemoryRouter>
        <EmployeeCheckinPage />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.queryByText(/daten werden geladen/i)).not.toBeInTheDocument()
    }, { timeout: 5000 })
  })

  it('handles error when loading returns fails', async () => {
    const { api } = jest.requireMock('@/services/api')
    api.getReturns.mockRejectedValueOnce(new Error('Failed to load'))

    render(
      <MemoryRouter>
        <EmployeeCheckinPage />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.queryByText(/daten werden geladen/i)).not.toBeInTheDocument()
    }, { timeout: 5000 })
  })

  it('displays bookings when available', async () => {
    const { api } = jest.requireMock('@/services/api')
    api.getReturns.mockResolvedValueOnce([mockBooking])

    render(
      <MemoryRouter>
        <EmployeeCheckinPage />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText(/BMW.*320d/i)).toBeInTheDocument()
    }, { timeout: 5000 })
  })

  it('enriches bookings with mileage when missing', async () => {
    const { api } = jest.requireMock('@/services/api')
    const bookingWithoutMileage = {
      ...mockBooking,
      vehicle: { ...mockBooking.vehicle, mileage: undefined },
    }
    api.getReturns.mockResolvedValueOnce([bookingWithoutMileage])
    api.getVehicleById.mockResolvedValueOnce({ mileage: 50000 })

    render(
      <MemoryRouter>
        <EmployeeCheckinPage />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(api.getVehicleById).toHaveBeenCalledWith(1)
    }, { timeout: 5000 })
  })

  it('allows user to input mileage', async () => {
    const user = userEvent.setup()
    const { api } = jest.requireMock('@/services/api')
    api.getReturns.mockResolvedValueOnce([mockBooking])

    render(
      <MemoryRouter>
        <EmployeeCheckinPage />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText(/BMW.*320d/i)).toBeInTheDocument()
    }, { timeout: 10000 })

    const mileageInputs = screen.getAllByPlaceholderText(/z\.B\./i) as HTMLInputElement[]
    const returnMileageInput = mileageInputs.find(input => input.min === '50000') || mileageInputs[1]
    await user.clear(returnMileageInput)
    await user.type(returnMileageInput, '51000')

    expect(returnMileageInput.value).toBe('51000')
  })

  it('allows user to toggle damage checkbox', async () => {
    const user = userEvent.setup()
    const { api } = jest.requireMock('@/services/api')
    api.getReturns.mockResolvedValueOnce([mockBooking])

    render(
      <MemoryRouter>
        <EmployeeCheckinPage />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText(/BMW.*320d/i)).toBeInTheDocument()
    }, { timeout: 10000 })

    const damageCheckbox = screen.getByRole('checkbox') as HTMLInputElement
    expect(damageCheckbox.checked).toBe(false)
    await user.click(damageCheckbox)

    expect(damageCheckbox.checked).toBe(true)
  })

  it('allows user to input damage notes', async () => {
    const user = userEvent.setup()
    const { api } = jest.requireMock('@/services/api')
    api.getReturns.mockResolvedValueOnce([mockBooking])

    render(
      <MemoryRouter>
        <EmployeeCheckinPage />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText(/BMW.*320d/i)).toBeInTheDocument()
    }, { timeout: 5000 })

    const notesTextarea = screen.getByPlaceholderText(/kratzer/i) as HTMLTextAreaElement
    await user.type(notesTextarea, 'Kratzer an der Tür')

    expect(notesTextarea.value).toBe('Kratzer an der Tür')
  })

  it('allows user to input damage cost', async () => {
    const user = userEvent.setup()
    const { api } = jest.requireMock('@/services/api')
    api.getReturns.mockResolvedValueOnce([mockBooking])

    render(
      <MemoryRouter>
        <EmployeeCheckinPage />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText(/BMW.*320d/i)).toBeInTheDocument()
    }, { timeout: 5000 })

    const costInput = screen.getByPlaceholderText(/z\.B\. 150/i) as HTMLInputElement
    await user.type(costInput, '150')

    expect(costInput.value).toBe('150')
  })

  it('shows alert when mileage is invalid', async () => {
    const user = userEvent.setup()
    const { api } = jest.requireMock('@/services/api')
    api.getReturns.mockResolvedValueOnce([mockBooking])

    render(
      <MemoryRouter>
        <EmployeeCheckinPage />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText(/BMW.*320d/i)).toBeInTheDocument()
    }, { timeout: 5000 })

    const mileageInput = screen.getByPlaceholderText(/z\.B\./i) as HTMLInputElement
    await user.type(mileageInput, '0')

    const checkinButton = screen.getByText(/check-in durchführen/i)
    await user.click(checkinButton)

    expect(window.alert).toHaveBeenCalledWith('Bitte gib einen gültigen Kilometerstand ein')
  })

  it('shows alert when mileage is less than current mileage', async () => {
    const user = userEvent.setup()
    const { api } = jest.requireMock('@/services/api')
    api.getReturns.mockResolvedValueOnce([mockBooking])

    render(
      <MemoryRouter>
        <EmployeeCheckinPage />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText(/BMW.*320d/i)).toBeInTheDocument()
    }, { timeout: 5000 })

    const mileageInputs = screen.getAllByPlaceholderText(/z\.B\./i) as HTMLInputElement[]
    const returnMileageInput = mileageInputs.find(input => input.min === '50000') || mileageInputs[1]
    await user.clear(returnMileageInput)
    await user.type(returnMileageInput, '49000')

    const checkinButton = screen.getByText(/check-in durchführen/i)
    await user.click(checkinButton)

    expect(window.alert).toHaveBeenCalledWith('Kilometerstand muss mindestens 50000 sein')
  })

  it('performs check-in successfully', async () => {
    const user = userEvent.setup()
    const { api } = jest.requireMock('@/services/api')
    api.getReturns.mockResolvedValueOnce([mockBooking])
    api.checkinBooking.mockResolvedValueOnce(undefined)
    api.getReturns.mockResolvedValueOnce([]) // After check-in, returns empty list

    render(
      <MemoryRouter>
        <EmployeeCheckinPage />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText(/BMW.*320d/i)).toBeInTheDocument()
    }, { timeout: 5000 })

    const mileageInputs = screen.getAllByPlaceholderText(/z\.B\./i) as HTMLInputElement[]
    const returnMileageInput = mileageInputs.find(input => input.min === '50000') || mileageInputs[1]
    await user.clear(returnMileageInput)
    await user.type(returnMileageInput, '51000')

    const checkinButton = screen.getByText(/check-in durchführen/i)
    await user.click(checkinButton)

    await waitFor(() => {
      expect(api.checkinBooking).toHaveBeenCalledWith(1, expect.objectContaining({
        mileage: 51000,
        damagePresent: false,
        damageNotes: '',
        damageCost: undefined,
      }))
    }, { timeout: 5000 })
  })

  it('handles check-in error', async () => {
    const user = userEvent.setup()
    const { api } = jest.requireMock('@/services/api')
    api.getReturns.mockResolvedValueOnce([mockBooking])
    api.checkinBooking.mockRejectedValueOnce(new Error('Check-in failed'))
    api.getReturns.mockResolvedValueOnce([mockBooking]) // After error, still show booking

    render(
      <MemoryRouter>
        <EmployeeCheckinPage />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText(/BMW.*320d/i)).toBeInTheDocument()
    }, { timeout: 10000 })

    const mileageInput = screen.getByPlaceholderText(/z\.B\./i) as HTMLInputElement
    await user.clear(mileageInput)
    await user.type(mileageInput, '51000')

    const checkinButton = screen.getByText(/check-in durchführen/i)
    await user.click(checkinButton)

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith('Check-in fehlgeschlagen')
    }, { timeout: 10000 })
  })

  it('handles date change', async () => {
    const user = userEvent.setup()
    const { api } = jest.requireMock('@/services/api')
    api.getReturns.mockResolvedValue([])

    render(
      <MemoryRouter>
        <EmployeeCheckinPage />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.queryByText(/daten werden geladen/i)).not.toBeInTheDocument()
    }, { timeout: 10000 })

    const dateInput = screen.getByLabelText(/rückgabedatum/i) as HTMLInputElement
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    const tomorrowStr = tomorrow.toISOString().split('T')[0]
    
    await user.clear(dateInput)
    await user.type(dateInput, tomorrowStr)

    await waitFor(() => {
      expect(api.getReturns).toHaveBeenCalledTimes(2) // Initial load + date change
    }, { timeout: 10000 })
  })

  it('handles ADMIN role', async () => {
    const { api } = jest.requireMock('@/services/api')
    api.getUserRole.mockReturnValueOnce('ROLE_ADMIN')
    api.getReturns.mockResolvedValueOnce([])

    render(
      <MemoryRouter>
        <EmployeeCheckinPage />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(api.getReturns).toHaveBeenCalled()
    }, { timeout: 5000 })
  })

})

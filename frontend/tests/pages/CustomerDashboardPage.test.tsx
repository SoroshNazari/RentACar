import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import CustomerDashboardPage from '@/pages/CustomerDashboardPage'

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
})

const mockNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}))

jest.mock('@/services/api', () => ({
  api: {
    isAuthenticated: jest.fn().mockReturnValue(true),
    getUserRole: jest.fn().mockReturnValue('ROLE_CUSTOMER'),
    getCustomerMe: jest.fn().mockResolvedValue({
      id: 77,
      firstName: 'Max',
      lastName: 'Mustermann',
      email: 'max@example.com',
      phone: '0123456789',
      driverLicenseNumber: 'B-123',
      address: 'Musterstraße 1',
    }),
    getCustomerByUsername: jest.fn(),
    getBookingHistory: jest.fn().mockResolvedValue([]),
    cancelBooking: jest.fn().mockResolvedValue(undefined),
  },
}))

describe('CustomerDashboardPage', () => {
  it('renders profile and empty bookings', async () => {
    render(
      <MemoryRouter>
        <CustomerDashboardPage />
      </MemoryRouter>
    )

    expect(await screen.findByText('Mein Profil')).toBeInTheDocument()
    expect(await screen.findByText('Noch keine Buchungen')).toBeInTheDocument()
  })

  it('renders customer information in German', async () => {
    render(
      <MemoryRouter>
        <CustomerDashboardPage />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText('Persönliche Informationen')).toBeInTheDocument()
      expect(screen.getByText('Name')).toBeInTheDocument()
      expect(screen.getByText('E-Mail')).toBeInTheDocument()
      expect(screen.getByText('Telefon')).toBeInTheDocument()
      expect(screen.getByText('Adresse')).toBeInTheDocument()
    })
  })

  it('renders bookings list with cancel option', async () => {
    const { api } = jest.requireMock('@/services/api')
    const futurePickup = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString()
    api.getBookingHistory.mockResolvedValueOnce([
      {
        id: 1,
        customerId: 77,
        vehicle: { brand: 'BMW', model: '320d' },
        pickupDate: futurePickup,
        returnDate: futurePickup,
        pickupLocation: 'Berlin',
        returnLocation: 'Berlin',
        status: 'BESTÄTIGT',
        totalPrice: 120,
      },
    ])

    render(
      <MemoryRouter>
        <CustomerDashboardPage />
      </MemoryRouter>
    )

    expect(await screen.findByText('Meine Buchungen')).toBeInTheDocument()
    expect(await screen.findByText(/BMW\s*320d/)).toBeInTheDocument()
    expect(await screen.findByText('Stornieren')).toBeInTheDocument()
  })

  it('redirects to login when not authenticated', async () => {
    const { api } = jest.requireMock('@/services/api')
    api.isAuthenticated.mockReturnValueOnce(false)

    render(
      <MemoryRouter>
        <CustomerDashboardPage />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/login')
    })
  })

  it('handles cancel booking with confirmation', async () => {
    const user = userEvent.setup()
    const { api } = jest.requireMock('@/services/api')
    const futurePickup = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString()
    api.getBookingHistory.mockResolvedValueOnce([
      {
        id: 2,
        customerId: 77,
        vehicle: { brand: 'Audi', model: 'A4' },
        pickupDate: futurePickup,
        returnDate: futurePickup,
        pickupLocation: 'Berlin',
        returnLocation: 'Berlin',
        status: 'BESTÄTIGT',
        totalPrice: 200,
      },
    ])
    window.confirm = jest.fn().mockReturnValue(true)

    render(
      <MemoryRouter>
        <CustomerDashboardPage />
      </MemoryRouter>
    )

    const cancelButton = await screen.findByText('Stornieren')
    await user.click(cancelButton)

    await waitFor(() => {
      expect(api.cancelBooking).toHaveBeenCalledWith(2)
    })
  })

  it('shows alert when cancel deadline passed', async () => {
    const { api } = jest.requireMock('@/services/api')
    const pastPickup = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
    api.getBookingHistory.mockResolvedValueOnce([
      {
        id: 1,
        customerId: 77,
        vehicle: { brand: 'BMW', model: '320d' },
        pickupDate: pastPickup,
        returnDate: pastPickup,
        pickupLocation: 'Berlin',
        returnLocation: 'Berlin',
        status: 'BESTÄTIGT',
        totalPrice: 120,
      },
    ])
    window.alert = jest.fn()

    render(
      <MemoryRouter>
        <CustomerDashboardPage />
      </MemoryRouter>
    )

    const cancelButton = await screen.findByText('Stornieren')
    expect(cancelButton).toBeDisabled()
  })

  it('handles error when loading customer data fails', async () => {
    const { api } = jest.requireMock('@/services/api')
    api.getCustomerMe.mockRejectedValueOnce(new Error('Failed to load'))
    api.getCustomerByUsername = jest.fn().mockRejectedValueOnce(new Error('Failed'))

    render(
      <MemoryRouter>
        <CustomerDashboardPage />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.queryByText('Dashboard wird geladen...')).not.toBeInTheDocument()
    }, { timeout: 5000 })
  })


  it('handles cancel booking error', async () => {
    const user = userEvent.setup()
    const { api } = jest.requireMock('@/services/api')
    window.alert = jest.fn()
    window.confirm = jest.fn().mockReturnValue(true)
    const futurePickup = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString()
    api.getBookingHistory.mockResolvedValueOnce([
      {
        id: 2,
        customerId: 77,
        vehicle: { brand: 'Audi', model: 'A4' },
        pickupDate: futurePickup,
        returnDate: futurePickup,
        pickupLocation: 'Berlin',
        returnLocation: 'Berlin',
        status: 'BESTÄTIGT',
        totalPrice: 200,
      },
    ])
    api.cancelBooking.mockRejectedValueOnce(new Error('Failed'))

    render(
      <MemoryRouter>
        <CustomerDashboardPage />
      </MemoryRouter>
    )

    const cancelButton = await screen.findByText('Stornieren')
    await user.click(cancelButton)

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith('Stornierung fehlgeschlagen. Bitte versuche es erneut.')
    })
  })

  it('handles customer loading with username fallback', async () => {
    const { api } = jest.requireMock('@/services/api')
    api.getCustomerMe.mockRejectedValueOnce(new Error('Failed'))
    api.getCustomerByUsername.mockResolvedValueOnce({
      id: 77,
      firstName: 'Max',
      lastName: 'Mustermann',
      email: 'max@example.com',
      phone: '0123456789',
      driverLicenseNumber: 'B-123',
      address: 'Musterstraße 1',
    })
    localStorageMock.getItem.mockReturnValue('testuser')

    render(
      <MemoryRouter>
        <CustomerDashboardPage />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(api.getCustomerByUsername).toHaveBeenCalledWith('testuser')
    }, { timeout: 5000 })
  })
})

      {
        id: 2,
        customerId: 77,
        vehicle: { brand: 'Audi', model: 'A4' },
        pickupDate: futurePickup,
        returnDate: futurePickup,
        pickupLocation: 'Berlin',
        returnLocation: 'Berlin',
        status: 'BESTÄTIGT',
        totalPrice: 200,
      },
    ])
    window.confirm = jest.fn().mockReturnValue(true)

    render(
      <MemoryRouter>
        <CustomerDashboardPage />
      </MemoryRouter>
    )

    const cancelButton = await screen.findByText('Stornieren')
    await user.click(cancelButton)

    await waitFor(() => {
      expect(api.cancelBooking).toHaveBeenCalledWith(2)
    })
  })

  it('shows alert when cancel deadline passed', async () => {
    const { api } = jest.requireMock('@/services/api')
    const pastPickup = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
    api.getBookingHistory.mockResolvedValueOnce([
      {
        id: 1,
        customerId: 77,
        vehicle: { brand: 'BMW', model: '320d' },
        pickupDate: pastPickup,
        returnDate: pastPickup,
        pickupLocation: 'Berlin',
        returnLocation: 'Berlin',
        status: 'BESTÄTIGT',
        totalPrice: 120,
      },
    ])
    window.alert = jest.fn()

    render(
      <MemoryRouter>
        <CustomerDashboardPage />
      </MemoryRouter>
    )

    const cancelButton = await screen.findByText('Stornieren')
    expect(cancelButton).toBeDisabled()
  })

  it('handles error when loading customer data fails', async () => {
    const { api } = jest.requireMock('@/services/api')
    api.getCustomerMe.mockRejectedValueOnce(new Error('Failed to load'))
    api.getCustomerByUsername = jest.fn().mockRejectedValueOnce(new Error('Failed'))

    render(
      <MemoryRouter>
        <CustomerDashboardPage />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.queryByText('Dashboard wird geladen...')).not.toBeInTheDocument()
    }, { timeout: 5000 })
  })


  it('handles cancel booking error', async () => {
    const user = userEvent.setup()
    const { api } = jest.requireMock('@/services/api')
    window.alert = jest.fn()
    window.confirm = jest.fn().mockReturnValue(true)
    const futurePickup = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString()
    api.getBookingHistory.mockResolvedValueOnce([
      {
        id: 2,
        customerId: 77,
        vehicle: { brand: 'Audi', model: 'A4' },
        pickupDate: futurePickup,
        returnDate: futurePickup,
        pickupLocation: 'Berlin',
        returnLocation: 'Berlin',
        status: 'BESTÄTIGT',
        totalPrice: 200,
      },
    ])
    api.cancelBooking.mockRejectedValueOnce(new Error('Failed'))

    render(
      <MemoryRouter>
        <CustomerDashboardPage />
      </MemoryRouter>
    )

    const cancelButton = await screen.findByText('Stornieren')
    await user.click(cancelButton)

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith('Stornierung fehlgeschlagen. Bitte versuche es erneut.')
    })
  })

  it('handles customer loading with username fallback', async () => {
    const { api } = jest.requireMock('@/services/api')
    api.getCustomerMe.mockRejectedValueOnce(new Error('Failed'))
    api.getCustomerByUsername.mockResolvedValueOnce({
      id: 77,
      firstName: 'Max',
      lastName: 'Mustermann',
      email: 'max@example.com',
      phone: '0123456789',
      driverLicenseNumber: 'B-123',
      address: 'Musterstraße 1',
    })
    localStorageMock.getItem.mockReturnValue('testuser')

    render(
      <MemoryRouter>
        <CustomerDashboardPage />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(api.getCustomerByUsername).toHaveBeenCalledWith('testuser')
    }, { timeout: 5000 })
  })
})

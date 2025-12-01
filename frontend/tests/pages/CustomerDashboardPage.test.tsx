import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import CustomerDashboardPage from '../CustomerDashboardPage'

const mockNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}))

jest.mock('@/lib/api', () => ({
  api: {
    isAuthenticated: jest.fn().mockReturnValue(true),
    getUserRole: jest.fn().mockReturnValue('ROLE_CUSTOMER'),
    getCustomerMe: jest.fn().mockResolvedValue({
      id: 77,
      firstName: 'Erika',
      lastName: 'Mustermann',
      email: 'erika@example.com',
      phone: '01234',
      driverLicenseNumber: 'E-123',
      address: 'Street 2',
    }),
    getBookingHistory: jest.fn().mockResolvedValue([]),
    cancelBooking: jest.fn().mockResolvedValue(undefined),
  }
}))

describe('CustomerDashboardPage', () => {
  it('renders profile and empty bookings', async () => {
    render(
      <MemoryRouter>
        <CustomerDashboardPage />
      </MemoryRouter>
    )

    expect(await screen.findByText('My Profile')).toBeInTheDocument()
    expect(await screen.findByText('No bookings yet')).toBeInTheDocument()
  })

  it('renders bookings list with cancel disabled when deadline passed', async () => {
    const { api } = jest.requireMock('@/lib/api')
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

    render(
      <MemoryRouter>
        <CustomerDashboardPage />
      </MemoryRouter>
    )

    expect(await screen.findByText('My Bookings')).toBeInTheDocument()
    expect(await screen.findByText(/BMW\s*320d/)).toBeInTheDocument()
    const cancelBtn = await screen.findByText('Stornieren')
    expect(cancelBtn).toHaveAttribute('disabled')
  })

  it('redirects to login when not authenticated', async () => {
    const { api } = jest.requireMock('@/lib/api')
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

  it('cancels booking when allowed and user confirms', async () => {
    const { api } = jest.requireMock('@/lib/api')
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
    jest.spyOn(window, 'confirm').mockReturnValue(true)

    render(
      <MemoryRouter>
        <CustomerDashboardPage />
      </MemoryRouter>
    )

    const cancelBtn = await screen.findByText('Stornieren')
    expect(cancelBtn).not.toHaveAttribute('disabled')
    cancelBtn.click()
    await waitFor(() => {
      expect(api.cancelBooking).toHaveBeenCalledWith(2)
    })
  })
})

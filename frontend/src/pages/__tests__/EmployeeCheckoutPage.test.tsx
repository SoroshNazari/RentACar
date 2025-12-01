import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import EmployeeCheckoutPage from '../EmployeeCheckoutPage'

jest.mock('@/lib/api', () => ({
  api: {
    getUserRole: jest.fn().mockReturnValue('ROLE_EMPLOYEE'),
    getPickups: jest.fn().mockResolvedValue([]),
    getPickupRequests: jest.fn().mockResolvedValue([]),
    getVehicleById: jest.fn(),
    checkoutBooking: jest.fn().mockResolvedValue(undefined),
    confirmBooking: jest.fn().mockResolvedValue(undefined),
  },
}))

describe('EmployeeCheckoutPage', () => {
  it('renders and shows empty state', async () => {
    render(
      <MemoryRouter>
        <EmployeeCheckoutPage />
      </MemoryRouter>
    )

    expect(screen.getByText('Employee Check-out')).toBeInTheDocument()
    await waitFor(() => {
      expect(screen.getByText('No confirmed pickups for the selected day.')).toBeInTheDocument()
      expect(screen.getByText('No open requests for the selected day.')).toBeInTheDocument()
    })
  })

  it('shows confirmed pickup and performs checkout', async () => {
    const { api } = jest.requireMock('@/lib/api')
    const booking = {
      id: 1,
      customerId: 2,
      pickupDate: new Date().toISOString(),
      returnDate: new Date().toISOString(),
      pickupLocation: 'Berlin',
      returnLocation: 'Berlin',
      status: 'BESTÄTIGT',
      vehicle: { id: 10, brand: 'BMW', model: '320d', mileage: 50000, licensePlate: 'B-AB 1234' },
      checkoutTime: null,
    }
    api.getPickups.mockResolvedValueOnce([booking])

    render(
      <MemoryRouter>
        <EmployeeCheckoutPage />
      </MemoryRouter>
    )

    expect(await screen.findByText(/Confirmed Pickups/)).toBeInTheDocument()
    expect(await screen.findByText(/BMW\s*320d/)).toBeInTheDocument()
    const btn = await screen.findByText('Perform Check-out')
    expect(btn).not.toHaveAttribute('disabled')
    fireEvent.click(btn)
    await waitFor(() => {
      expect(api.checkoutBooking).toHaveBeenCalledWith(1, 50000, expect.any(String))
    })
  })

  it('shows proper error message when checkout fails with 409', async () => {
    const { api } = jest.requireMock('@/lib/api')
    const booking = {
      id: 3,
      customerId: 5,
      pickupDate: new Date().toISOString(),
      returnDate: new Date().toISOString(),
      pickupLocation: 'Berlin',
      returnLocation: 'Berlin',
      status: 'BESTÄTIGT',
      vehicle: { id: 10, brand: 'VW', model: 'Golf', mileage: 10000, licensePlate: 'B-XY 9999' },
      checkoutTime: null,
    }
    api.getPickups.mockResolvedValueOnce([booking])
    api.checkoutBooking.mockRejectedValueOnce({ response: { status: 409 } })
    const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {})

    render(
      <MemoryRouter>
        <EmployeeCheckoutPage />
      </MemoryRouter>
    )

    const btn = await screen.findByText('Perform Check-out')
    btn.click()
    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith('Checkout failed: Booking has already been checked out')
    })
  })

  it('shows proper error message when checkout fails with 400', async () => {
    const { api } = jest.requireMock('@/lib/api')
    const booking = {
      id: 4,
      customerId: 5,
      pickupDate: new Date().toISOString(),
      returnDate: new Date().toISOString(),
      pickupLocation: 'Berlin',
      returnLocation: 'Berlin',
      status: 'BESTÄTIGT',
      vehicle: { id: 10, brand: 'VW', model: 'Golf', mileage: 10000, licensePlate: 'B-XY 9999' },
      checkoutTime: null,
    }
    api.getPickups.mockResolvedValueOnce([booking])
    api.checkoutBooking.mockRejectedValueOnce({ response: { status: 400 } })
    const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {})

    render(
      <MemoryRouter>
        <EmployeeCheckoutPage />
      </MemoryRouter>
    )

    const btn = await screen.findByText('Perform Check-out')
    btn.click()
    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith('Checkout failed: Invalid input - please check your data')
    })
  })

  it('shows generic error message when checkout fails without status', async () => {
    const { api } = jest.requireMock('@/lib/api')
    const booking = {
      id: 5,
      customerId: 5,
      pickupDate: new Date().toISOString(),
      returnDate: new Date().toISOString(),
      pickupLocation: 'Berlin',
      returnLocation: 'Berlin',
      status: 'BESTÄTIGT',
      vehicle: { id: 10, brand: 'VW', model: 'Golf', mileage: 10000, licensePlate: 'B-XY 9999' },
      checkoutTime: null,
    }
    api.getPickups.mockResolvedValueOnce([booking])
    api.checkoutBooking.mockRejectedValueOnce({ message: 'oops' })
    const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {})

    render(
      <MemoryRouter>
        <EmployeeCheckoutPage />
      </MemoryRouter>
    )

    const btn = await screen.findByText('Perform Check-out')
    btn.click()
    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith('Checkout failed: oops')
    })
  })
})

import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import BookingFlowPage from '../BookingFlowPage'

const mockNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({ vehicleId: '1' }),
  useNavigate: () => mockNavigate,
}))

jest.mock('@/lib/api', () => ({
  api: {
    isAuthenticated: jest.fn().mockReturnValue(true),
    getCustomerMe: jest.fn().mockResolvedValue({
      id: 99,
      firstName: 'Max',
      lastName: 'Mustermann',
      email: 'max@example.com',
      phone: '01234',
      driverLicenseNumber: 'D-123',
      address: 'Street 1',
    }),
    getVehicleById: jest.fn().mockResolvedValue({
      id: 1,
      brand: 'BMW',
      model: '320d',
      dailyPrice: 60,
      location: 'Berlin',
      imageUrl: '',
    }),
    createBooking: jest.fn().mockResolvedValue(undefined),
  }
}))

describe('BookingFlowPage', () => {
  it('walks through steps and confirms booking (happy path)', async () => {
    render(
      <MemoryRouter>
        <BookingFlowPage />
      </MemoryRouter>
    )

    // Step 1: Dates
    await screen.findAllByDisplayValue('')
    const pickupInput = document.querySelector('input[type="date"]') as HTMLInputElement
    const dropoffInput = document.querySelectorAll('input[type="date"]')[1] as HTMLInputElement
    const today = new Date()
    const start = today.toISOString().split('T')[0]
    const end = new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    fireEvent.change(pickupInput, { target: { value: start } })
    fireEvent.change(dropoffInput, { target: { value: end } })
    fireEvent.click(screen.getByText('Continue to Step 2 →'))

    // Step 2: Customer details
    fireEvent.change(screen.getByPlaceholderText('John Doe'), { target: { value: 'Max Mustermann' } })
    fireEvent.change(screen.getByPlaceholderText('you@example.com'), { target: { value: 'max@example.com' } })
    fireEvent.change(screen.getByPlaceholderText('(123) 456-7890'), { target: { value: '01234' } })
    fireEvent.change(screen.getByPlaceholderText('D123-4567-8901'), { target: { value: 'D-123' } })
    fireEvent.click(screen.getByText('Continue to Payment →'))

    // Step 3: Payment
    fireEvent.click(screen.getByText('Confirm & Pay'))

    await waitFor(() => {
      expect(screen.getByText('Your Booking Summary')).toBeInTheDocument()
    })
  })

  it('shows error when createBooking fails', async () => {
    const { api } = jest.requireMock('@/lib/api')
    api.createBooking.mockRejectedValueOnce(new Error('fail'))
    const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {})

    const { container } = render(
      <MemoryRouter>
        <BookingFlowPage />
      </MemoryRouter>
    )
    await screen.findByText('Select Your Rental Dates')
    const dateInputs = Array.from(container.querySelectorAll('input[type="date"]')) as HTMLInputElement[]
    const pickupInput = dateInputs[0]
    const dropoffInput = dateInputs[1]
    const today = new Date()
    const start = today.toISOString().split('T')[0]
    const end = new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    fireEvent.change(pickupInput, { target: { value: start } })
    fireEvent.change(dropoffInput, { target: { value: end } })
    fireEvent.click(screen.getByText('Continue to Step 2 →'))
    fireEvent.click(screen.getByText('Continue to Payment →'))
    fireEvent.click(screen.getByText('Confirm & Pay'))

    await waitFor(() => {
      expect(api.createBooking).toHaveBeenCalled()
      expect(alertSpy).toHaveBeenCalled()
    })
  })

  it('alerts when dates are missing on continue', async () => {
    const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {})
    render(
      <MemoryRouter>
        <BookingFlowPage />
      </MemoryRouter>
    )
    await screen.findByText('Select Your Rental Dates')
    fireEvent.click(screen.getByText('Continue to Step 2 →'))
    expect(alertSpy).toHaveBeenCalled()
  })

  it('redirects to login on confirm when not authenticated', async () => {
    const { api } = jest.requireMock('@/lib/api')
    api.isAuthenticated.mockReturnValueOnce(false)
    const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {})

    const { container } = render(
      <MemoryRouter>
        <BookingFlowPage />
      </MemoryRouter>
    )
    await screen.findByText('Select Your Rental Dates')
    const dateInputs = Array.from(container.querySelectorAll('input[type="date"]')) as HTMLInputElement[]
    const pickupInput = dateInputs[0]
    const dropoffInput = dateInputs[1]
    const today = new Date()
    const start = today.toISOString().split('T')[0]
    const end = new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    fireEvent.change(pickupInput, { target: { value: start } })
    fireEvent.change(dropoffInput, { target: { value: end } })
    fireEvent.click(screen.getByText('Continue to Step 2 →'))

    fireEvent.change(screen.getByPlaceholderText('John Doe'), { target: { value: 'Max Mustermann' } })
    fireEvent.change(screen.getByPlaceholderText('you@example.com'), { target: { value: 'max@example.com' } })
    fireEvent.change(screen.getByPlaceholderText('(123) 456-7890'), { target: { value: '01234' } })
    fireEvent.change(screen.getByPlaceholderText('D123-4567-8901'), { target: { value: 'D-123' } })
    fireEvent.click(screen.getByText('Continue to Payment →'))

    fireEvent.click(screen.getByText('Confirm & Pay'))
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/login')
      expect(alertSpy).toHaveBeenCalled()
    })
  })
})

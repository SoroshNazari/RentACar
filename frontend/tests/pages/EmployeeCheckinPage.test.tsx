import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import EmployeeCheckinPage from '../EmployeeCheckinPage'

jest.mock('@/lib/api', () => ({
  api: {
    getUserRole: jest.fn().mockReturnValue('ROLE_EMPLOYEE'),
    getReturns: jest.fn().mockResolvedValue([]),
    getVehicleById: jest.fn(),
    checkinBooking: jest.fn().mockResolvedValue(undefined),
  },
}))

describe('EmployeeCheckinPage', () => {
  it('renders and shows empty state', async () => {
    render(
      <MemoryRouter>
        <EmployeeCheckinPage />
      </MemoryRouter>
    )

    expect(screen.getByText('Employee Check-in')).toBeInTheDocument()
    await waitFor(() => {
      expect(screen.getByText('No confirmed returns for the selected day.')).toBeInTheDocument()
    })
  })

  it('validates mileage and performs check-in', async () => {
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
    }
    api.getReturns.mockResolvedValueOnce([booking])

    const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {})

    render(
      <MemoryRouter>
        <EmployeeCheckinPage />
      </MemoryRouter>
    )

    expect(await screen.findByText(/BMW\s*320d/)).toBeInTheDocument()
    const mileageInput = screen.getByPlaceholderText(/e\.g\./i) as HTMLInputElement
    fireEvent.change(mileageInput, { target: { value: '49000' } })
    fireEvent.click(screen.getByText('Perform Check-in'))
    expect(alertSpy).toHaveBeenCalled()

    fireEvent.change(mileageInput, { target: { value: '51000' } })
    fireEvent.click(screen.getByText('Perform Check-in'))
    await waitFor(() => {
      expect(api.checkinBooking).toHaveBeenCalledWith(1, expect.objectContaining({ mileage: 51000 }))
    })
  })
})

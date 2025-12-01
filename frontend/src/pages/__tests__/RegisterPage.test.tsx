import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import RegisterPage from '../RegisterPage'

jest.mock('@/lib/api', () => ({
  api: {
    registerCustomer: jest.fn().mockResolvedValue(undefined),
  }
}))

describe('RegisterPage', () => {
  it('validates password mismatch and shows error', () => {
    render(
      <MemoryRouter>
        <RegisterPage />
      </MemoryRouter>
    )

    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'a' } })
    fireEvent.change(screen.getByLabelText('Confirm Password'), { target: { value: 'b' } })
    fireEvent.submit(screen.getByText('Sign Up'))

    expect(screen.getByText('Passwords do not match')).toBeInTheDocument()
  })

  it('submits form successfully', async () => {
    const { api } = jest.requireMock('@/lib/api')

    render(
      <MemoryRouter>
        <RegisterPage />
      </MemoryRouter>
    )

    const fill = (label: string, value: string) => fireEvent.change(screen.getByLabelText(label), { target: { value } })
    fill('First Name', 'A')
    fill('Last Name', 'B')
    fill('Username', 'user')
    fill('Email', 'a@b.com')
    fill('Phone', '0123')
    fill('Address', 'Street')
    fill("Driver's License Number", 'D1')
    fill('Password', 'p')
    fill('Confirm Password', 'p')

    fireEvent.submit(screen.getByText('Sign Up'))

    await waitFor(() => {
      expect(api.registerCustomer).toHaveBeenCalled()
    })
  })
})


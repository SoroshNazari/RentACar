import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import LoginPage from '../LoginPage'
import { api } from '@/lib/api'

jest.mock('@/lib/api')
const mockedApi = api as jest.Mocked<typeof api>

const mockNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}))

describe('LoginPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    localStorage.clear()
  })

  it('renders login form', () => {
    render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>
    )

    expect(screen.getByText('Welcome Back')).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/Enter your username/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/Enter your password/i)).toBeInTheDocument()
  })

  it('shows error on failed login', async () => {
    mockedApi.login = jest.fn().mockRejectedValue(new Error('Invalid credentials'))

    render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>
    )

    const usernameInput = screen.getByPlaceholderText(/Enter your username/i)
    const passwordInput = screen.getByPlaceholderText(/Enter your password/i)
    const submitButton = screen.getByText('Sign In')

    fireEvent.change(usernameInput, { target: { value: 'testuser' } })
    fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/Invalid credentials/i)).toBeInTheDocument()
    })
  })
})


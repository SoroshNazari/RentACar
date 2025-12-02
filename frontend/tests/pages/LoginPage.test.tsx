import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import LoginPage from '@/pages/LoginPage'

// Mock the API module
const mockLogin = jest.fn()
const mockGetUserRoles = jest.fn()
const mockIsAuthenticated = jest.fn(() => false)

jest.mock('@/services/api', () => ({
  api: {
    isAuthenticated: (...args: unknown[]) => mockIsAuthenticated(...args),
    login: (...args: unknown[]) => mockLogin(...args),
    getUserRoles: (...args: unknown[]) => mockGetUserRoles(...args),
  },
}))

// Mock useNavigate
const mockNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}))

describe('LoginPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockNavigate.mockClear()
    mockLogin.mockClear()
    mockGetUserRoles.mockClear()
    mockIsAuthenticated.mockReturnValue(false)
  })

  it('renders login form with German text', () => {
    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    )

    expect(screen.getByText('Willkommen zurück')).toBeInTheDocument()
    expect(screen.getByText('Melde dich in deinem Konto an')).toBeInTheDocument()
    expect(screen.getByText('Benutzername')).toBeInTheDocument()
    expect(screen.getByText('Passwort')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Dein Benutzername')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Dein Passwort')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /anmelden/i })).toBeInTheDocument()
    expect(screen.getByText(/noch kein konto/i)).toBeInTheDocument()
    expect(screen.getByText(/registrieren/i)).toBeInTheDocument()
  })

  it('allows user to input username and password', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    )

    const usernameInput = screen.getByPlaceholderText('Dein Benutzername')
    const passwordInput = screen.getByPlaceholderText('Dein Passwort')

    await user.type(usernameInput, 'testuser')
    await user.type(passwordInput, 'testpass')

    expect(usernameInput).toHaveValue('testuser')
    expect(passwordInput).toHaveValue('testpass')
  })

  it('shows loading state during login', async () => {
    const user = userEvent.setup()
    mockLogin.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)))

    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    )

    const usernameInput = screen.getByPlaceholderText('Dein Benutzername')
    const passwordInput = screen.getByPlaceholderText('Dein Passwort')
    const submitButton = screen.getByRole('button', { name: /anmelden/i })

    await user.type(usernameInput, 'testuser')
    await user.type(passwordInput, 'testpass')
    await user.click(submitButton)

    expect(screen.getByText('Anmeldung läuft...')).toBeInTheDocument()
    expect(submitButton).toBeDisabled()
  })

  it('navigates to dashboard for customer role after successful login', async () => {
    const user = userEvent.setup()
    mockLogin.mockResolvedValue(undefined)
    mockGetUserRoles.mockReturnValue(['ROLE_CUSTOMER'])

    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    )

    const usernameInput = screen.getByPlaceholderText('Dein Benutzername')
    const passwordInput = screen.getByPlaceholderText('Dein Passwort')
    const submitButton = screen.getByRole('button', { name: /anmelden/i })

    await user.type(usernameInput, 'customer')
    await user.type(passwordInput, 'password')
    await user.click(submitButton)

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('customer', 'password')
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard')
    })
  })

  it('navigates to employee page for employee role after successful login', async () => {
    const user = userEvent.setup()
    mockLogin.mockResolvedValue(undefined)
    mockGetUserRoles.mockReturnValue(['ROLE_EMPLOYEE'])

    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    )

    const usernameInput = screen.getByPlaceholderText('Dein Benutzername')
    const passwordInput = screen.getByPlaceholderText('Dein Passwort')
    const submitButton = screen.getByRole('button', { name: /anmelden/i })

    await user.type(usernameInput, 'employee')
    await user.type(passwordInput, 'password')
    await user.click(submitButton)

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('employee', 'password')
      expect(mockNavigate).toHaveBeenCalledWith('/employee')
    })
  })

  it('shows error message on login failure', async () => {
    const user = userEvent.setup()
    mockLogin.mockRejectedValue({ response: { data: { error: 'Ungültige Anmeldedaten' } } })

    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    )

    const usernameInput = screen.getByPlaceholderText('Dein Benutzername')
    const passwordInput = screen.getByPlaceholderText('Dein Passwort')
    const submitButton = screen.getByRole('button', { name: /anmelden/i })

    await user.type(usernameInput, 'wronguser')
    await user.type(passwordInput, 'wrongpass')
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/Ungültige Anmeldedaten/i)).toBeInTheDocument()
    })
  })
})

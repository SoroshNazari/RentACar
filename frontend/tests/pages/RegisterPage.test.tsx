import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import RegisterPage from '@/pages/RegisterPage'

// Mock the API module
const mockRegisterCustomer = jest.fn()

jest.mock('@/services/api', () => ({
  api: {
    registerCustomer: (...args: unknown[]) => mockRegisterCustomer(...args),
  },
}))

// Mock useNavigate
const mockNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}))

describe('RegisterPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockNavigate.mockClear()
    mockRegisterCustomer.mockClear()
  })

  it('renders registration form with all German fields', () => {
    render(
      <MemoryRouter>
        <RegisterPage />
      </MemoryRouter>
    )

    expect(screen.getByText('Konto erstellen')).toBeInTheDocument()
    expect(screen.getByText('Registriere dich, um Fahrzeuge zu mieten')).toBeInTheDocument()
    expect(screen.getByText('Vorname')).toBeInTheDocument()
    expect(screen.getByText('Nachname')).toBeInTheDocument()
    expect(screen.getByText('Benutzername')).toBeInTheDocument()
    expect(screen.getByText('E-Mail')).toBeInTheDocument()
    expect(screen.getByText('Telefon')).toBeInTheDocument()
    expect(screen.getByText('Adresse')).toBeInTheDocument()
    expect(screen.getByText(/führerscheinnummer/i)).toBeInTheDocument()
    expect(screen.getByText('Passwort')).toBeInTheDocument()
    expect(screen.getByText('Passwort bestätigen')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /registrieren/i })).toBeInTheDocument()
    expect(screen.getByText(/bereits ein konto/i)).toBeInTheDocument()
    expect(screen.getByText(/anmelden/i)).toBeInTheDocument()
  })

  it('allows user to fill in all form fields', async () => {
    const user = userEvent.setup()
    const { container } = render(
      <MemoryRouter>
        <RegisterPage />
      </MemoryRouter>
    )

    const firstNameInput = container.querySelector('input[name="firstName"]') as HTMLInputElement
    const lastNameInput = container.querySelector('input[name="lastName"]') as HTMLInputElement
    const usernameInput = container.querySelector('input[name="username"]') as HTMLInputElement
    const emailInput = container.querySelector('input[name="email"]') as HTMLInputElement
    const phoneInput = container.querySelector('input[name="phone"]') as HTMLInputElement
    const addressInput = container.querySelector('input[name="address"]') as HTMLInputElement
    const licenseInput = container.querySelector('input[name="driverLicenseNumber"]') as HTMLInputElement
    const passwordInput = container.querySelector('input[name="password"]') as HTMLInputElement
    const confirmPasswordInput = container.querySelector('input[name="confirmPassword"]') as HTMLInputElement

    await user.type(firstNameInput, 'Max')
    await user.type(lastNameInput, 'Mustermann')
    await user.type(usernameInput, 'maxmustermann')
    await user.type(emailInput, 'max@example.com')
    await user.type(phoneInput, '0123456789')
    await user.type(addressInput, 'Musterstraße 1')
    await user.type(licenseInput, 'B123456789')
    await user.type(passwordInput, 'password123')
    await user.type(confirmPasswordInput, 'password123')

    expect(firstNameInput).toHaveValue('Max')
    expect(lastNameInput).toHaveValue('Mustermann')
    expect(usernameInput).toHaveValue('maxmustermann')
    expect(emailInput).toHaveValue('max@example.com')
    expect(phoneInput).toHaveValue('0123456789')
    expect(addressInput).toHaveValue('Musterstraße 1')
    expect(licenseInput).toHaveValue('B123456789')
    expect(passwordInput).toHaveValue('password123')
    expect(confirmPasswordInput).toHaveValue('password123')
  })

  it('shows error when passwords do not match', async () => {
    const user = userEvent.setup()
    const { container } = render(
      <MemoryRouter>
        <RegisterPage />
      </MemoryRouter>
    )

    const firstNameInput = container.querySelector('input[name="firstName"]') as HTMLInputElement
    const lastNameInput = container.querySelector('input[name="lastName"]') as HTMLInputElement
    const usernameInput = container.querySelector('input[name="username"]') as HTMLInputElement
    const emailInput = container.querySelector('input[name="email"]') as HTMLInputElement
    const phoneInput = container.querySelector('input[name="phone"]') as HTMLInputElement
    const addressInput = container.querySelector('input[name="address"]') as HTMLInputElement
    const licenseInput = container.querySelector('input[name="driverLicenseNumber"]') as HTMLInputElement
    const passwordInput = container.querySelector('input[name="password"]') as HTMLInputElement
    const confirmPasswordInput = container.querySelector('input[name="confirmPassword"]') as HTMLInputElement

    await user.type(firstNameInput, 'Max')
    await user.type(lastNameInput, 'Mustermann')
    await user.type(usernameInput, 'maxmustermann')
    await user.type(emailInput, 'max@example.com')
    await user.type(phoneInput, '0123456789')
    await user.type(addressInput, 'Musterstraße 1')
    await user.type(licenseInput, 'B123456789')
    await user.type(passwordInput, 'password123')
    await user.type(confirmPasswordInput, 'differentpass')

    const submitButton = screen.getByRole('button', { name: /registrieren/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('Passwörter stimmen nicht überein')).toBeInTheDocument()
    })

    expect(mockRegisterCustomer).not.toHaveBeenCalled()
  })

  it('submits form successfully when all fields are valid', async () => {
    const user = userEvent.setup()
    mockRegisterCustomer.mockResolvedValue({ id: 1 })

    const { container } = render(
      <MemoryRouter>
        <RegisterPage />
      </MemoryRouter>
    )

    const firstNameInput = container.querySelector('input[name="firstName"]') as HTMLInputElement
    const lastNameInput = container.querySelector('input[name="lastName"]') as HTMLInputElement
    const usernameInput = container.querySelector('input[name="username"]') as HTMLInputElement
    const emailInput = container.querySelector('input[name="email"]') as HTMLInputElement
    const phoneInput = container.querySelector('input[name="phone"]') as HTMLInputElement
    const addressInput = container.querySelector('input[name="address"]') as HTMLInputElement
    const licenseInput = container.querySelector('input[name="driverLicenseNumber"]') as HTMLInputElement
    const passwordInput = container.querySelector('input[name="password"]') as HTMLInputElement
    const confirmPasswordInput = container.querySelector('input[name="confirmPassword"]') as HTMLInputElement

    await user.type(firstNameInput, 'Max')
    await user.type(lastNameInput, 'Mustermann')
    await user.type(usernameInput, 'maxmustermann')
    await user.type(emailInput, 'max@example.com')
    await user.type(phoneInput, '0123456789')
    await user.type(addressInput, 'Musterstraße 1')
    await user.type(licenseInput, 'B123456789')
    await user.type(passwordInput, 'password123')
    await user.type(confirmPasswordInput, 'password123')

    const submitButton = screen.getByRole('button', { name: /registrieren/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(mockRegisterCustomer).toHaveBeenCalledWith({
        username: 'maxmustermann',
        password: 'password123',
        firstName: 'Max',
        lastName: 'Mustermann',
        email: 'max@example.com',
        phone: '0123456789',
        address: 'Musterstraße 1',
        driverLicenseNumber: 'B123456789',
      })
      expect(mockNavigate).toHaveBeenCalledWith('/login?registered=true')
    })
  })

  it('shows loading state during registration', async () => {
    const user = userEvent.setup()
    mockRegisterCustomer.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)))

    const { container } = render(
      <MemoryRouter>
        <RegisterPage />
      </MemoryRouter>
    )

    const firstNameInput = container.querySelector('input[name="firstName"]') as HTMLInputElement
    const lastNameInput = container.querySelector('input[name="lastName"]') as HTMLInputElement
    const usernameInput = container.querySelector('input[name="username"]') as HTMLInputElement
    const emailInput = container.querySelector('input[name="email"]') as HTMLInputElement
    const phoneInput = container.querySelector('input[name="phone"]') as HTMLInputElement
    const addressInput = container.querySelector('input[name="address"]') as HTMLInputElement
    const licenseInput = container.querySelector('input[name="driverLicenseNumber"]') as HTMLInputElement
    const passwordInput = container.querySelector('input[name="password"]') as HTMLInputElement
    const confirmPasswordInput = container.querySelector('input[name="confirmPassword"]') as HTMLInputElement

    await user.type(firstNameInput, 'Max')
    await user.type(lastNameInput, 'Mustermann')
    await user.type(usernameInput, 'maxmustermann')
    await user.type(emailInput, 'max@example.com')
    await user.type(phoneInput, '0123456789')
    await user.type(addressInput, 'Musterstraße 1')
    await user.type(licenseInput, 'B123456789')
    await user.type(passwordInput, 'password123')
    await user.type(confirmPasswordInput, 'password123')

    const submitButton = screen.getByRole('button', { name: /registrieren/i })
    await user.click(submitButton)

    expect(screen.getByText('Konto wird erstellt...')).toBeInTheDocument()
    expect(submitButton).toBeDisabled()
  })

  it('shows error message on registration failure', async () => {
    const user = userEvent.setup()
    mockRegisterCustomer.mockRejectedValue({
      response: { data: { message: 'Registrierung fehlgeschlagen' } },
    })

    const { container } = render(
      <MemoryRouter>
        <RegisterPage />
      </MemoryRouter>
    )

    const firstNameInput = container.querySelector('input[name="firstName"]') as HTMLInputElement
    const lastNameInput = container.querySelector('input[name="lastName"]') as HTMLInputElement
    const usernameInput = container.querySelector('input[name="username"]') as HTMLInputElement
    const emailInput = container.querySelector('input[name="email"]') as HTMLInputElement
    const phoneInput = container.querySelector('input[name="phone"]') as HTMLInputElement
    const addressInput = container.querySelector('input[name="address"]') as HTMLInputElement
    const licenseInput = container.querySelector('input[name="driverLicenseNumber"]') as HTMLInputElement
    const passwordInput = container.querySelector('input[name="password"]') as HTMLInputElement
    const confirmPasswordInput = container.querySelector('input[name="confirmPassword"]') as HTMLInputElement

    await user.type(firstNameInput, 'Max')
    await user.type(lastNameInput, 'Mustermann')
    await user.type(usernameInput, 'maxmustermann')
    await user.type(emailInput, 'max@example.com')
    await user.type(phoneInput, '0123456789')
    await user.type(addressInput, 'Musterstraße 1')
    await user.type(licenseInput, 'B123456789')
    await user.type(passwordInput, 'password123')
    await user.type(confirmPasswordInput, 'password123')

    const submitButton = screen.getByRole('button', { name: /registrieren/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/Registrierung fehlgeschlagen/i)).toBeInTheDocument()
    })
  })
})

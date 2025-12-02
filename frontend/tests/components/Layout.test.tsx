import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import Layout from '@/components/layout/Layout'

// Mock the API module
const mockIsAuthenticated = jest.fn(() => false)
const mockGetUserRole = jest.fn(() => null)
const mockLogout = jest.fn()

jest.mock('@/services/api', () => ({
  api: {
    isAuthenticated: (...args: unknown[]) => mockIsAuthenticated(...args),
    getUserRole: (...args: unknown[]) => mockGetUserRole(...args),
    logout: (...args: unknown[]) => mockLogout(...args),
  },
}))

// Mock useNavigate
const mockNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}))

// Mock window.scrollTo
Object.defineProperty(window, 'scrollTo', {
  value: jest.fn(),
  writable: true,
})

describe('Layout Component', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockNavigate.mockClear()
    mockIsAuthenticated.mockReturnValue(false)
    mockGetUserRole.mockReturnValue(null)
  })

  it('renders navigation links for unauthenticated users', () => {
    render(
      <MemoryRouter>
        <Layout />
      </MemoryRouter>
    )
    
    expect(screen.getAllByText('RentACar').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Über uns').length).toBeGreaterThan(0)
    expect(screen.getByText('Anmelden')).toBeInTheDocument()
    expect(screen.getByText('Registrieren')).toBeInTheDocument()
  })

  it('renders customer navigation when authenticated as customer', () => {
    mockIsAuthenticated.mockReturnValue(true)
    mockGetUserRole.mockReturnValue('ROLE_CUSTOMER')

    render(
      <MemoryRouter>
        <Layout />
      </MemoryRouter>
    )

    expect(screen.getByText('Profil')).toBeInTheDocument()
    expect(screen.getByText('Abmelden')).toBeInTheDocument()
    expect(screen.queryByText('Fahrzeugausgabe')).not.toBeInTheDocument()
  })

  it('renders employee navigation when authenticated as employee', () => {
    mockIsAuthenticated.mockReturnValue(true)
    mockGetUserRole.mockReturnValue('ROLE_EMPLOYEE')

    render(
      <MemoryRouter>
        <Layout />
      </MemoryRouter>
    )

    expect(screen.getByText('Fahrzeugausgabe')).toBeInTheDocument()
    expect(screen.getByText('Fahrzeugrücknahme')).toBeInTheDocument()
    expect(screen.getByText('Abmelden')).toBeInTheDocument()
    expect(screen.queryByText('Profil')).not.toBeInTheDocument()
  })

  it('renders employee navigation when authenticated as admin', () => {
    mockIsAuthenticated.mockReturnValue(true)
    mockGetUserRole.mockReturnValue('ROLE_ADMIN')

    render(
      <MemoryRouter>
        <Layout />
      </MemoryRouter>
    )

    expect(screen.getByText('Fahrzeugausgabe')).toBeInTheDocument()
    expect(screen.getByText('Fahrzeugrücknahme')).toBeInTheDocument()
    expect(screen.getByText('Abmelden')).toBeInTheDocument()
  })

  it('handles logout correctly', async () => {
    const user = userEvent.setup()
    mockIsAuthenticated.mockReturnValue(true)
    mockGetUserRole.mockReturnValue('ROLE_CUSTOMER')
    
    render(
      <MemoryRouter>
        <Layout />
      </MemoryRouter>
    )

    const logoutButton = screen.getByText('Abmelden')
    await user.click(logoutButton)

    expect(mockLogout).toHaveBeenCalled()
    expect(mockNavigate).toHaveBeenCalledWith('/login')
  })

  it('renders footer with all German sections', () => {
    render(
      <MemoryRouter>
        <Layout />
      </MemoryRouter>
    )
    
    expect(screen.getByText('UNTERNEHMEN')).toBeInTheDocument()
    expect(screen.getByText('SUPPORT')).toBeInTheDocument()
    expect(screen.getByText('RECHTLICHES')).toBeInTheDocument()
    expect(screen.getByText(/premium autovermietung/i)).toBeInTheDocument()
    expect(screen.getByText(/© 2024 RentACar/i)).toBeInTheDocument()
    expect(screen.getByText(/alle rechte vorbehalten/i)).toBeInTheDocument()
  })
})

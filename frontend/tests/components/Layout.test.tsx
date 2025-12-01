import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Layout from '../layout/Layout'

describe('Layout', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('shows Sign In/Up when unauthenticated', () => {
    render(
      <MemoryRouter>
        <Layout />
      </MemoryRouter>
    )
    expect(screen.getByText('Sign In')).toBeInTheDocument()
    expect(screen.getByText('Sign Up')).toBeInTheDocument()
  })

  it('shows Dashboard and Logout for customer', () => {
    localStorage.setItem('authToken', 't')
    localStorage.setItem('userRole', 'ROLE_CUSTOMER')
    render(
      <MemoryRouter>
        <Layout />
      </MemoryRouter>
    )
    expect(screen.getByText('Profile')).toBeInTheDocument()
    const logout = screen.getByText('Log Out')
    fireEvent.click(logout)
    expect(localStorage.getItem('authToken')).toBeNull()
  })
})

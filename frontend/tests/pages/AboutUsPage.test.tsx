import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import AboutUsPage from '../AboutUsPage'

describe('AboutUsPage - Basic Tests', () => {
  it('renders without crashing', () => {
    render(
      <MemoryRouter>
        <AboutUsPage />
      </MemoryRouter>
    )
    
    expect(screen.getByText('About RentACar')).toBeInTheDocument()
  })

  it('displays company information', () => {
    render(
      <MemoryRouter>
        <AboutUsPage />
      </MemoryRouter>
    )
    
    expect(screen.getByText('Our Values')).toBeInTheDocument()
    expect(screen.getByText('Browse Our Fleet')).toBeInTheDocument()
  })
})
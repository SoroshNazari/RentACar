import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import AboutUsPage from '@/pages/AboutUsPage'

describe('AboutUsPage', () => {
  it('renders without crashing', () => {
    render(
      <MemoryRouter>
        <AboutUsPage />
      </MemoryRouter>
    )

    expect(screen.getByText('Über RentACar')).toBeInTheDocument()
  })

  it('displays company information in German', () => {
    render(
      <MemoryRouter>
        <AboutUsPage />
      </MemoryRouter>
    )

    expect(screen.getByText('Unsere Werte')).toBeInTheDocument()
    expect(screen.getByText('Unsere Flotte durchsuchen')).toBeInTheDocument()
    expect(screen.getByText(/Kundenorientierter Service/i)).toBeInTheDocument()
    expect(screen.getByText(/Premium-Fahrzeugflotte/i)).toBeInTheDocument()
    expect(screen.getByText(/Transparente Preise/i)).toBeInTheDocument()
  })
})

    expect(screen.getByText(/Transparente Preise/i)).toBeInTheDocument()
  })
})

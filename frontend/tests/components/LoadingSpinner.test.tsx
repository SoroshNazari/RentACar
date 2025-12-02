import { render, screen } from '@testing-library/react'
import LoadingSpinner from '@/components/LoadingSpinner'

describe('LoadingSpinner', () => {
  it('renders loading spinner with German text', () => {
    render(<LoadingSpinner />)

    expect(screen.getByText('Laden...')).toBeInTheDocument()
  })

  it('renders spinner element', () => {
    const { container } = render(<LoadingSpinner />)

    const spinner = container.querySelector('.animate-spin')
    expect(spinner).toBeInTheDocument()
  })

  it('has correct structure', () => {
    const { container } = render(<LoadingSpinner />)

    expect(container.querySelector('.min-h-screen')).toBeInTheDocument()
    expect(container.querySelector('.flex.flex-col')).toBeInTheDocument()
  })
})

import LoadingSpinner from '@/components/LoadingSpinner'

describe('LoadingSpinner', () => {
  it('renders loading spinner with German text', () => {
    render(<LoadingSpinner />)

    expect(screen.getByText('Laden...')).toBeInTheDocument()
  })

  it('renders spinner element', () => {
    const { container } = render(<LoadingSpinner />)

    const spinner = container.querySelector('.animate-spin')
    expect(spinner).toBeInTheDocument()
  })

  it('has correct structure', () => {
    const { container } = render(<LoadingSpinner />)

    expect(container.querySelector('.min-h-screen')).toBeInTheDocument()
    expect(container.querySelector('.flex.flex-col')).toBeInTheDocument()
  })
})


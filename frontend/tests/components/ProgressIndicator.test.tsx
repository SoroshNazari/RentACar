import { render, screen } from '@testing-library/react'
import ProgressIndicator from '@/components/layout/ProgressIndicator'

describe('ProgressIndicator', () => {
  it('renders all steps with German labels', () => {
    const steps = [
      { number: 1, label: 'Datum wählen', completed: false, active: true },
      { number: 2, label: 'Kundendaten', completed: false, active: false },
      { number: 3, label: 'Zahlung', completed: false, active: false },
    ]

    render(<ProgressIndicator steps={steps} />)

    expect(screen.getByText('Datum wählen')).toBeInTheDocument()
    expect(screen.getByText('Kundendaten')).toBeInTheDocument()
    expect(screen.getByText('Zahlung')).toBeInTheDocument()
  })

  it('highlights current step', () => {
    const steps = [
      { number: 1, label: 'Datum wählen', completed: true, active: false },
      { number: 2, label: 'Kundendaten', completed: false, active: true },
      { number: 3, label: 'Zahlung', completed: false, active: false },
    ]

    render(<ProgressIndicator steps={steps} />)

    const detailsStep = screen.getByText('Kundendaten')
    expect(detailsStep).toBeInTheDocument()
  })

  it('shows completed steps', () => {
    const steps = [
      { number: 1, label: 'Datum wählen', completed: true, active: false },
      { number: 2, label: 'Kundendaten', completed: true, active: false },
      { number: 3, label: 'Zahlung', completed: false, active: true },
    ]

    render(<ProgressIndicator steps={steps} />)

    expect(screen.getByText('Datum wählen')).toBeInTheDocument()
    expect(screen.getByText('Kundendaten')).toBeInTheDocument()
    expect(screen.getByText('Zahlung')).toBeInTheDocument()
  })
})

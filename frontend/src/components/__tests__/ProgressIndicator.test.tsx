import { render, screen } from '@testing-library/react'
import ProgressIndicator from '../layout/ProgressIndicator'

describe('ProgressIndicator', () => {
  it('renders all steps', () => {
    const steps = [
      { number: 1, label: 'Step 1', completed: false, active: true },
      { number: 2, label: 'Step 2', completed: false, active: false },
      { number: 3, label: 'Step 3', completed: false, active: false },
    ]

    render(<ProgressIndicator steps={steps} />)

    expect(screen.getByText('Step 1')).toBeInTheDocument()
    expect(screen.getByText('Step 2')).toBeInTheDocument()
    expect(screen.getByText('Step 3')).toBeInTheDocument()
  })

  it('shows active step with primary color', () => {
    const steps = [
      { number: 1, label: 'Step 1', completed: false, active: true },
    ]

    render(<ProgressIndicator steps={steps} />)
    const stepElement = screen.getByText('1').closest('div')
    expect(stepElement).toHaveClass('bg-primary-600')
  })

  it('shows completed step with checkmark', () => {
    const steps = [
      { number: 1, label: 'Step 1', completed: true, active: false },
    ]

    render(<ProgressIndicator steps={steps} />)
    expect(screen.getByText('✓')).toBeInTheDocument()
  })
})


interface ProgressStep {
  number: number
  label: string
  completed?: boolean
  active?: boolean
}

interface ProgressIndicatorProps {
  steps: ProgressStep[]
}

const ProgressIndicator = ({ steps }: ProgressIndicatorProps) => {
  return (
    <div className="flex items-center justify-center gap-4 py-8">
      {steps.map((step, index) => (
        <div key={step.number} className="flex items-center">
          <div className="flex flex-col items-center">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-colors ${
                step.active
                  ? 'bg-primary-600 text-white'
                  : step.completed
                    ? 'bg-primary-600 text-white'
                    : 'bg-dark-700 text-gray-400'
              }`}
            >
              {step.completed ? '✓' : step.number}
            </div>
            <span className={`mt-2 text-sm ${step.active ? 'text-primary-600' : 'text-gray-400'}`}>
              {step.label}
            </span>
          </div>
          {index < steps.length - 1 && (
            <div
              className={`w-16 h-0.5 mx-2 ${step.completed ? 'bg-primary-600' : 'bg-dark-700'}`}
            />
          )}
        </div>
      ))}
    </div>
  )
}

export default ProgressIndicator

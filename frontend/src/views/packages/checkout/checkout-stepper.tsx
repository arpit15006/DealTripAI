// Third-party Imports
import { CheckIcon } from 'lucide-react'

// Type Imports
import type { CheckoutStep } from '@/types/packages/checkout-types'

// Utils Imports
import { cn } from '@/lib/utils'

type StepId = 'choose' | CheckoutStep

type StepConfig = {
  id: StepId
  label: string
  number: number
}

const STEPS: StepConfig[] = [
  { id: 'choose', label: 'Review', number: 1 },
  { id: 'enter-info', label: 'Enter Info', number: 2 },
  { id: 'payment', label: 'Pay', number: 3 }
]

type StepStatus = 'completed' | 'active' | 'upcoming'

const STEP_ORDER: CheckoutStep[] = ['enter-info', 'payment', 'confirmation']

const getStepStatus = (stepId: StepId, currentStep: CheckoutStep): StepStatus => {
  if (stepId === 'choose') return 'completed'

  const stepIndex = STEP_ORDER.indexOf(stepId as CheckoutStep)
  const currentIndex = STEP_ORDER.indexOf(currentStep)

  if (stepIndex === currentIndex) return 'active'
  if (stepIndex < currentIndex) return 'completed'

  return 'upcoming'
}

type CheckoutStepperProps = {
  currentStep: CheckoutStep
}

const CheckoutStepper = ({ currentStep }: CheckoutStepperProps) => {
  return (
    <div className='flex items-center justify-center px-4'>
      <div className='flex w-full items-center'>
        {STEPS.map((step, index) => {
          const status = getStepStatus(step.id, currentStep)
          const isLast = index === STEPS.length - 1
          const lineCompleted = status === 'completed' && !isLast

          return (
            <div key={step.id} className={cn('flex items-center', isLast ? 'shrink-0' : 'flex-1')}>
              <div className='flex flex-col items-center gap-2'>
                <div
                  className={cn(
                    'flex size-9 items-center justify-center rounded-full border-2 text-sm font-semibold transition-all duration-300',
                    status === 'completed' &&
                      'border-primary bg-primary text-primary-foreground shadow-primary/30 shadow-sm',
                    status === 'active' && 'border-primary bg-primary/10 text-primary',
                    status === 'upcoming' && 'border-muted-foreground bg-muted text-muted-foreground'
                  )}
                >
                  {status === 'completed' ? (
                    <CheckIcon className='size-4' strokeWidth={2.5} />
                  ) : (
                    <span>{step.number}</span>
                  )}
                </div>
                <span
                  className={cn(
                    'text-xs font-medium whitespace-nowrap',
                    status === 'completed' && 'text-primary',
                    status === 'active' && 'text-foreground font-semibold',
                    status === 'upcoming' && 'text-muted-foreground'
                  )}
                >
                  {step.label}
                </span>
              </div>

              {!isLast && (
                <div
                  className={cn(
                    'mx-3 mb-5 h-0.5 flex-1 rounded-full transition-all duration-500',
                    lineCompleted ? 'bg-primary' : 'bg-muted-foreground/20'
                  )}
                />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default CheckoutStepper

// Third-party Imports
import { CheckIcon } from 'lucide-react'

// Utils Imports
import { cn } from '@/lib/utils'

export type StepperStep = {
  id: string
  label: string
}

type StepperProps = {
  steps: StepperStep[]
  /** id of the step currently in progress */
  currentStep: string
  className?: string
}

type StepStatus = 'completed' | 'active' | 'upcoming'

/**
 * Generic progress stepper.
 *
 * Adapted from the template's checkout stepper, which hard-coded its three
 * steps. DealTrip drives it from data because the same component labels the
 * approval flow and the negotiation phases.
 */
const Stepper = ({ steps, currentStep, className }: StepperProps) => {
  const currentIndex = steps.findIndex(step => step.id === currentStep)

  const statusOf = (index: number): StepStatus =>
    index === currentIndex ? 'active' : index < currentIndex ? 'completed' : 'upcoming'

  return (
    <div className={cn('flex items-center justify-center px-4', className)}>
      <div className='flex w-full items-center'>
        {steps.map((step, index) => {
          const status = statusOf(index)
          const isLast = index === steps.length - 1

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
                    <span>{index + 1}</span>
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
                    status === 'completed' ? 'bg-primary' : 'bg-muted-foreground/20'
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

export default Stepper

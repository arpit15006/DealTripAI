'use client'

// Type Imports
import type { SavedPaymentMethod } from '@/types/packages/checkout-types'

// Component Imports
import { Button } from '@/components/ui/button'
import EditCardDialog from '@/components/payment/edit-card-dialog'

// Utils Imports
import { cn } from '@/lib/utils'

type SavedCardItemProps = {
  paymentMethod: SavedPaymentMethod
  isSelected?: boolean
  onToggle?: () => void
  onDelete: () => void
}

const SavedCardItem = ({ paymentMethod, isSelected = false, onToggle, onDelete }: SavedCardItemProps) => {
  const isSelectable = Boolean(onToggle)

  return (
    <div
      role={isSelectable ? 'radio' : undefined}
      aria-checked={isSelectable ? isSelected : undefined}
      aria-label={paymentMethod.name}
      aria-describedby={`${paymentMethod.id}-description`}
      tabIndex={isSelectable ? 0 : undefined}
      onClick={onToggle}
      onKeyDown={e => {
        if (isSelectable && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault()
          onToggle?.()
        }
      }}
      className={cn(
        'border-input relative flex w-full flex-col gap-3 rounded-xl border p-4 transition-colors outline-none',
        isSelectable && 'cursor-pointer',
        isSelected ? 'border-primary bg-primary/5 ring-primary/20 ring-1' : 'hover:bg-muted/50'
      )}
    >
      <div className='flex gap-3'>
        {isSelectable && (
          <span
            aria-hidden='true'
            className={cn(
              'mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border',
              isSelected ? 'border-primary bg-primary' : 'border-input'
            )}
          >
            {isSelected && <span className='bg-primary-foreground size-2 rounded-full' />}
          </span>
        )}
        <div className='grid grow gap-1'>
          <p className='text-base leading-6 font-semibold'>{paymentMethod.name}</p>
          <p id={`${paymentMethod.id}-description`} className='text-muted-foreground text-sm'>
            Expiry {paymentMethod.expiry}
          </p>
        </div>
      </div>
      <div className={cn('flex items-center justify-between', isSelectable && 'ml-8')}>
        <div className='text-muted-foreground flex items-center gap-2 text-sm'>
          <Button
            type='button'
            variant='link'
            className='text-muted-foreground h-auto p-0 text-sm'
            onClick={e => {
              e.stopPropagation()
              onDelete()
            }}
          >
            Delete
          </Button>
          <span className='text-muted-foreground'>|</span>
          <EditCardDialog paymentMethod={paymentMethod} />
        </div>
        <div className='h-6 w-auto'>
          <img src={paymentMethod.logo} alt={paymentMethod.alt} className='h-full w-auto object-contain' />
        </div>
      </div>
    </div>
  )
}

export default SavedCardItem

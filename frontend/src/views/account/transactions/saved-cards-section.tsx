'use client'

// Third-party Imports
import { CreditCardIcon } from 'lucide-react'

// Component Imports
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import SavedCardItem from '@/components/payment/saved-card-item'
import AddCardDialog from '@/views/account/transactions/add-card-dialog'

// Store Imports
import { usePaymentMethodsStore } from '@/store/use-payment-methods-store'

const SavedCardsSection = () => {
  const cards = usePaymentMethodsStore(state => state.items)
  const removeCard = usePaymentMethodsStore(state => state.removeCard)

  return (
    <div className='flex flex-col gap-4'>
      <div className='flex items-center justify-between'>
        <h2 className='text-base font-semibold'>Saved Cards</h2>
        <AddCardDialog />
      </div>

      {cards.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant='icon'>
              <CreditCardIcon />
            </EmptyMedia>
            <EmptyTitle>No saved cards</EmptyTitle>
            <EmptyDescription>Add a card to speed up checkout next time.</EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <AddCardDialog />
          </EmptyContent>
        </Empty>
      ) : (
        <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
          {cards.map(card => (
            <SavedCardItem key={card.id} paymentMethod={card} onDelete={() => removeCard(card.id)} />
          ))}
        </div>
      )}
    </div>
  )
}

export default SavedCardsSection

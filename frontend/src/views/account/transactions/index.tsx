// Component Imports
import { Separator } from '@/components/ui/separator'
import SavedCardsSection from '@/views/account/transactions/saved-cards-section'
import TransactionHistorySection from '@/views/account/transactions/transaction-history-section'

const TransactionsView = () => {
  return (
    <div className='flex flex-col gap-6'>
      <div>
        <h1 className='text-2xl font-bold'>Transaction & Cards</h1>
        <p className='text-muted-foreground text-sm'>Manage your saved payment methods and view past transactions</p>
      </div>

      <SavedCardsSection />
      <Separator />
      <TransactionHistorySection />
    </div>
  )
}

export default TransactionsView

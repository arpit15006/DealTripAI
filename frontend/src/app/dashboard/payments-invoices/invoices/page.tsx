// Next Imports
import { redirect } from 'next/navigation'

// The standalone Invoices list has been folded into Transactions (which now surfaces every
// invoice-related row action), so this route just forwards there.
const InvoicesPage = () => {
  redirect('/dashboard/payments-invoices/transactions')
}

export default InvoicesPage

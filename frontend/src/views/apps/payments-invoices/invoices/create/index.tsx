// Component Imports
import InvoiceCreateForm from '@/views/apps/payments-invoices/invoices/create/invoice-create-form'

const InvoiceCreateView = () => {
  return (
    <div className='flex flex-col gap-6'>
      <div>
        <h1 className='text-2xl font-semibold'>Create Invoice</h1>
        <p className='text-muted-foreground text-sm'>Generate an invoice from an existing booking transaction.</p>
      </div>

      <InvoiceCreateForm />
    </div>
  )
}

export default InvoiceCreateView

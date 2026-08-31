// Component Imports
import InvoiceDetailsView from '@/views/apps/payments-invoices/invoices/[id]'

type InvoiceDetailsPageProps = {
  params: Promise<{ id: string }>
}

const InvoiceDetailsPage = async ({ params }: InvoiceDetailsPageProps) => {
  const { id } = await params

  return <InvoiceDetailsView id={id} />
}

export default InvoiceDetailsPage

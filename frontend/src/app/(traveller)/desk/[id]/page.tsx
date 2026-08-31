// Component Imports
import DealDesk from '@/views/dealtrip/desk'

export const metadata = { title: 'Live Deal Desk — DealTrip' }

const DeskPage = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params

  return <DealDesk negotiationId={id} />
}

export default DeskPage

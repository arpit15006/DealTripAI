// Next Imports
import { notFound } from 'next/navigation'

// Component Imports
import DealComparison from '@/views/dealtrip/compare'

// Lib Imports
import { loadNegotiationState } from '@/lib/dealtrip/negotiation-state'

export const metadata = { title: 'Compare deals · DealTrip' }
export const dynamic = 'force-dynamic'

const DealPage = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params
  const state = await loadNegotiationState(id)

  if (!state) notFound()

  return <DealComparison negotiationId={id} initialState={state} />
}

export default DealPage

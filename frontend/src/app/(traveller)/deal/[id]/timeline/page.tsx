// Next Imports
import { notFound } from 'next/navigation'

// Component Imports
import TrustTimeline from '@/views/dealtrip/timeline'

// Lib Imports
import { loadNegotiationState } from '@/lib/dealtrip/negotiation-state'

export const metadata = { title: 'Trust Timeline — DealTrip' }
export const dynamic = 'force-dynamic'

const TimelinePage = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params
  const state = await loadNegotiationState(id)

  if (!state) notFound()

  return <TrustTimeline state={state} negotiationId={id} />
}

export default TimelinePage

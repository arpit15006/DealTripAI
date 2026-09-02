// Next Imports
import { notFound } from 'next/navigation'

// Component Imports
import NegotiationReplay from '@/views/dealtrip/replay'

// Lib Imports
import { loadNegotiationState } from '@/lib/dealtrip/negotiation-state'

export const metadata = { title: 'Negotiation replay · DealTrip' }
export const dynamic = 'force-dynamic'

const ReplayPage = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params
  const state = await loadNegotiationState(id)

  if (!state) notFound()

  return <NegotiationReplay state={state} negotiationId={id} />
}

export default ReplayPage

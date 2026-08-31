// Next Imports
import { notFound } from 'next/navigation'

// Component Imports
import Checkout from '@/views/dealtrip/checkout'

// Lib Imports
import { loadNegotiationState } from '@/lib/dealtrip/negotiation-state'

export const metadata = { title: 'Approve and pay — DealTrip' }
export const dynamic = 'force-dynamic'

const CheckoutPage = async ({
  params,
  searchParams
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ offer?: string }>
}) => {
  const [{ id }, { offer }] = await Promise.all([params, searchParams])
  const state = await loadNegotiationState(id)

  if (!state) notFound()

  // Default to the recommended offer when the link carries no explicit one.
  const offerId = offer ?? state.ranked.find(r => r.score.eligible)?.offer.id ?? ''

  return <Checkout state={state} negotiationId={id} offerId={offerId} />
}

export default CheckoutPage

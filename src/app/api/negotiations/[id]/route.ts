import { loadNegotiationState } from '@/lib/dealtrip/negotiation-state'
import { fail, json } from '@/lib/dealtrip/service'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * Full state of a negotiation: intent, every offer with its guard verdict,
 * the ranking, the audit trail and any payments.
 *
 * Ranking is recomputed from stored offers rather than cached, so what the
 * comparison screen shows is always derived from the same scorer the
 * orchestrator used.
 */
export const GET = async (_request: Request, { params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params
  const state = await loadNegotiationState(id)

  return state ? json(state) : fail(404, 'Negotiation not found.')
}

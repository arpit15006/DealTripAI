import { agentJson, CORS } from '@/lib/dealtrip/service'
import { ATTRIBUTES, ATTRIBUTE_LABELS } from '@/lib/dealtrip/types'

export const runtime = 'nodejs'

/**
 * The closed attribute vocabulary, published so an external agent can express
 * requirements in terms this marketplace can actually match on.
 */
export const GET = (request: Request) =>
  agentJson({
    protocol: 'dealtrip.agent-commerce/0.1',
    note: 'Buyer requirements and merchant capabilities are drawn from this list only. Matching is a set operation, not a similarity score, so a term outside this list cannot be satisfied and will be rejected rather than approximated.',
    strengths: ['required', 'preferred', 'avoid'],
    attributes: ATTRIBUTES.map(id => ({ id, label: ATTRIBUTE_LABELS[id] }))
  }, undefined, request)

export const OPTIONS = () => new Response(null, { status: 204, headers: CORS })

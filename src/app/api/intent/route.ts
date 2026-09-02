import { extractIntent } from '@/lib/dealtrip/intent'
import { allMerchants, fail, json } from '@/lib/dealtrip/service'
import { IntentExtractionSchema } from '@/lib/dealtrip/types'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 30

/** Natural language in, a structured intent out for the traveller to confirm. */
export const POST = async (request: Request) => {
  const body = (await request.json().catch(() => null)) as { request?: string } | null
  const raw = body?.request?.trim()

  if (!raw) return fail(400, 'Provide a "request" string describing the trip.')
  if (raw.length > 2000) return fail(400, 'Request is too long. Keep it under 2000 characters.')

  const merchants = await allMerchants()
  const destinations = [...new Set(merchants.map(m => m.destination))]

  const result = await extractIntent(raw, destinations)
  const parsed = IntentExtractionSchema.safeParse(result.data)

  if (!parsed.success) return fail(502, 'Could not produce a valid travel intent.')

  const { ambiguities, restatement, ...intent } = parsed.data

  return json({
    intent,
    ambiguities,
    restatement,
    known_destinations: destinations,
    extraction: {
      source: result.source,
      model: result.model,
      latency_ms: result.latency_ms,
      note:
        result.source === 'fallback'
          ? 'Parsed by the deterministic fallback parser, the language model was unavailable or returned invalid output.'
          : null
    }
  })
}

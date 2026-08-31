import { draftToMerchant, onboardMerchant, toAgentCommerceProfile } from '@/lib/dealtrip/profile'
import { baseUrlFrom, fail, json } from '@/lib/dealtrip/service'
import { getStore } from '@/lib/dealtrip/store'
import { MerchantPolicySchema } from '@/lib/dealtrip/types'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 60

/**
 * Onboarding: a merchant pastes what it has — a rate card, a website blurb, a
 * list of rooms — and gets back an Agent Commerce Profile it can transact on.
 *
 * The result is returned for review, and only persisted when `save` is set.
 * A generated catalog is a draft, not a fact about someone's business.
 */
export const POST = async (request: Request) => {
  const body = (await request.json().catch(() => null)) as
    | { text?: string; save?: boolean; policy?: unknown }
    | null

  const text = body?.text?.trim()

  if (!text) return fail(400, 'Paste a description of the property, its rooms and its extras.')
  if (text.length < 40) return fail(400, 'That is too short to build a catalog from — give it a few sentences.')

  const result = await onboardMerchant(text)

  const policyOverrides = body?.policy
    ? MerchantPolicySchema.partial().safeParse(body.policy).data
    : undefined

  let merchant

  try {
    merchant = draftToMerchant(result.data, policyOverrides)
  } catch (error) {
    return fail(422, 'The generated catalog did not validate.', {
      detail: error instanceof Error ? error.message : String(error)
    })
  }

  if (body?.save) {
    const store = await getStore()

    await store.upsertMerchant(merchant)
  }

  const base = baseUrlFrom(request)

  return json({
    merchant,
    saved: Boolean(body?.save),
    profile: toAgentCommerceProfile(merchant, base),
    profile_url: `${base}/api/agent/${merchant.slug}/profile`,
    extraction: {
      source: result.source,
      model: result.model,
      latency_ms: result.latency_ms,
      note:
        result.source === 'fallback'
          ? 'Built by the deterministic fallback — review every field before publishing.'
          : 'Generated from your text. Review prices and inclusions before publishing.'
    }
  })
}

import { toAgentCommerceProfile } from '@/lib/dealtrip/profile'
import { allMerchants, baseUrlFrom, fail, json } from '@/lib/dealtrip/service'
import { getStore } from '@/lib/dealtrip/store'
import { MerchantSchema } from '@/lib/dealtrip/types'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export const GET = async (request: Request) => {
  const merchants = await allMerchants()
  const base = baseUrlFrom(request)

  return json({
    merchants: merchants.map(m => ({
      ...m,
      profile_url: `${base}/api/agent/${m.slug}/profile`,

      // The public view of what this merchant will negotiate over, the same
      // thing an external agent sees, so the portal never shows the merchant a
      // rosier picture than its buyers get.
      published: toAgentCommerceProfile(m, base).negotiation
    }))
  })
}

/** Create or replace a merchant (used by onboarding and the Policy Studio). */
export const POST = async (request: Request) => {
  const parsed = MerchantSchema.safeParse(await request.json().catch(() => null))

  if (!parsed.success)
    return fail(400, 'Invalid merchant.', {
      issues: parsed.error.issues.map(i => `${i.path.join('.')}: ${i.message}`)
    })

  const store = await getStore()

  await store.upsertMerchant(parsed.data)

  return json({ merchant: parsed.data, profile_url: `${baseUrlFrom(request)}/api/agent/${parsed.data.slug}/profile` }, { status: 201 })
}

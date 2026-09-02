import { allMerchants, fail, json } from '@/lib/dealtrip/service'
import { getStore } from '@/lib/dealtrip/store'
import { MerchantPolicySchema, MerchantSchema } from '@/lib/dealtrip/types'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export const GET = async (_r: Request, { params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params
  const merchant = (await allMerchants()).find(m => m.id === id || m.slug === id)

  return merchant ? json({ merchant }) : fail(404, 'Merchant not found.')
}

/**
 * Policy Studio updates. Accepts either a whole merchant or just a policy patch;
 * either way the result is validated before it is stored, because these numbers
 * are what the Commerce Guard will enforce.
 */
export const PATCH = async (request: Request, { params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params
  const store = await getStore()
  const existing = (await allMerchants()).find(m => m.id === id || m.slug === id)

  if (!existing) return fail(404, 'Merchant not found.')

  const body = (await request.json().catch(() => null)) as { policy?: unknown; merchant?: unknown } | null

  if (body?.merchant) {
    const parsed = MerchantSchema.safeParse(body.merchant)

    if (!parsed.success)
      return fail(400, 'Invalid merchant.', { issues: parsed.error.issues.map(i => `${i.path.join('.')}: ${i.message}`) })

    await store.upsertMerchant(parsed.data)

    return json({ merchant: parsed.data })
  }

  const parsedPolicy = MerchantPolicySchema.safeParse({ ...existing.policy, ...(body?.policy as object) })

  if (!parsedPolicy.success)
    return fail(400, 'Invalid policy.', { issues: parsedPolicy.error.issues.map(i => `${i.path.join('.')}: ${i.message}`) })

  const updated = { ...existing, policy: parsedPolicy.data }

  await store.upsertMerchant(updated)

  return json({ merchant: updated })
}

export const DELETE = async (_r: Request, { params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params
  const store = await getStore()
  const merchant = (await allMerchants()).find(m => m.id === id || m.slug === id)

  if (!merchant) return fail(404, 'Merchant not found.')

  await store.deleteMerchant(merchant.id)

  return json({ deleted: merchant.id })
}

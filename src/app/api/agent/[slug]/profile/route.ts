import { toAgentCommerceProfile } from '@/lib/dealtrip/profile'
import { agentJson, allMerchants, baseUrlFrom, CORS } from '@/lib/dealtrip/service'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/** A merchant's machine-readable storefront. */
export const GET = async (request: Request, { params }: { params: Promise<{ slug: string }> }) => {
  const { slug } = await params
  const merchant = (await allMerchants()).find(m => m.slug === slug || m.id === slug)

  if (!merchant) return agentJson({ error: 'Unknown merchant.' }, { status: 404 }, request)

  return agentJson(toAgentCommerceProfile(merchant, baseUrlFrom(request)), undefined, request)
}

export const OPTIONS = () => new Response(null, { status: 204, headers: CORS })

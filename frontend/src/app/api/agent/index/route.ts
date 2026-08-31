import { wellKnownIndex } from '@/lib/dealtrip/profile'
import { agentJson, allMerchants, baseUrlFrom, CORS } from '@/lib/dealtrip/service'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/** Served at /.well-known/agent-commerce.json (see the rewrite in next.config.ts). */
export const GET = async (request: Request) =>
  agentJson(wellKnownIndex(await allMerchants(), baseUrlFrom(request)), undefined, request)

export const OPTIONS = () => new Response(null, { status: 204, headers: CORS })

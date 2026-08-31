import { guardOffer } from '@/lib/dealtrip/commerce-guard'
import { explainWinner, priceBandOf, rankOffers, scoreOffer } from '@/lib/dealtrip/scoring'
import { allMerchants, fail, json } from '@/lib/dealtrip/service'
import { getStore } from '@/lib/dealtrip/store'

import type { Offer, RankedOffer } from '@/lib/dealtrip/types'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * Full state of a negotiation: intent, every offer with its guard verdict,
 * the ranking, the audit trail and any payments.
 *
 * Ranking is recomputed from stored offers rather than cached, so what the
 * comparison screen shows is always derived from the same scorer the
 * orchestrator used — there is no second, drifting copy of the truth.
 */
export const GET = async (_request: Request, { params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params
  const store = await getStore()
  const negotiation = await store.getNegotiation(id)

  if (!negotiation) return fail(404, 'Negotiation not found.')

  const [offers, audit, verdicts, payments, merchants] = await Promise.all([
    store.listOffers(id),
    store.listAudit(id),
    store.listVerdicts(id),
    store.listPayments(id),
    allMerchants()
  ])

  const byMerchant = new Map(merchants.map(m => [m.id, m]))

  /*
   * The offer each merchant currently has on the table.
   *
   * The orchestrator marks an offer 'superseded' the moment it stops being the
   * one it holds — whether that is because a better revision arrived, or because
   * a revision was declined for being worse. So "not superseded" is exactly the
   * live offer, and there is at most one per merchant.
   */
  const current = new Map<string, Offer>()

  for (const offer of offers) {
    if (offer.status === 'superseded') continue

    const existing = current.get(offer.merchant_id)

    if (!existing || offer.created_at > existing.created_at) current.set(offer.merchant_id, offer)
  }

  // A merchant whose every offer was superseded still deserves a row, so the
  // comparison screen can show what it proposed and why it lost.
  for (const offer of offers) {
    if (!current.has(offer.merchant_id)) current.set(offer.merchant_id, offer)
  }

  const openingOf = (merchantId: string) =>
    offers.filter(o => o.merchant_id === merchantId).sort((a, b) => a.round - b.round)[0] ?? null

  const verdictFor = (offerId: string) =>
    verdicts.find(v => v.offer_id === offerId && v.stage === 'authorization')?.verdict ?? null

  const candidates = [...current.values()]
    .map(offer => {
      const merchant = byMerchant.get(offer.merchant_id)

      if (!merchant) return null

      const verdict =
        verdictFor(offer.id) ??
        guardOffer({ merchant, offer, intent: negotiation.intent, rounds_used: offer.round })

      return { merchant, offer, verdict }
    })
    .filter((x): x is NonNullable<typeof x> => x !== null)

  const band = priceBandOf(
    candidates.filter(c => c.verdict.authorized).map(c => c.offer.quote.total_price)
  )

  const ranked: RankedOffer[] = rankOffers(
    candidates.map(c => {
      const opening = openingOf(c.merchant.id)

      return {
        offer: c.offer,
        merchant: {
          id: c.merchant.id,
          name: c.merchant.name,
          slug: c.merchant.slug,
          rating: c.merchant.rating,
          tagline: c.merchant.tagline
        },
        verdict: c.verdict,
        score: scoreOffer({
          merchant: c.merchant,
          offer: c.offer,
          intent: negotiation.intent,
          opening_offer: opening && opening.id !== c.offer.id ? opening : null,
          verdict: c.verdict,
          price_band: band
        })
      }
    })
  )

  return json({
    negotiation,
    ranked,
    explanation: explainWinner(ranked),
    offers,
    audit,
    payments,
    merchants: merchants.map(m => ({
      id: m.id,
      name: m.name,
      slug: m.slug,
      tagline: m.tagline,
      rating: m.rating,
      destination: m.destination
    }))
  })
}

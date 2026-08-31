/**
 * Assembles the full view of a negotiation: intent, live offers, guard
 * verdicts, ranking, audit trail and payments.
 *
 * Shared by the REST route and by the server components that render the deal
 * screens, so there is exactly one place that decides which offer is "current"
 * and how the shortlist is ranked. Two copies of that logic would eventually
 * disagree, and the screen that disagreed would be the one the traveller reads.
 */
import { guardOffer } from './commerce-guard'
import { explainWinner, priceBandOf, rankOffers, scoreOffer } from './scoring'
import { allMerchants } from './service'
import { getStore } from './store'

import type { PaymentRecord } from './store'
import type { AuditEvent, Merchant, Negotiation, Offer, RankedOffer } from './types'

export interface NegotiationView {
  negotiation: Negotiation
  ranked: RankedOffer[]
  explanation: string
  offers: Offer[]
  audit: AuditEvent[]
  payments: PaymentRecord[]
  merchants: Pick<Merchant, 'id' | 'name' | 'slug' | 'tagline' | 'rating' | 'destination'>[]
}

export const loadNegotiationState = async (id: string): Promise<NegotiationView | null> => {
  const store = await getStore()
  const negotiation = await store.getNegotiation(id)

  if (!negotiation) return null

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
   * one it holds — whether a better revision arrived, or a revision was
   * declined for being worse. So "not superseded" is exactly the live offer.
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

  const band = priceBandOf(candidates.filter(c => c.verdict.authorized).map(c => c.offer.quote.total_price))

  const ranked = rankOffers(
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

  return {
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
  }
}

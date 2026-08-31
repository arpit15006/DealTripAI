/**
 * The buyer-side Deal Orchestrator.
 *
 * Not a chatbot and not a persona — a control loop that represents the
 * traveller's constraints. It discovers eligible merchants, evaluates what comes
 * back, decides where a counter is worth making, and stops.
 *
 * It has no authority over money. It cannot set a price, edit a merchant's
 * offer, waive a merchant policy or authorize a payment. Its leverage is
 * exactly the leverage a real buyer has: it can say what it needs, say what it
 * will trade away, tell a merchant what it has to beat, and walk away.
 */
import { guardOffer } from './commerce-guard'
import { diffBundles, materializeOffer, openingOffer, reviseOffer } from './merchant-agent'
import { CatalogError, formatINR } from './pricing'
import { explainWinner, priceBandOf, rankOffers, scoreOffer } from './scoring'
import { ATTRIBUTE_LABELS } from './types'

import type { DealTripStore } from './store'
import type {
  Attribute,
  AuditEvent,
  CounterRequest,
  GuardVerdict,
  Merchant,
  Negotiation,
  NegotiationStatus,
  Offer,
  RankedOffer,
  TravelIntent
} from './types'

/* ------------------------------------------------------------------ *
 * Events streamed to the Live Deal Desk
 * ------------------------------------------------------------------ */
export type DeskEvent =
  | { type: 'status'; status: NegotiationStatus }
  | { type: 'audit'; event: AuditEvent }
  | { type: 'merchants'; merchants: { id: string; name: string; tagline: string; rating: number }[] }
  | { type: 'offer'; offer: Offer; verdict: GuardVerdict; merchant_name: string }
  | { type: 'counter'; merchant_id: string; merchant_name: string; counter: CounterRequest; round: number }
  | { type: 'withdrawn'; merchant_id: string; merchant_name: string; reason: string }
  | { type: 'ranked'; ranked: RankedOffer[]; explanation: string }
  | { type: 'error'; message: string }

export type EventSink = (event: DeskEvent) => void | Promise<void>

/* ------------------------------------------------------------------ *
 * Policy of the desk itself
 * ------------------------------------------------------------------ */

/** How far below the price to beat the desk asks a merchant to come. */
const UNDERCUT_RATIO = 0.03
const MIN_UNDERCUT = 750
/** Don't bother countering an offer already within this of its own floor. */
const NEGOTIATION_HEADROOM = 1200

interface RunArgs {
  negotiation: Negotiation
  merchants: Merchant[]
  store: DealTripStore
  onEvent?: EventSink
  /** false runs the deterministic planner only — used by the simulator. */
  use_llm?: boolean
}

export interface NegotiationOutcome {
  ranked: RankedOffer[]
  explanation: string
  status: NegotiationStatus
  offers: Offer[]
}

export const runNegotiation = async ({
  negotiation,
  merchants,
  store,
  onEvent,
  use_llm = true
}: RunArgs): Promise<NegotiationOutcome> => {
  const { intent } = negotiation
  const nights = intent.duration_nights
  const travelers = intent.travelers

  const emit = async (event: DeskEvent) => {
    await onEvent?.(event)
  }

  const audit = async (
    e: Pick<AuditEvent, 'actor' | 'action' | 'summary' | 'decision'> &
      Partial<Pick<AuditEvent, 'merchant_id' | 'detail'>>
  ) => {
    const record = await store.appendAudit({
      id: `evt_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`,
      negotiation_id: negotiation.id,
      ts: new Date().toISOString(),
      actor: e.actor,
      merchant_id: e.merchant_id ?? null,
      action: e.action,
      summary: e.summary,
      decision: e.decision,
      detail: e.detail ?? {}
    })

    await emit({ type: 'audit', event: record })

    return record
  }

  const setStatus = async (status: NegotiationStatus) => {
    await store.updateNegotiation(negotiation.id, { status })
    await emit({ type: 'status', status })
  }

  /* ---------------------------------------------------------------- *
   * 1. Discovery
   * ---------------------------------------------------------------- */
  await setStatus('discovering')

  const eligible = merchants.filter(m => m.destination.toLowerCase() === intent.destination.toLowerCase())
  const skipped = merchants.length - eligible.length

  await audit({
    actor: 'orchestrator',
    action: 'discover_merchants',
    decision: 'info',
    summary: `${eligible.length} merchant${eligible.length === 1 ? '' : 's'} in ${intent.destination} contacted${skipped ? `; ${skipped} outside the destination skipped` : ''}.`,
    detail: {
      destination: intent.destination,
      contacted: eligible.map(m => m.name),
      skipped_out_of_area: skipped
    }
  })

  await emit({
    type: 'merchants',
    merchants: eligible.map(m => ({ id: m.id, name: m.name, tagline: m.tagline, rating: m.rating }))
  })

  if (eligible.length === 0) {
    await audit({
      actor: 'orchestrator',
      action: 'no_merchants',
      decision: 'fail',
      summary: `No merchant in this marketplace sells in ${intent.destination}.`
    })
    await setStatus('no_deal')

    return { ranked: [], explanation: `No merchant covers ${intent.destination}.`, status: 'no_deal', offers: [] }
  }

  /* ---------------------------------------------------------------- *
   * 2. Opening offers, in parallel
   * ---------------------------------------------------------------- */
  await setStatus('negotiating')

  const required = (Object.entries(intent.requirements) as [Attribute, string][])
    .filter(([, s]) => s === 'required')
    .map(([a]) => a)

  const preferredAttrs = (Object.entries(intent.requirements) as [Attribute, string][])
    .filter(([, s]) => s === 'preferred')
    .map(([a]) => a)

  /**
   * Per-merchant state. `offers` is the full history for the timeline;
   * `accepted` is the single offer currently on the table for that merchant.
   * They are not the same thing — see `supersedes` below.
   */
  const state = new Map<
    string,
    {
      merchant: Merchant
      offers: Offer[]
      accepted: Offer | null
      verdicts: Map<string, GuardVerdict>
      withdrawn: string | null
    }
  >()

  for (const m of eligible)
    state.set(m.id, { merchant: m, offers: [], accepted: null, verdicts: new Map(), withdrawn: null })

  const preferenceCount = (offer: Offer) =>
    preferredAttrs.filter(a => offer.quote.attributes.includes(a)).length

  /**
   * Does a new offer replace the one already on the table?
   *
   * Negotiation must be monotone from the traveller's side. Without this, a
   * merchant pressed to hit a lower target can come back cheaper but stripped of
   * something the traveller asked for, and the desk would silently accept the
   * downgrade purely because it arrived later. A round may improve the
   * traveller's position or leave it alone; it may never worsen it.
   */
  const supersedes = (next: Offer, nextOk: boolean, previous: Offer | null, previousOk: boolean) => {
    if (!previous) return true
    if (!previousOk) return true // anything is at least as good as unbuyable
    if (!nextOk) return false // never regress from a purchasable offer to a blocked one

    return (
      next.quote.total_price <= previous.quote.total_price &&
      preferenceCount(next) >= preferenceCount(previous)
    )
  }

  const runTurn = async (
    merchant: Merchant,
    round: number,
    turn: Awaited<ReturnType<typeof openingOffer>>
  ): Promise<{ offer: Offer; verdict: GuardVerdict } | null> => {
    const entry = state.get(merchant.id)!

    if (!turn.proposal.can_meet_request) {
      const reason = turn.proposal.withdrawal_reason ?? 'No package meets the request within policy.'

      entry.withdrawn = reason
      await audit({
        actor: 'merchant_agent',
        merchant_id: merchant.id,
        action: 'withdraw',
        decision: 'info',
        summary: `${merchant.name} withdrew: ${reason}`,
        detail: { round, reason, agent_source: turn.llm.source }
      })
      await emit({ type: 'withdrawn', merchant_id: merchant.id, merchant_name: merchant.name, reason })

      return null
    }

    let offer: Offer

    try {
      offer = materializeOffer({
        merchant,
        proposal: turn.proposal,
        negotiationId: negotiation.id,
        round,
        nights,
        travelers
      })
    } catch (error) {
      // An agent naming a room that does not exist is a catalog-integrity
      // failure, not a crash. Record it and move that merchant on.
      const message = error instanceof CatalogError ? error.message : String(error)

      await audit({
        actor: 'commerce_guard',
        merchant_id: merchant.id,
        action: 'catalog_integrity_failed',
        decision: 'fail',
        summary: `${merchant.name}'s agent referenced inventory that does not exist — proposal discarded.`,
        detail: { round, error: message, proposal: turn.proposal }
      })

      return null
    }

    await audit({
      actor: 'merchant_agent',
      merchant_id: merchant.id,
      action: round === 0 ? 'opening_offer' : 'revised_offer',
      decision: 'info',
      summary:
        round === 0
          ? `${merchant.name} opened at ${formatINR(offer.quote.total_price)}.`
          : `${merchant.name} revised to ${formatINR(offer.quote.total_price)}.`,
      detail: {
        round,
        offer_id: offer.id,
        bundle: offer.bundle,
        total_price: offer.quote.total_price,
        list_price: offer.quote.list_price,
        discount_pct: offer.quote.discount_pct,
        rationale: offer.rationale,
        changes: offer.changes_from_previous,
        agent_source: turn.llm.source,
        agent_model: turn.llm.model,
        agent_latency_ms: turn.llm.latency_ms,
        planner_would_have_chosen: turn.planner_choice
          ? { bundle: turn.planner_choice.bundle, total_price: turn.planner_choice.quote.total_price }
          : null
      }
    })

    /* ---- the guard rules on it ---- */
    const verdict = guardOffer({ merchant, offer, intent, rounds_used: round })

    offer.status = verdict.authorized ? 'authorized' : 'rejected'

    await store.saveOffer(offer)
    await store.saveVerdict({
      offer_id: offer.id,
      negotiation_id: negotiation.id,
      stage: 'authorization',
      verdict
    })

    entry.offers.push(offer)
    entry.verdicts.set(offer.id, verdict)

    const previous = entry.accepted
    const previousOk = previous ? (entry.verdicts.get(previous.id)?.authorized ?? false) : false
    const keep = supersedes(offer, verdict.authorized, previous, previousOk)

    if (keep) {
      if (previous) {
        previous.status = 'superseded'
        await store.setOfferStatus(previous.id, 'superseded')
      }

      entry.accepted = offer
    } else {
      offer.status = 'superseded'
      await store.setOfferStatus(offer.id, 'superseded')
    }

    await audit({
      actor: 'commerce_guard',
      merchant_id: merchant.id,
      action: verdict.authorized ? 'offer_authorized' : 'offer_rejected',
      decision: verdict.authorized ? 'pass' : 'fail',
      summary: verdict.authorized
        ? `Offer authorized — ${verdict.checks.filter(c => c.passed).length}/${verdict.checks.length} checks passed.`
        : `Offer blocked. ${verdict.violations.map(v => v.detail).join(' ')}`,
      detail: {
        offer_id: offer.id,
        authorized: verdict.authorized,
        checks: verdict.checks.map(c => ({ id: c.id, label: c.label, passed: c.passed, detail: c.detail })),
        violations: verdict.violations.map(v => v.id)
      }
    })

    if (!keep && previous) {
      await audit({
        actor: 'orchestrator',
        merchant_id: merchant.id,
        action: 'revision_declined',
        decision: 'info',
        summary: `Kept ${merchant.name}'s earlier ${formatINR(previous.quote.total_price)} offer — the revision was not better for the traveller.`,
        detail: {
          kept_offer_id: previous.id,
          discarded_offer_id: offer.id,
          kept_price: previous.quote.total_price,
          discarded_price: offer.quote.total_price,
          kept_preferences_met: preferenceCount(previous),
          discarded_preferences_met: preferenceCount(offer)
        }
      })
    }

    await emit({ type: 'offer', offer, verdict, merchant_name: merchant.name })

    return { offer, verdict }
  }

  await Promise.all(
    eligible.map(async merchant => {
      try {
        const turn = await openingOffer({ merchant, intent, nights, travelers, use_llm })

        await runTurn(merchant, 0, turn)
      } catch (error) {
        await audit({
          actor: 'system',
          merchant_id: merchant.id,
          action: 'agent_error',
          decision: 'fail',
          summary: `${merchant.name}'s agent failed to respond.`,
          detail: { error: error instanceof Error ? error.message : String(error) }
        })
      }
    })
  )

  /* ---------------------------------------------------------------- *
   * 3. Evaluate, then counter where it is worth countering
   * ---------------------------------------------------------------- */
  /** The offer a merchant currently has on the table, not merely its most recent. */
  const latestOf = (merchantId: string) => state.get(merchantId)?.accepted ?? null

  const isEligible = (offer: Offer) => {
    const verdict = state.get(offer.merchant_id)!.verdicts.get(offer.id)

    return Boolean(verdict?.authorized)
  }

  /**
   * Score and rank whatever is currently on the table. Called after every round
   * as well as at the end, because the desk needs to know who is actually
   * leading before it can tell anyone what to beat.
   */
  const buildRanking = (): RankedOffer[] => {
    const finalists = eligible
      .map(m => {
        const entry = state.get(m.id)!
        const offer = latestOf(m.id)

        if (!offer) return null

        const verdict = entry.verdicts.get(offer.id)

        if (!verdict) return null

        return { merchant: m, offer, verdict, opening: entry.offers[0] ?? null }
      })
      .filter((x): x is NonNullable<typeof x> => x !== null)

    // The price band is drawn from offers that are actually purchasable, so a
    // rejected or non-compliant offer cannot distort the budget scoring.
    const band = priceBandOf(
      finalists.filter(f => f.verdict.authorized).map(f => f.offer.quote.total_price)
    )

    return rankOffers(
      finalists.map(f => ({
        offer: f.offer,
        merchant: {
          id: f.merchant.id,
          name: f.merchant.name,
          slug: f.merchant.slug,
          rating: f.merchant.rating,
          tagline: f.merchant.tagline
        },
        verdict: f.verdict,
        score: scoreOffer({
          merchant: f.merchant,
          offer: f.offer,
          intent,
          opening_offer: f.opening && f.opening.id !== f.offer.id ? f.opening : null,
          verdict: f.verdict,
          price_band: band
        })
      }))
    )
  }

  const maxRounds = Math.max(...eligible.map(m => m.policy.max_counter_rounds), 0)

  for (let round = 1; round <= maxRounds; round++) {
    // Who is actually winning right now — by SCORE, not by price. Chasing the
    // cheapest offer on the table would have the desk demanding that a merchant
    // undercut a package the traveller likes less, which is not the same thing
    // as getting them a better deal.
    const leader = buildRanking().find(r => r.score.eligible) ?? null
    const priceToBeat = leader?.offer.quote.total_price ?? null

    const targets = eligible.filter(merchant => {
      const entry = state.get(merchant.id)!

      if (entry.withdrawn) return false
      if (round > merchant.policy.max_counter_rounds) return false

      const current = latestOf(merchant.id)

      if (!current) return false

      // Always push back on something that is not yet purchasable.
      if (!isEligible(current)) return true

      // Never push the merchant that is already winning.
      if (!leader || leader.offer.merchant_id === merchant.id) return false

      // Otherwise only push if there is realistic room to improve on the leader.
      return priceToBeat !== null && current.quote.total_price > priceToBeat + NEGOTIATION_HEADROOM
    })

    if (targets.length === 0) break

    await Promise.all(
      targets.map(async merchant => {
        const entry = state.get(merchant.id)!
        const current = latestOf(merchant.id)!
        const verdict = entry.verdicts.get(current.id) ?? null
        const wasRejected = verdict !== null && !verdict.authorized

        const counter = buildCounterRequest({
          intent,
          merchant,
          current,
          verdict,
          priceToBeat,
          required,
          preferred: preferredAttrs
        })

        await audit({
          actor: 'orchestrator',
          merchant_id: merchant.id,
          action: 'counter_request',
          decision: 'info',
          summary: `Countered ${merchant.name}: ${counter.message}`,
          detail: { round, counter }
        })

        await emit({
          type: 'counter',
          merchant_id: merchant.id,
          merchant_name: merchant.name,
          counter,
          round
        })

        try {
          const turn = await reviseOffer({
            merchant,
            intent,
            nights,
            travelers,
            counter,
            previous: current,
            rejection: wasRejected ? verdict : null,
            round,
            use_llm
          })

          // If the agent gave no explicit diff, derive one so the UI always
          // shows what actually changed rather than trusting the prose.
          if (turn.proposal.can_meet_request && turn.proposal.room_id && turn.proposal.changes_from_previous.length === 0) {
            turn.proposal.changes_from_previous = diffBundles(merchant, current.bundle, {
              room_id: turn.proposal.room_id,
              addon_ids: turn.proposal.addon_ids,
              discount_pct: turn.proposal.discount_pct
            })
          }

          await runTurn(merchant, round, turn)
        } catch (error) {
          await audit({
            actor: 'system',
            merchant_id: merchant.id,
            action: 'agent_error',
            decision: 'fail',
            summary: `${merchant.name}'s agent failed to revise.`,
            detail: { round, error: error instanceof Error ? error.message : String(error) }
          })
        }
      })
    )
  }

  /* ---------------------------------------------------------------- *
   * 4. Rank
   * ---------------------------------------------------------------- */
  await setStatus('ranked')

  const ranked = buildRanking()
  const explanation = explainWinner(ranked)
  const winner = ranked.find(r => r.score.eligible) ?? null

  await audit({
    actor: 'orchestrator',
    action: 'rank_offers',
    decision: winner ? 'pass' : 'fail',
    summary: winner
      ? `${winner.merchant.name} ranked #1 at ${formatINR(winner.offer.quote.total_price)} with a score of ${winner.score.total}.`
      : 'No offer cleared every hard constraint.',
    detail: {
      explanation,
      table: ranked.map(r => ({
        rank: r.rank,
        merchant: r.merchant.name,
        price: r.offer.quote.total_price,
        score: r.score.total,
        eligible: r.score.eligible,
        reason: r.score.ineligible_reason
      }))
    }
  })

  await emit({ type: 'ranked', ranked, explanation })

  const status: NegotiationStatus = winner ? 'awaiting_approval' : 'no_deal'

  await setStatus(status)

  if (!winner) {
    await audit({
      actor: 'orchestrator',
      action: 'no_deal',
      decision: 'fail',
      summary: 'Negotiation closed without a purchasable offer. Nothing was charged.',
      detail: {
        blocked: ranked.map(r => ({ merchant: r.merchant.name, reason: r.score.ineligible_reason }))
      }
    })
  }

  return {
    ranked,
    explanation,
    status,
    offers: ranked.map(r => r.offer)
  }
}

/* ------------------------------------------------------------------ *
 * Counter construction
 *
 * The desk states a target, what must survive, what it would like kept, and
 * what it will let the merchant change. It never proposes a price for the
 * merchant to accept — that would be the buyer setting the seller's price.
 * ------------------------------------------------------------------ */
const buildCounterRequest = ({
  intent,
  merchant,
  current,
  verdict,
  priceToBeat,
  required,
  preferred
}: {
  intent: TravelIntent
  merchant: Merchant
  current: Offer
  verdict: GuardVerdict | null
  priceToBeat: number | null
  required: Attribute[]
  preferred: Attribute[]
}): CounterRequest => {
  const budgetCap = intent.budget.max
  const substitutable = merchant.policy.substitutable_groups
  const overBudget = current.quote.total_price > budgetCap
  const blocked = verdict !== null && !verdict.authorized
  const missingRequired = required.filter(a => !current.quote.attributes.includes(a))

  /*
   * Two kinds of counter, and conflating them was actively harmful.
   *
   *   compliance  — this offer cannot be bought at all. The only thing being
   *                 asked for is a package that clears the traveller's hard
   *                 constraints. The target is the BUDGET.
   *   competitive — this offer is already purchasable but is not winning. Now,
   *                 and only now, does it make sense to name a rival's price.
   *
   * Sending a compliance case a competitive target tells a merchant whose
   * problem is "you are ₹9,000 over budget" to come back ₹15,000 lower than it
   * needed to — which either destroys the package or makes the merchant walk
   * away from a deal it could have won.
   */
  const needsCompliance = blocked || overBudget || missingRequired.length > 0

  const target = needsCompliance
    ? budgetCap
    : priceToBeat !== null && priceToBeat < budgetCap
      ? Math.max(1, priceToBeat - Math.max(MIN_UNDERCUT, Math.round(priceToBeat * UNDERCUT_RATIO)))
      : budgetCap

  let message: string

  if (missingRequired.length) {
    message = `This package misses ${missingRequired.map(a => ATTRIBUTE_LABELS[a].toLowerCase()).join(' and ')}, which is non-negotiable for this traveller. Anything without it cannot be booked at any price.`
  } else if (blocked) {
    message = `Your last proposal was blocked by policy validation, so it never reached the traveller. Come back with a package you can actually sell at or under ${formatINR(target)}.`
  } else if (overBudget) {
    message = `${formatINR(current.quote.total_price)} is over a hard ceiling of ${formatINR(budgetCap)}. Restructure the package rather than simply discounting — the traveller cares about what is included, not the headline rate.`
  } else {
    message = `You are in contention but not in front. ${formatINR(priceToBeat ?? budgetCap)} is currently the best compliant offer. Beat ${formatINR(target)} while keeping the must-haves and this booking is yours.`
  }

  return {
    type: 'COUNTER_REQUEST',
    max_price: Math.max(1, target),
    preserve: required,
    preferred,
    substitution_allowed: substitutable,
    message
  }
}

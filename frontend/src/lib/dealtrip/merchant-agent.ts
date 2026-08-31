/**
 * The merchant-side agent.
 *
 * It represents the MERCHANT, not the buyer. Its job is to win the booking on
 * the best terms it can while staying inside boundaries the merchant set, and
 * it is allowed to decline. A buyer-side system that only ever produced
 * agreeable counterparties would prove nothing.
 *
 * What it may decide: which room, which add-ons, how far to discount, and how
 * to explain the trade. What it may not decide: any rupee figure — those come
 * from `pricing.ts` — and whether its own proposal is permissible, which is the
 * Commerce Guard's call.
 *
 * The merchant's cost base never enters a prompt. The agent is told the
 * policy-derived floor for the packages it is considering, which is all it
 * needs to negotiate and strictly less than knowing the margin structure.
 */
import { z } from 'zod'

import { structured } from './llm'
import { enumerateCandidates, explainNoCandidate, planBundle } from './merchant-planner'
import { formatStay, weekdayName } from './dates'
import { CatalogError, computeQuote, formatINR, minimumAllowedPrice, nightlyRate } from './pricing'
import { ATTRIBUTE_LABELS } from './types'

import type { LlmResult } from './llm'
import type { PlanCandidate } from './merchant-planner'
import type { Attribute, Bundle, CounterRequest, GuardVerdict, Merchant, Offer, TravelIntent } from './types'

export const MerchantProposalSchema = z.object({
  /**
   * ISO check-in date. The agent picks from the dates the traveller said they
   * would accept — shifting a flexible traveller off a weekend is a concession
   * it can make without touching the headline rate.
   */
  check_in: z.string().nullable().default(null),

  /**
   * Nullable because an agent that is withdrawing has no room to name. Demanding
   * a room id from a merchant that just said "I cannot serve this request"
   * rejected the one answer we most wanted it to be able to give.
   */
  room_id: z.string().nullable().default(null),
  addon_ids: z.array(z.string()).default([]),
  discount_pct: z.number().min(0).max(100).default(0),
  rationale: z.string().min(1).max(400),
  changes_from_previous: z.array(z.string().max(160)).max(5).default([]),

  /** An honest "no" is a valid move. */
  can_meet_request: z.boolean(),
  withdrawal_reason: z.string().max(220).nullable().default(null)
})

export type MerchantProposal = z.infer<typeof MerchantProposalSchema>

export interface AgentTurn {
  proposal: MerchantProposal

  /** What the deterministic planner would have chosen — kept for comparison. */
  planner_choice: PlanCandidate | null
  llm: Omit<LlmResult<MerchantProposal>, 'data'>
}

/* ------------------------------------------------------------------ *
 * Prompt construction
 * ------------------------------------------------------------------ */

/** What each acceptable check-in date does to the room rate. */
const dateBrief = (merchant: Merchant, dates: string[], nights: number) => {
  if (dates.length <= 1) return `CHECK-IN: ${dates[0] ?? 'unspecified'} (the traveller is not flexible on dates).`

  const room = [...merchant.rooms].sort((a, b) => b.tier - a.tier)[0]

  const rows = dates
    .map(date => {
      const total = room
        ? Array.from({ length: nights }, (_, i) => {
            const night = new Date(Date.parse(`${date}T00:00:00Z`) + i * 86_400_000).toISOString().slice(0, 10)

            return nightlyRate(room, merchant.weekend_uplift_pct, night)
          }).reduce((a, b) => a + b, 0)
        : 0

      return `  ${date} (${weekdayName(date)} check-in) → ${formatINR(total)} for ${room?.name ?? 'a room'}`
    })
    .join('\n')

  return `CHECK-IN DATES THE TRAVELLER WILL ACCEPT — you choose one (check_in):
${rows}
Friday and Saturday nights carry a ${merchant.weekend_uplift_pct}% uplift. Moving a flexible
traveller onto weekdays costs you less than discounting and may still win the booking.`
}

const catalogBrief = (merchant: Merchant, nights: number, travelers: number) => {
  const rooms = merchant.rooms
    .map(
      r =>
        `  ${r.id} | ${r.name} | t${r.tier} | ${r.base_price_per_night * nights} for ${nights}n | sleeps ${r.max_occupancy} | ${r.inventory_available} left | ${r.attributes.join(',') || '-'}`
    )
    .join('\n')

  const addons = merchant.addons
    .map(
      a =>
        `  ${a.id} | ${a.name} | ${a.price * (a.per_night ? nights : 1) * (a.per_person ? travelers : 1)} total | grp:${a.group ?? '-'} | ${a.attributes.join(',') || '-'}`
    )
    .join('\n')

  // Terse on purpose. Every merchant agent carries this block, and the whole
  // marketplace negotiates inside one rate-limit budget — verbose prompts cost
  // wall-clock time that the traveller watches tick by.
  return `PROPERTY: ${merchant.name} — ${merchant.tagline}
${merchant.description}
Included with every room: ${merchant.attributes.join(', ') || '-'}
All figures are rupees for the WHOLE stay (${nights} nights, ${travelers} guests).

ROOMS — pick exactly one room_id:
id | name | tier | stay price | sleeps | units left | delivers
${rooms}

ADD-ONS — pick any number of addon_ids:
id | name | stay price | group | delivers
${addons}
Add-ons sharing a group are mutually exclusive: never select two from one group.`
}

const policyBrief = (merchant: Merchant) => {
  const p = merchant.policy

  return `YOUR COMMERCIAL BOUNDARIES (enforced by an external validator you do not control):
  - Maximum discount off list: ${p.max_discount_pct}%
  - You may revise your offer at most ${p.max_counter_rounds} time(s)
  - Substitutions allowed in: ${p.substitutable_groups.join(', ') || 'nothing'}
  - Must always be included: ${p.locked_addons.length ? p.locked_addons.join(', ') : 'nothing'}
  - Your objectives, in priority order: ${p.objectives.join(' > ')}

A validator recomputes every price from the catalog and rejects anything that
breaches these boundaries or the property's confidential margin floor. Proposing
something impermissible wastes one of your revisions — it does not get through.`
}

const intentBrief = (intent: TravelIntent, nights: number, travelers: number) => {
  const byStrength = (s: string) =>
    (Object.entries(intent.requirements) as [Attribute, string][])
      .filter(([, v]) => v === s)
      .map(([a]) => ATTRIBUTE_LABELS[a])

  return `THE TRAVELLER:
  - ${travelers} guest(s), ${nights} night(s) in ${intent.destination}
  - Budget: ${formatINR(intent.budget.max)} ${intent.budget.type === 'hard_constraint' ? '— a HARD limit they will not exceed' : '(a target, some flex)'}
  - Must have: ${byStrength('required').join(', ') || 'nothing specified'}
  - Would like: ${byStrength('preferred').join(', ') || 'nothing specified'}
  - Ruled out: ${byStrength('avoid').join(', ') || 'nothing'}
  - They optimise for: ${intent.priority.replace('_', ' ')}
  - Date flexibility: ${intent.date_flexibility_days} day(s)
${intent.notes ? `  - In their own words: "${intent.notes}"` : ''}`
}

const candidateBrief = (candidates: PlanCandidate[], merchant: Merchant) =>
  candidates.length === 0
    ? 'None of your packages can legally reach this target.'
    : candidates
        .slice(0, 3)
        .map((c, i) => {
          const room = merchant.rooms.find(r => r.id === c.bundle.room_id)

          const addons = c.bundle.addon_ids
            .map(id => merchant.addons.find(a => a.id === id)?.name ?? id)
            .join(' + ')

          return `  ${i + 1}. room_id=${c.bundle.room_id} addon_ids=[${c.bundle.addon_ids.join(',')}] → ${formatINR(c.quote.total_price)} at ${c.bundle.discount_pct}% off (${room?.name}${addons ? ' + ' + addons : ''}). Floor ${formatINR(c.floor)}, max discount ${c.max_discount_pct}%.`
        })
        .join('\n')

const SYSTEM_BASE = `You are the commercial agent for a hotel. You negotiate on the PROPERTY's behalf.

Return ONLY a JSON object:
{
  "room_id": string,
  "addon_ids": string[],
  "discount_pct": number,
  "rationale": string,                  // 1-2 sentences to the traveller, in the property's voice
  "changes_from_previous": string[],    // [] on an opening offer
  "can_meet_request": boolean,
  "withdrawal_reason": string | null    // required when can_meet_request is false
}

Hard rules:
- room_id and every addon_ids entry MUST be ids that appear in the catalog above. Never invent one.
- Never select two add-ons from the same group.
- Always include every add-on listed as must-always-be-included.
- You quote packages, not prices: a validator computes the money from your selection.
  discount_pct is the only number you set, and it must respect your ceiling.
- You are the seller. Protect the property's revenue — do not discount further than
  you need to, and prefer restructuring the package over cutting the headline rate.
- If nothing you can legally offer meets the request, set can_meet_request to false
  and say plainly why. Withdrawing honestly is better than proposing something that
  will be rejected.`

/* ------------------------------------------------------------------ *
 * Turns
 * ------------------------------------------------------------------ */

const fallbackFrom = (
  candidate: PlanCandidate | null,
  merchant: Merchant,
  reason: string,
  changes: string[] = []
): MerchantProposal =>
  candidate
    ? {
        check_in: candidate.bundle.check_in,
        room_id: candidate.bundle.room_id,
        addon_ids: candidate.bundle.addon_ids,
        discount_pct: candidate.bundle.discount_pct,
        rationale: describeCandidate(candidate, merchant),
        changes_from_previous: changes,
        can_meet_request: true,
        withdrawal_reason: null
      }
    : {
        check_in: null,
        room_id: merchant.rooms[0]?.id ?? '',
        addon_ids: [],
        discount_pct: 0,
        rationale: reason,
        changes_from_previous: changes,
        can_meet_request: false,
        withdrawal_reason: reason
      }

const describeCandidate = (candidate: PlanCandidate, merchant: Merchant) => {
  const room = merchant.rooms.find(r => r.id === candidate.bundle.room_id)

  const addons = candidate.bundle.addon_ids
    .map(id => merchant.addons.find(a => a.id === id)?.name ?? id)
    .filter(Boolean)

  return `${room?.name ?? 'Room'} for ${candidate.quote.nights} nights${addons.length ? ` with ${addons.join(', ').toLowerCase()}` : ''}, at ${formatINR(candidate.quote.total_price)}.`
}

export const openingOffer = async (args: {
  merchant: Merchant
  intent: TravelIntent
  nights: number
  travelers: number
  allowed_check_ins: string[]
  use_llm?: boolean
}): Promise<AgentTurn> => {
  const { merchant, intent, nights, travelers, allowed_check_ins, use_llm = true } = args

  const candidates = enumerateCandidates({
    merchant,
    intent,
    nights,
    travelers,
    allowed_check_ins,
    target_price: null
  })

  const plannerChoice = candidates[0] ?? null

  const result = await structured({
    label: `merchant.${merchant.slug}.opening`,
    schema: MerchantProposalSchema,
    system: `${SYSTEM_BASE}\n\nYour house voice: ${merchant.voice}`,
    user: `${catalogBrief(merchant, nights, travelers)}

${dateBrief(merchant, allowed_check_ins, nights)}

${policyBrief(merchant)}

${intentBrief(intent, nights, travelers)}

PACKAGES YOUR PRICING SYSTEM HAS ALREADY VERIFIED AS LEGAL (you may propose one of
these, or any other legal combination — these are shown so you know what is possible
and at what price):
${candidateBrief(candidates, merchant)}

Make your opening offer. This is your first impression: lead with what this property
does better than a generic booking site, and satisfy every must-have. You do not have
to fit their budget on the opening offer if your best package is genuinely worth more —
they can come back to you.

Do NOT decline because their budget looks tight. A price gap is what the negotiation is
for, and their deal desk will come back to you with a target. Set can_meet_request to
false ONLY if you cannot deliver one of their must-haves from any available room — that
is a capability you lack, not a price you disagree on.`,
    fallback: () =>
      fallbackFrom(
        plannerChoice,
        merchant,
        explainNoCandidate({ merchant, intent, nights, travelers, allowed_check_ins, target_price: null })
      ),
    temperature: 0.5,
    max_tokens: 700,
    enabled: use_llm
  })

  const { data, ...llm } = result

  return { proposal: data, planner_choice: plannerChoice, llm }
}

export const reviseOffer = async (args: {
  merchant: Merchant
  intent: TravelIntent
  nights: number
  travelers: number
  counter: CounterRequest
  previous: Offer

  /** Present when the previous attempt was blocked — the agent must react to it. */
  rejection: GuardVerdict | null
  round: number
  allowed_check_ins: string[]
  use_llm?: boolean
}): Promise<AgentTurn> => {
  const { merchant, intent, nights, travelers, counter, previous, rejection, round, allowed_check_ins, use_llm = true } = args

  const candidates = enumerateCandidates({
    merchant,
    intent,
    nights,
    travelers,
    allowed_check_ins,
    target_price: counter.max_price,
    preserve: counter.preserve,
    previous: previous.bundle,
    substitution_allowed: counter.substitution_allowed
  })

  const plannerChoice = candidates[0] ?? null
  const previousFloor = safeFloor(merchant, previous.bundle, nights, travelers)

  const rejectionBrief = rejection
    ? `\nYOUR PREVIOUS PROPOSAL WAS BLOCKED BY THE VALIDATOR:
${rejection.violations.map(v => `  ✗ ${v.label}: ${v.detail}`).join('\n')}
That revision is spent. Do not propose the same package again — change the package
itself, or withdraw honestly.\n`
    : ''

  const result = await structured({
    label: `merchant.${merchant.slug}.revise.r${round}`,
    schema: MerchantProposalSchema,
    system: `${SYSTEM_BASE}\n\nYour house voice: ${merchant.voice}`,
    user: `${catalogBrief(merchant, nights, travelers)}

${dateBrief(merchant, allowed_check_ins, nights)}

${policyBrief(merchant)}

${intentBrief(intent, nights, travelers)}

YOUR PREVIOUS OFFER (round ${previous.round}, checking in ${previous.bundle.check_in}):
  room_id=${previous.bundle.room_id}, addon_ids=[${previous.bundle.addon_ids.join(', ')}], discount ${previous.bundle.discount_pct}%
  Priced at ${formatINR(previous.quote.total_price)}.${previousFloor ? ` The lowest you may legally sell that exact package for is ${formatINR(previousFloor.floor)} (${previousFloor.binding} floor).` : ''}
${rejectionBrief}
THE BUYER'S DEAL DESK HAS COME BACK (round ${round}):
  Target price: at or under ${formatINR(counter.max_price)}
  Must survive the revision: ${counter.preserve.map(a => ATTRIBUTE_LABELS[a]).join(', ') || 'nothing specified'}
  Worth keeping if affordable: ${counter.preferred.map(a => ATTRIBUTE_LABELS[a]).join(', ') || 'nothing specified'}
  They will accept changes to: ${counter.substitution_allowed.join(', ') || 'nothing'}
  Their message: "${counter.message}"

PACKAGES YOUR PRICING SYSTEM HAS VERIFIED AS LEGAL AT THIS TARGET:
${candidateBrief(candidates, merchant)}

Revise your offer. Keep as much of the value as you can while landing at or under the
target — a substitution the traveller will barely notice beats a discount that costs
you margin. If the target is simply not reachable within your boundaries, set
can_meet_request to false and explain why in one sentence.`,
    fallback: () =>
      fallbackFrom(
        plannerChoice,
        merchant,
        explainNoCandidate({
          merchant,
          intent,
          nights,
          travelers,
          allowed_check_ins,
          target_price: counter.max_price,
          preserve: counter.preserve,
          previous: previous.bundle,
          substitution_allowed: counter.substitution_allowed
        }),
        plannerChoice ? diffBundles(merchant, previous.bundle, plannerChoice.bundle) : []
      ),
    temperature: 0.45,
    max_tokens: 700,
    enabled: use_llm
  })

  const { data, ...llm } = result

  return { proposal: data, planner_choice: plannerChoice, llm }
}

const safeFloor = (merchant: Merchant, bundle: Bundle, nights: number, travelers: number) => {
  try {
    return minimumAllowedPrice(merchant, bundle, nights, travelers)
  } catch {
    return null
  }
}

/** Human-readable diff between two packages, for the timeline and the UI. */
export const diffBundles = (merchant: Merchant, before: Bundle, after: Bundle): string[] => {
  const changes: string[] = []

  const nameOf = (id: string) =>
    merchant.rooms.find(r => r.id === id)?.name ?? merchant.addons.find(a => a.id === id)?.name ?? id

  if (before.room_id !== after.room_id) {
    const from = merchant.rooms.find(r => r.id === before.room_id)
    const to = merchant.rooms.find(r => r.id === after.room_id)
    const direction = (to?.tier ?? 0) < (from?.tier ?? 0) ? 'Moved down' : (to?.tier ?? 0) > (from?.tier ?? 0) ? 'Moved up' : 'Switched'

    changes.push(`${direction} from ${nameOf(before.room_id)} to ${nameOf(after.room_id)}`)
  }

  if (before.check_in !== after.check_in)
    changes.push(`Moved the stay to ${formatStay(after.check_in, 0) ? weekdayName(after.check_in) : ''} ${after.check_in}`.replace(/\s+/g, ' ').trim())

  const removed = before.addon_ids.filter(id => !after.addon_ids.includes(id))
  const added = after.addon_ids.filter(id => !before.addon_ids.includes(id))

  // Present a same-group remove+add as a substitution rather than two events.
  const groupOf = (id: string) => merchant.addons.find(a => a.id === id)?.group ?? null
  const paired = new Set<string>()

  for (const out of removed) {
    const replacement = added.find(id => groupOf(id) !== null && groupOf(id) === groupOf(out) && !paired.has(id))

    if (replacement) {
      paired.add(replacement)
      paired.add(out)
      changes.push(`Swapped ${nameOf(out).toLowerCase()} for ${nameOf(replacement).toLowerCase()}`)
    }
  }

  for (const out of removed) if (!paired.has(out)) changes.push(`Removed ${nameOf(out).toLowerCase()}`)
  for (const inc of added) if (!paired.has(inc)) changes.push(`Added ${nameOf(inc).toLowerCase()}`)

  if (before.discount_pct !== after.discount_pct)
    changes.push(
      after.discount_pct > before.discount_pct
        ? `Increased discount to ${after.discount_pct}%`
        : `Reduced discount to ${after.discount_pct}%`
    )

  return changes
}

/**
 * Turn an agent's proposal into a priced offer. Unknown ids surface here as a
 * thrown CatalogError, which the guard reports as a catalog-integrity failure
 * rather than a crash.
 */
export const materializeOffer = (args: {
  merchant: Merchant
  proposal: MerchantProposal
  negotiationId: string
  round: number
  nights: number
  travelers: number

  /** Used when the agent does not name a date of its own. */
  default_check_in: string
  now?: Date
}): Offer => {
  const { merchant, proposal, negotiationId, round, nights, travelers, now = new Date() } = args

  if (!proposal.room_id) throw new CatalogError('Proposal named no room.')

  const bundle: Bundle = {
    room_id: proposal.room_id,
    addon_ids: [...new Set(proposal.addon_ids)],
    discount_pct: proposal.discount_pct,
    check_in: proposal.check_in ?? args.default_check_in
  }

  const quote = computeQuote(merchant, bundle, nights, travelers)

  return {
    id: `off_${merchant.slug}_r${round}_${now.getTime().toString(36)}${Math.random().toString(36).slice(2, 6)}`,
    negotiation_id: negotiationId,
    merchant_id: merchant.id,
    round,
    bundle,
    quote,
    rationale: proposal.rationale,
    changes_from_previous: proposal.changes_from_previous,
    status: 'proposed',
    created_at: now.toISOString(),
    expires_at: new Date(now.getTime() + merchant.policy.offer_ttl_minutes * 60_000).toISOString()
  }
}

export { planBundle }

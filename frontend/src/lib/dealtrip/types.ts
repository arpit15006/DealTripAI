/**
 * DealTrip — core domain types.
 *
 * Design rule that everything else depends on:
 *   Every commercially meaningful value is drawn from a CLOSED vocabulary or
 *   computed by code. LLMs select from these enums; they never invent members
 *   of them, and they never emit money.
 */
import { z } from 'zod'

import { ATTRIBUTES } from './vocabulary'

import type { Actor, Attribute } from './vocabulary'

/* ------------------------------------------------------------------ *
 * Attribute vocabulary
 *
 * Both sides of the market speak this list and only this list. A traveller
 * requirement and a room/add-on capability are the same kind of token, so
 * "does this offer satisfy the requirement" is a set operation — not a
 * similarity score, not an LLM judgement.
 *
 * Defined in `vocabulary.ts` (dependency-free) and re-exported here so server
 * code can keep importing everything from one place.
 * ------------------------------------------------------------------ */
export { ATTRIBUTES, ATTRIBUTE_LABELS, ACTORS, ACTOR_LABELS } from './vocabulary'
export type { Attribute, Actor } from './vocabulary'

export const AttributeSchema = z.enum(ATTRIBUTES)

/* ------------------------------------------------------------------ *
 * Travel intent
 * ------------------------------------------------------------------ */
export const RequirementStrengthSchema = z.enum(['required', 'preferred', 'avoid'])
export type RequirementStrength = z.infer<typeof RequirementStrengthSchema>

export const BudgetSchema = z.object({
  max: z.number().int().positive(),
  currency: z.literal('INR'),
  /** hard = never breach. soft = may breach, penalised by the scorer. */
  type: z.enum(['hard_constraint', 'soft_target'])
})
export type Budget = z.infer<typeof BudgetSchema>

export const TravelIntentSchema = z.object({
  destination: z.string().min(2).max(60),
  travelers: z.number().int().min(1).max(20),
  duration_nights: z.number().int().min(1).max(30),
  budget: BudgetSchema,
  /**
   * Attribute -> how much the traveller cares. Closed vocabulary, and partial:
   * a traveller states a handful of things, not an opinion on all 24. (Zod 4's
   * plain `record` with an enum key is exhaustive and would demand every one.)
   */
  requirements: z.partialRecord(AttributeSchema, RequirementStrengthSchema),
  date_flexibility_days: z.number().int().min(0).max(14),
  /** ISO date, optional — absent means "merchant may propose". */
  check_in: z.string().nullable().default(null),
  /** What the traveller optimises for when trade-offs are unavoidable. */
  priority: z.enum(['lowest_price', 'best_value', 'best_experience']),
  // Defaulted rather than required: a model that has nothing to add here omits
  // the key, and losing a whole valid extraction over an absent free-text field
  // is not a trade worth making.
  notes: z.string().max(500).default('')
})
export type TravelIntent = z.infer<typeof TravelIntentSchema>

/** What the extraction model returns, before we normalise and confirm it. */
export const IntentExtractionSchema = TravelIntentSchema.extend({
  /** Anything the model could not resolve, surfaced to the user for editing. */
  ambiguities: z.array(z.string().max(200)).max(6).default([]),
  /** One line the user can sanity-check the parse against. */
  restatement: z.string().max(300)
})
export type IntentExtraction = z.infer<typeof IntentExtractionSchema>

/* ------------------------------------------------------------------ *
 * Merchant catalog + policy
 * ------------------------------------------------------------------ */
export const RoomSchema = z.object({
  id: z.string(),
  name: z.string(),
  /** Higher tier = better room. Used for deterministic downgrade search. */
  tier: z.number().int().min(1).max(5),
  base_price_per_night: z.number().int().nonnegative(),
  /** Merchant's true cost. Never leaves the server. Drives the margin floor. */
  cost_per_night: z.number().int().nonnegative(),
  max_occupancy: z.number().int().min(1),
  attributes: z.array(AttributeSchema),
  inventory_available: z.number().int().nonnegative(),
  /**
   * Room photograph, as a public path. Defaulted rather than required so a
   * merchant record written before images existed still parses — the UI falls
   * back to the property shot, and then to a plain panel.
   */
  image: z.string().default('')
})
export type Room = z.infer<typeof RoomSchema>

export const AddOnSchema = z.object({
  id: z.string(),
  name: z.string(),
  /** Price for the whole stay unless per_night is true. */
  price: z.number().int().nonnegative(),
  cost: z.number().int().nonnegative(),
  per_night: z.boolean(),
  per_person: z.boolean(),
  attributes: z.array(AttributeSchema),
  /** Add-ons in the same group are mutually exclusive (e.g. transfer tiers). */
  group: z.string().nullable()
})
export type AddOn = z.infer<typeof AddOnSchema>

export const ObjectiveSchema = z.enum([
  'maximize_revenue',
  'protect_margin',
  'maximize_occupancy',
  'move_unsold_inventory',
  'increase_package_value'
])
export type Objective = z.infer<typeof ObjectiveSchema>

export const MerchantPolicySchema = z.object({
  /** Hard ceiling on discount off list, in percent. */
  max_discount_pct: z.number().min(0).max(60),
  /** Hard floor on (revenue - cost) / revenue, in percent. */
  min_margin_pct: z.number().min(0).max(90),
  /** How many times the merchant agent may revise after its opening offer. */
  max_counter_rounds: z.number().int().min(0).max(5),
  /** May the agent swap room category / add-ons to hit a budget? */
  allow_substitutions: z.boolean(),
  /** Add-on groups the agent is allowed to downgrade or drop. */
  substitutable_groups: z.array(z.string()),
  /** Add-ons the agent may never remove once offered (brand promises). */
  locked_addons: z.array(z.string()),
  /** Ordered — first is the primary business goal. */
  objectives: z.array(ObjectiveSchema).min(1),
  /** Minutes an authorized offer stays purchasable. */
  offer_ttl_minutes: z.number().int().min(1).max(1440)
})
export type MerchantPolicy = z.infer<typeof MerchantPolicySchema>

export const MerchantSchema = z.object({
  id: z.string(),
  slug: z.string(),
  name: z.string(),
  destination: z.string(),
  tagline: z.string(),
  description: z.string(),
  rating: z.number().min(0).max(5),
  /** Hero photograph of the property, as a public path. */
  image: z.string().default(''),
  /** Property-level attributes, inherited by every room. */
  attributes: z.array(AttributeSchema),
  rooms: z.array(RoomSchema),
  addons: z.array(AddOnSchema),
  policy: MerchantPolicySchema,
  /**
   * Percent added to a room's nightly rate on Friday and Saturday nights.
   * Cost does not move with the day of week, so this is margin the merchant
   * gives up when it shifts a flexible traveller onto weekdays.
   */
  weekend_uplift_pct: z.number().min(0).max(100),
  /** Free-text house style the merchant agent writes in. */
  voice: z.string()
})
export type Merchant = z.infer<typeof MerchantSchema>

/* ------------------------------------------------------------------ *
 * Bundles and quotes
 *
 * A Bundle is what an agent is allowed to choose: which room, which add-ons,
 * and how hard to discount. A Quote is what CODE derives from a bundle.
 * The split is the whole reason an LLM cannot misprice anything.
 * ------------------------------------------------------------------ */
export const BundleSchema = z.object({
  room_id: z.string(),
  addon_ids: z.array(z.string()),
  /** The one number the agent may propose — and the guard checks it. */
  discount_pct: z.number().min(0).max(100),
  /**
   * ISO date of the first night. Part of the bundle rather than the intent
   * because which dates a merchant offers is a lever it can pull: a flexible
   * traveller is worth more on a weekday, and the agent gets to say so.
   */
  check_in: z.string()
})
export type Bundle = z.infer<typeof BundleSchema>

export interface QuoteLine {
  label: string
  kind: 'room' | 'addon'
  ref_id: string
  unit_price: number
  quantity: number
  amount: number
  cost: number
}

export interface Quote {
  check_in: string
  check_out: string
  /** Nights that fell on a Friday or Saturday and carried the uplift. */
  weekend_nights: number
  lines: QuoteLine[]
  list_price: number
  discount_pct: number
  discount_amount: number
  total_price: number
  total_cost: number
  margin_amount: number
  margin_pct: number
  attributes: Attribute[]
  nights: number
  travelers: number
}

/* ------------------------------------------------------------------ *
 * Offers
 * ------------------------------------------------------------------ */
export const OfferStatusSchema = z.enum([
  'proposed', // agent produced it, guard has not ruled yet
  'authorized', // guard passed it; purchasable until it expires
  'rejected', // guard blocked it
  'superseded', // a later round replaced it
  'expired',
  'purchased'
])
export type OfferStatus = z.infer<typeof OfferStatusSchema>

export interface Offer {
  id: string
  negotiation_id: string
  merchant_id: string
  round: number
  bundle: Bundle
  quote: Quote
  /** The agent's own words for why this package answers the intent. */
  rationale: string
  /** What changed versus the previous round, in the agent's words. */
  changes_from_previous: string[]
  status: OfferStatus
  created_at: string
  expires_at: string
}

/* ------------------------------------------------------------------ *
 * Structured negotiation messages
 *
 * Agents exchange these, not prose. Prose rides along in `message` for the UI
 * but is never load-bearing.
 * ------------------------------------------------------------------ */
export const CounterRequestSchema = z.object({
  type: z.literal('COUNTER_REQUEST'),
  max_price: z.number().int().positive(),
  /** Attributes that must survive the revision. */
  preserve: z.array(AttributeSchema),
  /** Attributes worth keeping if affordable. */
  preferred: z.array(AttributeSchema),
  /** Add-on groups / 'room_category' the orchestrator will accept changes to. */
  substitution_allowed: z.array(z.string()),
  message: z.string().max(400)
})
export type CounterRequest = z.infer<typeof CounterRequestSchema>

/* ------------------------------------------------------------------ *
 * Commerce Guard
 * ------------------------------------------------------------------ */
export type CheckId =
  | 'catalog_integrity'
  | 'inventory_available'
  | 'occupancy_fits'
  | 'price_integrity'
  | 'discount_ceiling'
  | 'margin_floor'
  | 'locked_addons_present'
  | 'round_limit'
  | 'offer_not_expired'
  | 'currency'
  | 'hard_budget'
  | 'hard_requirements'
  | 'check_in_window'

export interface GuardCheck {
  id: CheckId
  label: string
  passed: boolean
  detail: string
  expected?: string
  actual?: string
  /** advisory checks inform the score but do not block authorization */
  advisory: boolean
}

export interface GuardVerdict {
  authorized: boolean
  checks: GuardCheck[]
  violations: GuardCheck[]
  evaluated_at: string
}

/* ------------------------------------------------------------------ *
 * Scoring
 * ------------------------------------------------------------------ */
export interface ScoreComponent {
  id: 'budget_fit' | 'requirements' | 'preferences' | 'package_value' | 'negotiation_gain'
  label: string
  points: number
  max_points: number
  detail: string
}

export interface DealScore {
  total: number
  components: ScoreComponent[]
  /** false = a hard constraint failed; the deal is not eligible at any score. */
  eligible: boolean
  ineligible_reason: string | null
}

/* ------------------------------------------------------------------ *
 * Audit / Trust Timeline
 * ------------------------------------------------------------------ */
export interface AuditEvent {
  id: string
  negotiation_id: string
  seq: number
  ts: string
  actor: Actor
  merchant_id: string | null
  action: string
  summary: string
  decision: 'pass' | 'fail' | 'info'
  detail: Record<string, unknown>
}

/* ------------------------------------------------------------------ *
 * Negotiation
 * ------------------------------------------------------------------ */
export type NegotiationStatus =
  | 'extracting'
  | 'discovering'
  | 'negotiating'
  | 'ranked'
  | 'awaiting_approval'
  | 'payment_pending'
  | 'booked'
  | 'payment_failed'
  | 'no_deal'

export interface RankedOffer {
  offer: Offer
  merchant: Pick<Merchant, 'id' | 'name' | 'slug' | 'rating' | 'tagline'>
  score: DealScore
  verdict: GuardVerdict
  rank: number
}

export interface Negotiation {
  id: string
  intent: TravelIntent
  raw_request: string
  status: NegotiationStatus
  created_at: string
  updated_at: string
  selected_offer_id: string | null
}

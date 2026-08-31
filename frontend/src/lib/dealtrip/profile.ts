/**
 * Agent Commerce Profiles.
 *
 * A merchant's machine-readable storefront: what it sells, in what shape, what
 * it will negotiate over, and how to transact with it. Served over HTTP at a
 * stable path so an AI buyer that has never heard of DealTrip can discover a
 * merchant, read its catalog, request a quote and negotiate — the same surface
 * DealTrip's own orchestrator uses, not a private side channel.
 *
 * What a profile deliberately does NOT publish:
 *   • cost_per_night / add-on cost — the merchant's cost base
 *   • min_margin_pct — its margin floor
 *   • max_discount_pct — how far it will actually go
 *
 * Publishing the discount ceiling would simply mean every buyer opens by
 * demanding it. The profile says a merchant negotiates and over what; how much
 * room it has stays behind the Commerce Guard, which is the only thing that
 * needs to know.
 */
import { z } from 'zod'

import { structured } from './llm'
import { ATTRIBUTES, ATTRIBUTE_LABELS, MerchantSchema } from './types'

import type { LlmResult } from './llm'
import type { Merchant } from './types'

export interface AgentCommerceProfile {
  protocol: 'dealtrip.agent-commerce/0.1'
  merchant: {
    id: string
    slug: string
    name: string
    destination: string
    tagline: string
    description: string
    rating: number
    always_included: string[]
  }
  currency: 'INR'
  vocabulary: {
    note: string
    attributes: { id: string; label: string }[]
  }
  inventory: {
    rooms: {
      id: string
      name: string
      tier: number
      price_per_night: number
      max_occupancy: number
      delivers: string[]
      available_units: number
    }[]
    addons: {
      id: string
      name: string
      price: number
      basis: string
      group: string | null
      delivers: string[]
      removable: boolean
    }[]
  }
  negotiation: {
    negotiable: boolean
    max_counter_rounds: number
    substitutable: string[]
    always_included_addons: string[]
    offer_ttl_minutes: number
    note: string
  }
  endpoints: {
    profile: string
    quote: string
    negotiate: string
  }
  disclosure: string
}

export const toAgentCommerceProfile = (merchant: Merchant, baseUrl: string): AgentCommerceProfile => ({
  protocol: 'dealtrip.agent-commerce/0.1',
  merchant: {
    id: merchant.id,
    slug: merchant.slug,
    name: merchant.name,
    destination: merchant.destination,
    tagline: merchant.tagline,
    description: merchant.description,
    rating: merchant.rating,
    always_included: merchant.attributes
  },
  currency: 'INR',
  vocabulary: {
    note: 'Requirements and capabilities are expressed in this closed vocabulary so that matching is a set operation rather than a similarity judgement. Terms outside this list are not understood.',
    attributes: ATTRIBUTES.map(a => ({ id: a, label: ATTRIBUTE_LABELS[a] }))
  },
  inventory: {
    rooms: merchant.rooms.map(r => ({
      id: r.id,
      name: r.name,
      tier: r.tier,
      price_per_night: r.base_price_per_night,
      max_occupancy: r.max_occupancy,
      delivers: [...merchant.attributes, ...r.attributes],
      available_units: r.inventory_available
    })),
    addons: merchant.addons.map(a => ({
      id: a.id,
      name: a.name,
      price: a.price,
      basis: [a.per_night ? 'per_night' : null, a.per_person ? 'per_person' : null].filter(Boolean).join('+') || 'per_stay',
      group: a.group,
      delivers: a.attributes,
      removable: !merchant.policy.locked_addons.includes(a.id)
    }))
  },
  negotiation: {
    negotiable: merchant.policy.max_counter_rounds > 0,
    max_counter_rounds: merchant.policy.max_counter_rounds,
    substitutable: merchant.policy.substitutable_groups,
    always_included_addons: merchant.policy.locked_addons,
    offer_ttl_minutes: merchant.policy.offer_ttl_minutes,
    note: 'Send a COUNTER_REQUEST to the negotiate endpoint with a target price, the attributes that must survive, and the groups you will allow changes to. Discount limits and the margin floor are enforced server-side and are not published.'
  },
  endpoints: {
    profile: `${baseUrl}/api/agent/${merchant.slug}/profile`,
    quote: `${baseUrl}/api/agent/${merchant.slug}/quote`,
    negotiate: `${baseUrl}/api/agent/${merchant.slug}/negotiate`
  },
  disclosure:
    'Synthetic demonstration inventory published for the Razorpay Buildathon. Prices and availability are illustrative and are not bookable outside this demo.'
})

export const wellKnownIndex = (merchants: Merchant[], baseUrl: string) => ({
  protocol: 'dealtrip.agent-commerce/0.1',
  name: 'DealTrip',
  description:
    'An agentic deal desk for travel. Merchants listed here publish machine-readable catalogs and accept structured negotiation from AI buyers.',
  currency: 'INR',
  vocabulary_url: `${baseUrl}/api/agent/vocabulary`,
  merchants: merchants.map(m => ({
    id: m.id,
    slug: m.slug,
    name: m.name,
    destination: m.destination,
    rating: m.rating,
    negotiable: m.policy.max_counter_rounds > 0,
    profile: `${baseUrl}/api/agent/${m.slug}/profile`
  })),
  disclosure:
    'Synthetic demonstration inventory published for the Razorpay Buildathon. Not real merchants and not bookable.'
})

/* ==================================================================== *
 * Onboarding: prose in, Agent Commerce Profile out
 * ==================================================================== */

/** What the model is asked for. Ids are generated deterministically after. */
const DraftSchema = z.object({
  name: z.string().min(2).max(80),
  destination: z.string().min(2).max(60),
  tagline: z.string().max(90),
  description: z.string().max(600),
  rating: z.number().min(0).max(5),
  attributes: z.array(z.enum(ATTRIBUTES)).max(12),
  rooms: z
    .array(
      z.object({
        name: z.string().min(2).max(60),
        tier: z.number().int().min(1).max(5),
        base_price_per_night: z.number().int().min(0),

        /** Model estimates a cost ratio; it never sets margin policy directly. */
        cost_ratio: z.number().min(0.2).max(0.9),
        max_occupancy: z.number().int().min(1).max(12),
        attributes: z.array(z.enum(ATTRIBUTES)).max(10),
        inventory_available: z.number().int().min(0).max(200)
      })
    )
    .min(1)
    .max(8),
  addons: z
    .array(
      z.object({
        name: z.string().min(2).max(60),
        price: z.number().int().min(0),
        cost_ratio: z.number().min(0.1).max(0.9),
        per_night: z.boolean(),
        per_person: z.boolean(),
        attributes: z.array(z.enum(ATTRIBUTES)).max(6),
        group: z.string().max(24).nullable()
      })
    )
    .max(12),
  voice: z.string().max(200)
})

export type MerchantDraft = z.infer<typeof DraftSchema>

const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 40)

const ONBOARD_SYSTEM = `You convert a hotel or travel operator's free-text description into a structured, machine-readable catalog.

Return ONLY a JSON object:
{
  "name": string, "destination": string, "tagline": string, "description": string,
  "rating": number,
  "attributes": string[],            // property-level, inherited by every room
  "rooms": [{ "name", "tier" (1-5), "base_price_per_night" (whole INR),
              "cost_ratio" (0.2-0.9), "max_occupancy", "attributes": string[],
              "inventory_available" }],
  "addons": [{ "name", "price" (whole INR), "cost_ratio", "per_night", "per_person",
               "attributes": string[], "group": string | null }],
  "voice": string                     // how this property talks, one sentence
}

Rules:
- Every entry in any "attributes" array MUST come from this exact list: ${ATTRIBUTES.join(', ')}.
  Drop anything that does not map cleanly. Do not invent new attribute names.
- Put an attribute on the PROPERTY only if every room genuinely has it. If only some
  rooms are beachfront, put "beachfront" on those rooms, not on the property.
- "group" makes add-ons mutually exclusive. Give competing options the same group
  (e.g. two transfer tiers both get "transfer"; breakfast and half-board both get "meals").
  Use null for standalone extras.
- cost_ratio is your estimate of what the item costs the merchant as a fraction of its
  price. Rooms are typically 0.45-0.65; food and transfers 0.4-0.8; digital perks 0.1-0.3.
- If a price is not stated, estimate a realistic Indian market rate and keep it plausible.
- Never invent a facility the text does not support.`

/** Deterministic fallback: a usable single-room profile from whatever we can read. */
const draftFallback = (text: string): MerchantDraft => {
  const firstLine = text.trim().split('\n')[0]?.slice(0, 80) || 'New Property'
  const priceMatch = text.match(/(?:₹|rs\.?|inr)\s*([\d,]{3,})/i)
  const price = priceMatch ? parseInt(priceMatch[1].replace(/,/g, ''), 10) : 8000

  const attributes = ATTRIBUTES.filter(a =>
    new RegExp(`\\b${ATTRIBUTE_LABELS[a].split(' ')[0]}\\b`, 'i').test(text)
  ).slice(0, 8)

  return {
    name: firstLine,
    destination: 'Goa',
    tagline: 'Imported catalog — please review',
    description: text.slice(0, 500),
    rating: 4,
    attributes,
    rooms: [
      {
        name: 'Standard Room',
        tier: 3,
        base_price_per_night: price,
        cost_ratio: 0.55,
        max_occupancy: 2,
        attributes: [],
        inventory_available: 5
      }
    ],
    addons: [],
    voice: 'Straightforward and factual.'
  }
}

/** Turn a validated draft into a real Merchant with ids, costs and a policy. */
export const draftToMerchant = (
  draft: MerchantDraft,
  policyOverrides?: Partial<Merchant['policy']>
): Merchant => {
  const slug = slugify(draft.name) || `merchant-${Date.now().toString(36)}`

  // Onboarded properties have no photography of their own yet, so rooms fall
  // back to the property shot and the UI degrades to a plain panel.
  const rooms = draft.rooms.map((r, i) => ({
    id: `${slug}-room-${i + 1}`,
    image: '',
    name: r.name,
    tier: r.tier,
    base_price_per_night: r.base_price_per_night,
    cost_per_night: Math.round(r.base_price_per_night * r.cost_ratio),
    max_occupancy: r.max_occupancy,
    attributes: r.attributes,
    inventory_available: r.inventory_available
  }))

  const addons = draft.addons.map((a, i) => ({
    id: `${slug}-addon-${i + 1}`,
    name: a.name,
    price: a.price,
    cost: Math.round(a.price * a.cost_ratio),
    per_night: a.per_night,
    per_person: a.per_person,
    attributes: a.attributes,
    group: a.group
  }))

  const groups = [...new Set(addons.map(a => a.group).filter((g): g is string => Boolean(g)))]

  const merchant: Merchant = {
    id: `mch_${slug.replace(/-/g, '_')}`,
    slug,
    name: draft.name,
    destination: draft.destination,
    tagline: draft.tagline,
    description: draft.description,
    rating: draft.rating,
    image: '',
    attributes: draft.attributes,
    rooms,
    addons,

    // A sensible default: most properties charge more at weekends.
    weekend_uplift_pct: 20,
    policy: {
      max_discount_pct: 8,
      min_margin_pct: 25,
      max_counter_rounds: 2,
      allow_substitutions: true,
      substitutable_groups: [...groups, 'room_category'],
      locked_addons: [],
      objectives: ['maximize_revenue', 'protect_margin'],
      offer_ttl_minutes: 20,
      ...policyOverrides
    },
    voice: draft.voice
  }

  // Validate the thing we just built rather than assuming it is well-formed.
  return MerchantSchema.parse(merchant)
}

export const onboardMerchant = async (text: string): Promise<LlmResult<MerchantDraft>> =>
  structured({
    label: 'merchant.onboard',
    schema: DraftSchema,
    system: ONBOARD_SYSTEM,
    user: `Convert this into a structured catalog:\n"""\n${text.slice(0, 6000)}\n"""`,
    fallback: () => draftFallback(text),
    temperature: 0.2,
    max_tokens: 2600
  })

/** Does each traveller archetype get a sensible winner in each destination? */
import { SEED_MERCHANTS } from '../src/lib/dealtrip/seed'
import { runNegotiation } from '../src/lib/dealtrip/orchestrator'
import { createMemoryStore } from '../src/lib/dealtrip/store'
import { formatINR } from '../src/lib/dealtrip/pricing'
import { addDays, toIso } from '../src/lib/dealtrip/dates'
import type { Attribute, RequirementStrength, TravelIntent } from '../src/lib/dealtrip/types'

// Three weeks out, so the run does not go stale as the calendar moves.
const CHECK_IN = addDays(toIso(Date.now()), 21)

type Case = { who: string; dest: string; budget: number; pax: number; nights: number
              reqs: Partial<Record<Attribute, RequirementStrength>>
              priority: TravelIntent['priority'] }

const CASES: Case[] = [
  { who: 'Couple, anniversary',  dest: 'Goa',     budget: 60000, pax: 2, nights: 3, reqs: { beachfront: 'required', breakfast: 'preferred', romantic: 'preferred' }, priority: 'best_value' },
  { who: 'Family of four',       dest: 'Goa',     budget: 95000, pax: 4, nights: 3, reqs: { family_friendly: 'required', pool: 'preferred', all_meals: 'preferred' }, priority: 'best_value' },
  { who: 'Backpacker, cheapest', dest: 'Udaipur', budget: 18000, pax: 2, nights: 3, reqs: { city_center: 'required' }, priority: 'lowest_price' },
  { who: 'Remote worker, 5n',    dest: 'Manali',  budget: 55000, pax: 1, nights: 5, reqs: { workspace: 'required', wifi: 'required', quiet: 'preferred' }, priority: 'best_value' },
  { who: 'Dog owner',            dest: 'Udaipur', budget: 70000, pax: 2, nights: 3, reqs: { pet_friendly: 'required', kitchenette: 'preferred' }, priority: 'best_value' },
  { who: 'Luxury, no limit',     dest: 'Udaipur', budget: 200000, pax: 2, nights: 3, reqs: { spa: 'required', romantic: 'required' }, priority: 'best_experience' },
  { who: 'Adventure group',      dest: 'Manali',  budget: 80000, pax: 3, nights: 3, reqs: { gym: 'preferred', all_meals: 'preferred' }, priority: 'best_value' },
  { who: 'Wants a beach',        dest: 'Manali',  budget: 60000, pax: 2, nights: 3, reqs: { beachfront: 'required' }, priority: 'best_value' }
]

for (const c of CASES) {
  const intent: TravelIntent = {
    destination: c.dest, travelers: c.pax, duration_nights: c.nights,
    budget: { max: c.budget, currency: 'INR', type: 'hard_constraint' },
    requirements: c.reqs, date_flexibility_days: 2, check_in: CHECK_IN,
    priority: c.priority, notes: ''
  }

  const store = await createMemoryStore()
  const negotiation = { id: `v_${Math.random().toString(36).slice(2,8)}`, intent, raw_request: '', status: 'negotiating' as const,
                        created_at: new Date().toISOString(), updated_at: new Date().toISOString(), selected_offer_id: null }
  await store.createNegotiation(negotiation)

  const out = await runNegotiation({ negotiation, merchants: SEED_MERCHANTS, store, use_llm: false })
  const win = out.ranked.find(r => r.score.eligible)
  const elig = out.ranked.filter(r => r.score.eligible).length

  console.log(
    `${c.who.padEnd(22)} ${c.dest.padEnd(8)} ≤${formatINR(c.budget).padStart(9)}  →  ` +
    (win ? `${win.merchant.name.padEnd(24)} ${formatINR(win.offer.quote.total_price).padStart(10)}  (${elig} eligible of ${out.ranked.length})`
         : `NO DEAL  (${out.ranked.length} offers, none eligible)`)
  )
  if (!win && out.ranked[0]) console.log(`${' '.repeat(24)}why: ${out.ranked[0].score.ineligible_reason}`)
}

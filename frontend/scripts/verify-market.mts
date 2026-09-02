/** Does each destination actually serve the demand it claims to? */
import { SEED_MERCHANTS } from '../src/lib/dealtrip/seed'
import { computeQuote, minimumAllowedPrice, formatINR } from '../src/lib/dealtrip/pricing'
import { ATTRIBUTES, ATTRIBUTE_LABELS } from '../src/lib/dealtrip/types'
import type { Attribute } from '../src/lib/dealtrip/types'

const NIGHTS = 3, PAX = 2, CHECK_IN = '2026-03-10'

for (const dest of ['Goa', 'Manali', 'Udaipur']) {
  const ms = SEED_MERCHANTS.filter(m => m.destination === dest)
  console.log(`\n════ ${dest} ════`)

  const prices: number[] = []
  for (const m of ms) {
    const fits = m.rooms.filter(r => r.max_occupancy >= PAX && r.inventory_available > 0)
    const floors = fits.map(r => {
      const b = { room_id: r.id, addon_ids: m.policy.locked_addons, discount_pct: 0, check_in: CHECK_IN }
      return minimumAllowedPrice(m, b, NIGHTS, PAX).floor
    })
    const tops = fits.map(r => {
      const b = { room_id: r.id, addon_ids: m.addons.map(a => a.id), discount_pct: 0, check_in: CHECK_IN }
      try { return computeQuote(m, b, NIGHTS, PAX).list_price } catch { return 0 }
    })
    const lo = Math.min(...floors), hi = Math.max(...tops)
    prices.push(lo)
    console.log(`  ${m.name.padEnd(26)} ${formatINR(lo).padStart(10)} .. ${formatINR(hi).padStart(10)}  disc≤${String(m.policy.max_discount_pct).padStart(2)}% margin≥${m.policy.min_margin_pct}% rounds ${m.policy.max_counter_rounds}`)
  }
  console.log(`  cheapest entry: ${formatINR(Math.min(...prices))}`)

  // Which requirements can this destination actually satisfy, and how competitively?
  const coverage = new Map<Attribute, number>()
  for (const m of ms) {
    const all = new Set<Attribute>(m.attributes)
    for (const r of m.rooms) r.attributes.forEach(a => all.add(a))
    for (const a of m.addons) a.attributes.forEach(x => all.add(x))
    for (const a of all) coverage.set(a, (coverage.get(a) ?? 0) + 1)
  }
  const contested = ATTRIBUTES.filter(a => (coverage.get(a) ?? 0) >= 2).length
  const exclusive = ATTRIBUTES.filter(a => coverage.get(a) === 1)
  const absent = ATTRIBUTES.filter(a => !coverage.has(a))
  console.log(`  attributes: ${contested} contested (2+ merchants), ${exclusive.length} exclusive, ${absent.length} unavailable`)
  console.log(`  only one merchant offers: ${exclusive.map(a => ATTRIBUTE_LABELS[a]).join(', ') || 'none'}`)
  console.log(`  nobody offers:           ${absent.map(a => ATTRIBUTE_LABELS[a]).join(', ') || 'none'}`)
}

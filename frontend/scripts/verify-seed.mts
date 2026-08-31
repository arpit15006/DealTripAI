/**
 * Sanity-check the seed marketplace against the reference intent.
 * Run: node --experimental-strip-types scripts/verify-seed.ts
 */
import { SEED_MERCHANTS } from '../src/lib/dealtrip/seed.ts'
import { computeQuote, minimumAllowedPrice, maxAllowedDiscountPct, formatINR } from '../src/lib/dealtrip/pricing.ts'

const NIGHTS = 3
const PAX = 2
const BUDGET = 60000

for (const m of SEED_MERCHANTS.filter(x => x.destination === 'Goa')) {
  console.log(`\n=== ${m.name}  (max_disc ${m.policy.max_discount_pct}%, min_margin ${m.policy.min_margin_pct}%) ===`)

  for (const room of m.rooms) {
    if (room.max_occupancy < PAX) continue

    // Full package: room + every add-on group's priciest option
    const all = m.addons.map(a => a.id)
    const bundle = { room_id: room.id, addon_ids: all, discount_pct: 0 }
    const q = computeQuote(m, bundle, NIGHTS, PAX)
    const floors = minimumAllowedPrice(m, bundle, NIGHTS, PAX)
    const maxD = maxAllowedDiscountPct(m, bundle, NIGHTS, PAX)
    const beach = q.attributes.includes('beachfront')
    const bfast = q.attributes.includes('breakfast')

    console.log(
      `  ${room.name.padEnd(28)} list ${formatINR(q.list_price).padStart(10)} ` +
      `floor ${formatINR(floors.floor).padStart(10)} (${floors.binding}) maxDisc ${maxD}% ` +
      `${floors.floor <= BUDGET ? 'CAN reach 60k' : 'CANNOT reach 60k'} beach=${beach} bfast=${bfast}`
    )

    // Bare bundle: room only (plus locked add-ons)
    const bare = { room_id: room.id, addon_ids: m.policy.locked_addons, discount_pct: 0 }
    const bq = computeQuote(m, bare, NIGHTS, PAX)
    const bf = minimumAllowedPrice(m, bare, NIGHTS, PAX)

    console.log(
      `  ${''.padEnd(28)} bare ${formatINR(bq.list_price).padStart(10)} ` +
      `floor ${formatINR(bf.floor).padStart(10)} ${bf.floor <= BUDGET ? 'CAN reach 60k' : 'CANNOT'}`
    )
  }
}

import { SEED_MERCHANTS } from '../src/lib/dealtrip/seed'
import { computeQuote, formatINR } from '../src/lib/dealtrip/pricing'
import { resolveCheckIns, weekdayName, countWeekendNights } from '../src/lib/dealtrip/dates'

const m = SEED_MERCHANTS.find(x => x.slug === 'oceanvista')!
const room = m.rooms.find(r => r.id === 'ov-premium-beach')!
console.log(`${m.name} - ${room.name}, base ${formatINR(room.base_price_per_night)}/night, weekend uplift ${m.weekend_uplift_pct}%\n`)

const dates = resolveCheckIns(null, 3)
let cheapest = { d: '', p: Infinity }, dearest = { d: '', p: 0 }
for (const d of dates) {
  const q = computeQuote(m, { room_id: room.id, addon_ids: ['ov-breakfast'], discount_pct: 0, check_in: d }, 3, 2)
  console.log(`  ${d} (${weekdayName(d)}) ${countWeekendNights(d, 3)} weekend nights → ${formatINR(q.total_price)}`)
  if (q.total_price < cheapest.p) cheapest = { d, p: q.total_price }
  if (q.total_price > dearest.p) dearest = { d, p: q.total_price }
}
console.log(`\n  spread across the flex window: ${formatINR(dearest.p - cheapest.p)} (${cheapest.d} vs ${dearest.d})`)

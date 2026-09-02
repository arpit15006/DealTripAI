import { SEED_MERCHANTS } from '../src/lib/dealtrip/seed'
import { runSimulation } from '../src/lib/dealtrip/simulator'

const r = await runSimulation(SEED_MERCHANTS, { intents: 200, destination: 'Goa', seed: 42 })
const inr = (n: number) => '₹' + n.toLocaleString('en-IN')

console.log(`intents ${r.intents}`)
console.log(`                 ${'STATIC'.padStart(12)} ${'DEALTRIP'.padStart(12)}`)
console.log(`bookings         ${String(r.static_selling.bookings).padStart(12)} ${String(r.agentic.bookings).padStart(12)}`)
console.log(`conversion       ${(r.static_selling.conversion_rate*100).toFixed(1).padStart(11)}% ${(r.agentic.conversion_rate*100).toFixed(1).padStart(11)}%`)
console.log(`revenue          ${inr(r.static_selling.revenue).padStart(12)} ${inr(r.agentic.revenue).padStart(12)}`)
console.log(`AOV              ${inr(r.static_selling.aov).padStart(12)} ${inr(r.agentic.aov).padStart(12)}`)
console.log(`margin           ${inr(r.static_selling.margin).padStart(12)} ${inr(r.agentic.margin).padStart(12)}`)
console.log(`margin %         ${(r.static_selling.margin_pct).toFixed(1).padStart(11)}% ${(r.agentic.margin_pct).toFixed(1).padStart(11)}%`)
console.log(`mean fit score   ${String(r.static_selling.mean_score).padStart(12)} ${String(r.agentic.mean_score).padStart(12)}`)
console.log(`\ndelta revenue ${inr(r.delta.revenue)} (${r.delta.revenue_pct}%)  bookings +${r.delta.bookings}  conv +${r.delta.conversion_points}pts`)
console.log(`counters ${r.negotiation.total_counters}  guard blocks ${r.negotiation.offers_blocked_by_guard}  recovered lost sales ${r.negotiation.sales_recovered_from_no_deal}`)
console.log(`\nby merchant:`); console.table(r.by_merchant)

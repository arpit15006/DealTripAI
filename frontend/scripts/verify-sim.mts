import { SEED_MERCHANTS } from '../src/lib/dealtrip/seed'
import { runSimulation } from '../src/lib/dealtrip/simulator'

for (const d of ['Goa', 'Manali', 'Udaipur']) {
  const r = await runSimulation(SEED_MERCHANTS, { intents: 120, destination: d, seed: 42 })
  console.log(
    `  ${d.padEnd(8)} conv ${(r.static_selling.conversion_rate * 100).toFixed(0)}% -> ${(r.agentic.conversion_rate * 100).toFixed(0)}%` +
    `  revenue ${r.delta.revenue_pct > 0 ? '+' : ''}${r.delta.revenue_pct}%` +
    `  margin ${r.static_selling.margin_pct.toFixed(1)}% -> ${r.agentic.margin_pct.toFixed(1)}%` +
    `  blocks ${r.negotiation.offers_blocked_by_guard}  recovered ${r.negotiation.sales_recovered_from_no_deal}`
  )
}

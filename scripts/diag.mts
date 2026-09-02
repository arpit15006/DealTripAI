import { SEED_MERCHANTS } from '../src/lib/dealtrip/seed'
import { generateIntents } from '../src/lib/dealtrip/simulator'
import { runNegotiation } from '../src/lib/dealtrip/orchestrator'
import { createMemoryStore } from '../src/lib/dealtrip/store'
import { resolveCheckIns } from '../src/lib/dealtrip/dates'
import { formatINR } from '../src/lib/dealtrip/pricing'

const intents = generateIntents(6, 'Goa', 7)
const store = await createMemoryStore()
const goa = SEED_MERCHANTS.filter(m => m.destination === 'Goa')

for (const [i, intent] of intents.entries()) {
  const dates = resolveCheckIns(intent.check_in, intent.date_flexibility_days)
  const neg = { id: `d${i}`, intent, raw_request: '', status: 'negotiating' as const,
    created_at: new Date().toISOString(), updated_at: new Date().toISOString(), selected_offer_id: null }
  await store.createNegotiation(neg)
  const out = await runNegotiation({ negotiation: neg, merchants: SEED_MERCHANTS, store, use_llm: false })
  const audit = await store.listAudit(neg.id)
  const blocked = audit.filter(e => e.action === 'offer_rejected')
  const win = out.ranked.find(r => r.score.eligible)
  console.log(`intent ${i}: ${intent.travelers}p ${intent.duration_nights}n budget ${formatINR(intent.budget.max)} flex ${intent.date_flexibility_days} (${dates.length} dates)`)
  console.log(`   blocks=${blocked.length} winner=${win ? win.merchant.name + ' ' + formatINR(win.offer.quote.total_price) : 'NONE'}`)
  for (const b of blocked.slice(0, 2)) console.log(`   ✗ ${b.summary.slice(0, 110)}`)
}

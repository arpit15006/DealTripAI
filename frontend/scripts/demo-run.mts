/** End-to-end engine check, deterministic mode. node --experimental-strip-types scripts/demo-run.ts */
import { SEED_MERCHANTS, DEMO_REQUEST } from '../src/lib/dealtrip/seed'
import { heuristicIntent } from '../src/lib/dealtrip/intent'
import { runNegotiation } from '../src/lib/dealtrip/orchestrator'
import { createMemoryStore } from '../src/lib/dealtrip/store'
import { formatINR } from '../src/lib/dealtrip/pricing'

const store = await createMemoryStore()
const extraction = heuristicIntent(DEMO_REQUEST, ['Goa', 'Manali', 'Udaipur'])

console.log('INTENT:', JSON.stringify({ ...extraction, ambiguities: undefined, restatement: undefined }, null, 1))
console.log('RESTATED:', extraction.restatement, '\n')

const { ambiguities: _a, restatement: _r, ...intent } = extraction

const negotiation = {
  id: 'neg_demo',
  intent,
  raw_request: DEMO_REQUEST,
  status: 'negotiating' as const,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  selected_offer_id: null
}

await store.createNegotiation(negotiation)

const outcome = await runNegotiation({ negotiation, merchants: SEED_MERCHANTS, store, use_llm: false })

console.log('\n════ RANKING ════')
for (const r of outcome.ranked) {
  console.log(
    `#${r.rank} ${r.merchant.name.padEnd(24)} ${formatINR(r.offer.quote.total_price).padStart(10)} ` +
    `score ${String(r.score.total).padStart(5)} round ${r.offer.round} ${r.score.eligible ? '✓ eligible' : '✗ ' + r.score.ineligible_reason}`
  )
  if (r.score.eligible) for (const c of r.score.components) console.log(`      ${c.label.padEnd(18)} ${String(c.points).padStart(5)}/${c.max_points}`)
}

console.log('\nWHY:', outcome.explanation)

console.log('\n════ TRUST TIMELINE ════')
for (const e of await store.listAudit('neg_demo')) {
  const mark = e.decision === 'pass' ? '✓' : e.decision === 'fail' ? '✗' : '·'
  console.log(`${String(e.seq).padStart(2)} ${mark} [${e.actor.padEnd(14)}] ${e.summary}`)
}

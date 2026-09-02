/**
 * A buyer agent that knows nothing but DealTrip's MCP surface.
 *
 * Run it against a live marketplace to watch an external client be refused by
 * the Commerce Guard for exceeding a hard budget, then negotiate its way to a
 * legal offer, without any privileged access, and without touching DealTrip's
 * own orchestrator.
 *
 *   pnpm dev                       # in one terminal
 *   node scripts/mcp-example.mjs   # in another
 */
import { Client } from '@modelcontextprotocol/sdk/client/index.js'
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js'

const client = new Client({ name: 'probe', version: '1.0.0' })
await client.connect(new StdioClientTransport({
  command: 'node', args: ['--import', 'tsx', 'src/mcp/server.ts'],
  env: { ...process.env, DEALTRIP_BASE_URL: 'http://localhost:3000' }
}))

const body = async (name, args) => {
  const r = await client.callTool({ name, arguments: args })
  const [status, ...rest] = r.content[0].text.split('\n\n')
  return { status, json: JSON.parse(rest.join('\n\n')) }
}
const inr = n => '₹' + n.toLocaleString('en-IN')

const intent = {
  destination: 'Goa', travelers: 2, duration_nights: 3, budget_max: 60000,
  requirements: { beachfront: 'required', breakfast: 'preferred' },
  date_flexibility_days: 2, priority: 'best_value', notes: 'anniversary trip'
}

console.log('An external agent negotiating, via MCP only:\n')

const q = await body('request_quote', { slug: 'oceanvista', ...intent })
const o = q.json.offer
console.log(`1. quote          ${q.status}  ${inr(o.price.total)}  quoted=${q.json.quoted}`)
for (const v of q.json.guard.violations) console.log(`   ✗ ${v.detail.slice(0, 78)}`)

const n = await body('negotiate', {
  slug: 'oceanvista', ...intent,
  previous_room_id: o.bundle.room_id,
  previous_addon_ids: o.bundle.addon_ids,
  previous_discount_pct: o.bundle.discount_pct,
  max_price: 58000,
  preserve: ['beachfront'], preferred: ['breakfast'],
  substitution_allowed: ['meals', 'transfer', 'wellness', 'activity', 'flex', 'room_category'],
  message: 'Come to 58,000 and keep beachfront and breakfast.',
  round: 1
})
console.log(`\n2. negotiate      ${n.status}  revised=${n.json.revised}`)
if (n.json.revised) {
  console.log(`   ${inr(n.json.movement.previous_total)} → ${inr(n.json.movement.new_total)}  (saved ${inr(n.json.movement.delta)})`)
  for (const c of n.json.offer.changes_from_previous) console.log(`   · ${c}`)
  console.log(`   guard ${n.json.guard.checks.filter(c=>c.passed).length}/${n.json.guard.checks.length} passed · rounds left ${n.json.rounds_remaining}`)
} else {
  console.log(`   declined: ${n.json.reason?.slice(0,90)}`)
}
await client.close()

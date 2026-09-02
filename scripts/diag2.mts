import { SEED_MERCHANTS } from '../src/lib/dealtrip/seed'
import { runSimulation } from '../src/lib/dealtrip/simulator'

const r = await runSimulation(SEED_MERCHANTS, { intents: 30, destination: 'Goa', seed: 7 })
console.log('static  bookings', r.static_selling.bookings, 'conv', (r.static_selling.conversion_rate*100).toFixed(0)+'%')
console.log('agentic bookings', r.agentic.bookings, 'conv', (r.agentic.conversion_rate*100).toFixed(0)+'%')
console.log('blocks', r.negotiation.offers_blocked_by_guard, 'counters', r.negotiation.total_counters)
console.log('recovered', r.negotiation.sales_recovered_from_no_deal)

/**
 * Persistence.
 *
 * Two implementations behind one interface:
 *   • PostgresStore — Neon. The real one. Audit events are append-only.
 *   • MemoryStore   — used when DATABASE_URL is unset, and as an automatic
 *     fallback if Postgres is unreachable at boot. A hackathon demo that dies
 *     because a database had a bad thirty seconds is a demo that dies, so the
 *     product degrades to in-process state instead of erroring out. Which mode
 *     is live is surfaced in the UI rather than hidden.
 */
import { neon } from '@neondatabase/serverless'

import type {
  AuditEvent,
  GuardVerdict,
  Merchant,
  Negotiation,
  NegotiationStatus,
  Offer,
  OfferStatus
} from './types'

export interface PaymentRecord {
  id: string
  negotiation_id: string
  offer_id: string
  razorpay_order_id: string | null
  razorpay_payment_id: string | null
  amount: number
  currency: string
  status: 'created' | 'paid' | 'failed' | 'verification_failed'
  failure_reason: string | null
  created_at: string
  settled_at: string | null
}

export interface StoredVerdict {
  offer_id: string
  negotiation_id: string
  stage: 'authorization' | 'pre_payment'
  verdict: GuardVerdict
}

export interface SimulationRecord {
  id: string
  created_at: string
  config: Record<string, unknown>
  result: Record<string, unknown>
}

export interface DealTripStore {
  readonly kind: 'postgres' | 'memory'
  init(): Promise<void>

  listMerchants(destination?: string): Promise<Merchant[]>
  getMerchant(idOrSlug: string): Promise<Merchant | null>
  upsertMerchant(merchant: Merchant): Promise<void>
  deleteMerchant(id: string): Promise<void>

  createNegotiation(n: Negotiation): Promise<void>
  getNegotiation(id: string): Promise<Negotiation | null>
  updateNegotiation(id: string, patch: Partial<Pick<Negotiation, 'status' | 'selected_offer_id' | 'intent'>>): Promise<void>
  listNegotiations(limit: number): Promise<Negotiation[]>

  saveOffer(offer: Offer): Promise<void>
  getOffer(id: string): Promise<Offer | null>
  listOffers(negotiationId: string): Promise<Offer[]>
  setOfferStatus(id: string, status: OfferStatus): Promise<void>

  saveVerdict(v: StoredVerdict): Promise<void>
  listVerdicts(negotiationId: string): Promise<StoredVerdict[]>

  appendAudit(event: Omit<AuditEvent, 'seq'>): Promise<AuditEvent>
  listAudit(negotiationId: string): Promise<AuditEvent[]>

  savePayment(p: PaymentRecord): Promise<void>
  getPaymentByOrderId(orderId: string): Promise<PaymentRecord | null>
  updatePayment(id: string, patch: Partial<PaymentRecord>): Promise<void>
  listPayments(negotiationId: string): Promise<PaymentRecord[]>

  saveSimulation(s: SimulationRecord): Promise<void>
  listSimulations(limit: number): Promise<SimulationRecord[]>
}

/* ==================================================================== *
 * Postgres
 * ==================================================================== */

type Sql = ReturnType<typeof neon>

const SCHEMA: string[] = [
  `CREATE TABLE IF NOT EXISTS merchants (
     id           TEXT PRIMARY KEY,
     slug         TEXT UNIQUE NOT NULL,
     name         TEXT NOT NULL,
     destination  TEXT NOT NULL,
     rating       NUMERIC NOT NULL DEFAULT 0,
     doc          JSONB NOT NULL,
     created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
     updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
   )`,
  `CREATE INDEX IF NOT EXISTS merchants_destination_idx ON merchants (lower(destination))`,

  `CREATE TABLE IF NOT EXISTS negotiations (
     id                TEXT PRIMARY KEY,
     raw_request       TEXT NOT NULL,
     intent            JSONB NOT NULL,
     status            TEXT NOT NULL,
     selected_offer_id TEXT,
     created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
     updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
   )`,

  `CREATE TABLE IF NOT EXISTS offers (
     id              TEXT PRIMARY KEY,
     negotiation_id  TEXT NOT NULL,
     merchant_id     TEXT NOT NULL,
     round           INTEGER NOT NULL,
     bundle          JSONB NOT NULL,
     quote           JSONB NOT NULL,
     rationale       TEXT NOT NULL DEFAULT '',
     changes         JSONB NOT NULL DEFAULT '[]'::jsonb,
     status          TEXT NOT NULL,
     total_price     INTEGER NOT NULL,
     created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
     expires_at      TIMESTAMPTZ NOT NULL
   )`,
  `CREATE INDEX IF NOT EXISTS offers_negotiation_idx ON offers (negotiation_id)`,

  `CREATE TABLE IF NOT EXISTS guard_verdicts (
     id              BIGSERIAL PRIMARY KEY,
     offer_id        TEXT NOT NULL,
     negotiation_id  TEXT NOT NULL,
     stage           TEXT NOT NULL,
     authorized      BOOLEAN NOT NULL,
     verdict         JSONB NOT NULL,
     evaluated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
   )`,
  `CREATE INDEX IF NOT EXISTS guard_verdicts_negotiation_idx ON guard_verdicts (negotiation_id)`,

  // Append-only: the Trust Timeline is worthless if rows can be edited after
  // the fact, so nothing in this codebase issues an UPDATE or DELETE here.
  `CREATE TABLE IF NOT EXISTS audit_events (
     seq             BIGSERIAL PRIMARY KEY,
     id              TEXT NOT NULL,
     negotiation_id  TEXT NOT NULL,
     ts              TIMESTAMPTZ NOT NULL,
     actor           TEXT NOT NULL,
     merchant_id     TEXT,
     action          TEXT NOT NULL,
     summary         TEXT NOT NULL,
     decision        TEXT NOT NULL,
     detail          JSONB NOT NULL DEFAULT '{}'::jsonb
   )`,
  `CREATE INDEX IF NOT EXISTS audit_events_negotiation_idx ON audit_events (negotiation_id, seq)`,

  `CREATE TABLE IF NOT EXISTS payments (
     id                 TEXT PRIMARY KEY,
     negotiation_id     TEXT NOT NULL,
     offer_id           TEXT NOT NULL,
     razorpay_order_id  TEXT,
     razorpay_payment_id TEXT,
     amount             INTEGER NOT NULL,
     currency           TEXT NOT NULL DEFAULT 'INR',
     status             TEXT NOT NULL,
     failure_reason     TEXT,
     created_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
     settled_at         TIMESTAMPTZ
   )`,
  `CREATE INDEX IF NOT EXISTS payments_order_idx ON payments (razorpay_order_id)`,

  `CREATE TABLE IF NOT EXISTS simulations (
     id         TEXT PRIMARY KEY,
     created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
     config     JSONB NOT NULL,
     result     JSONB NOT NULL
   )`
]

const iso = (v: unknown): string =>
  v instanceof Date ? v.toISOString() : typeof v === 'string' ? new Date(v).toISOString() : new Date().toISOString()

class PostgresStore implements DealTripStore {
  readonly kind = 'postgres' as const
  private sql: Sql

  constructor(connectionString: string) {
    this.sql = neon(connectionString)
  }

  /**
   * The driver's tagged-template signature widens to a union that includes a
   * full result object, so every call site would otherwise need a cast. One
   * narrowing wrapper keeps the queries themselves readable.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private q = async (strings: TemplateStringsArray, ...values: unknown[]): Promise<Record<string, any>[]> =>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (await (this.sql as any)(strings, ...values)) as Record<string, any>[]

  async init() {
    for (const stmt of SCHEMA) await this.sql.query(stmt)
  }

  /* --- merchants ------------------------------------------------------- */
  async listMerchants(destination?: string) {
    const rows = destination
      ? await this.q`SELECT doc FROM merchants WHERE lower(destination) = lower(${destination}) ORDER BY rating DESC, name`
      : await this.q`SELECT doc FROM merchants ORDER BY destination, rating DESC, name`

    return rows.map(r => r.doc as Merchant)
  }

  async getMerchant(idOrSlug: string) {
    const rows = await this.q`SELECT doc FROM merchants WHERE id = ${idOrSlug} OR slug = ${idOrSlug} LIMIT 1`

    return rows.length ? (rows[0].doc as Merchant) : null
  }

  async upsertMerchant(m: Merchant) {
    await this.q`
      INSERT INTO merchants (id, slug, name, destination, rating, doc, updated_at)
      VALUES (${m.id}, ${m.slug}, ${m.name}, ${m.destination}, ${m.rating}, ${JSON.stringify(m)}::jsonb, now())
      ON CONFLICT (id) DO UPDATE SET
        slug = EXCLUDED.slug, name = EXCLUDED.name, destination = EXCLUDED.destination,
        rating = EXCLUDED.rating, doc = EXCLUDED.doc, updated_at = now()`
  }

  async deleteMerchant(id: string) {
    await this.q`DELETE FROM merchants WHERE id = ${id}`
  }

  /* --- negotiations ---------------------------------------------------- */
  async createNegotiation(n: Negotiation) {
    await this.q`
      INSERT INTO negotiations (id, raw_request, intent, status, selected_offer_id, created_at, updated_at)
      VALUES (${n.id}, ${n.raw_request}, ${JSON.stringify(n.intent)}::jsonb, ${n.status}, ${n.selected_offer_id}, ${n.created_at}, ${n.updated_at})
      ON CONFLICT (id) DO NOTHING`
  }

  async getNegotiation(id: string) {
    const rows = await this.q`SELECT * FROM negotiations WHERE id = ${id} LIMIT 1`

    return rows.length ? rowToNegotiation(rows[0]) : null
  }

  async updateNegotiation(id: string, patch: Partial<Pick<Negotiation, 'status' | 'selected_offer_id' | 'intent'>>) {
    if (patch.status !== undefined)
      await this.q`UPDATE negotiations SET status = ${patch.status}, updated_at = now() WHERE id = ${id}`
    if (patch.selected_offer_id !== undefined)
      await this.q`UPDATE negotiations SET selected_offer_id = ${patch.selected_offer_id}, updated_at = now() WHERE id = ${id}`
    if (patch.intent !== undefined)
      await this.q`UPDATE negotiations SET intent = ${JSON.stringify(patch.intent)}::jsonb, updated_at = now() WHERE id = ${id}`
  }

  async listNegotiations(limit: number) {
    const rows = await this.q`SELECT * FROM negotiations ORDER BY created_at DESC LIMIT ${limit}`

    return rows.map(rowToNegotiation)
  }

  /* --- offers ---------------------------------------------------------- */
  async saveOffer(o: Offer) {
    await this.q`
      INSERT INTO offers (id, negotiation_id, merchant_id, round, bundle, quote, rationale, changes, status, total_price, created_at, expires_at)
      VALUES (${o.id}, ${o.negotiation_id}, ${o.merchant_id}, ${o.round}, ${JSON.stringify(o.bundle)}::jsonb,
              ${JSON.stringify(o.quote)}::jsonb, ${o.rationale}, ${JSON.stringify(o.changes_from_previous)}::jsonb,
              ${o.status}, ${o.quote.total_price}, ${o.created_at}, ${o.expires_at})
      ON CONFLICT (id) DO UPDATE SET status = EXCLUDED.status`
  }

  async getOffer(id: string) {
    const rows = await this.q`SELECT * FROM offers WHERE id = ${id} LIMIT 1`

    return rows.length ? rowToOffer(rows[0]) : null
  }

  async listOffers(negotiationId: string) {
    const rows = await this.q`SELECT * FROM offers WHERE negotiation_id = ${negotiationId} ORDER BY created_at`

    return rows.map(rowToOffer)
  }

  async setOfferStatus(id: string, status: OfferStatus) {
    await this.q`UPDATE offers SET status = ${status} WHERE id = ${id}`
  }

  /* --- guard verdicts --------------------------------------------------- */
  async saveVerdict(v: StoredVerdict) {
    await this.q`
      INSERT INTO guard_verdicts (offer_id, negotiation_id, stage, authorized, verdict)
      VALUES (${v.offer_id}, ${v.negotiation_id}, ${v.stage}, ${v.verdict.authorized}, ${JSON.stringify(v.verdict)}::jsonb)`
  }

  async listVerdicts(negotiationId: string) {
    const rows = await this.q`SELECT * FROM guard_verdicts WHERE negotiation_id = ${negotiationId} ORDER BY id`

    return rows.map(r => ({
      offer_id: r.offer_id as string,
      negotiation_id: r.negotiation_id as string,
      stage: r.stage as StoredVerdict['stage'],
      verdict: r.verdict as GuardVerdict
    }))
  }

  /* --- audit ------------------------------------------------------------ */
  async appendAudit(e: Omit<AuditEvent, 'seq'>) {
    const rows = await this.q`
      INSERT INTO audit_events (id, negotiation_id, ts, actor, merchant_id, action, summary, decision, detail)
      VALUES (${e.id}, ${e.negotiation_id}, ${e.ts}, ${e.actor}, ${e.merchant_id}, ${e.action}, ${e.summary}, ${e.decision}, ${JSON.stringify(e.detail)}::jsonb)
      RETURNING seq`

    return { ...e, seq: Number(rows[0].seq) }
  }

  async listAudit(negotiationId: string) {
    const rows = await this.q`SELECT * FROM audit_events WHERE negotiation_id = ${negotiationId} ORDER BY seq`

    // Renumber to a per-negotiation sequence so the timeline reads 1..n.
    return rows.map((r, i) => ({
      id: r.id as string,
      negotiation_id: r.negotiation_id as string,
      seq: i + 1,
      ts: iso(r.ts),
      actor: r.actor as AuditEvent['actor'],
      merchant_id: (r.merchant_id as string) ?? null,
      action: r.action as string,
      summary: r.summary as string,
      decision: r.decision as AuditEvent['decision'],
      detail: (r.detail as Record<string, unknown>) ?? {}
    }))
  }

  /* --- payments --------------------------------------------------------- */
  async savePayment(p: PaymentRecord) {
    await this.q`
      INSERT INTO payments (id, negotiation_id, offer_id, razorpay_order_id, razorpay_payment_id, amount, currency, status, failure_reason, created_at, settled_at)
      VALUES (${p.id}, ${p.negotiation_id}, ${p.offer_id}, ${p.razorpay_order_id}, ${p.razorpay_payment_id}, ${p.amount}, ${p.currency}, ${p.status}, ${p.failure_reason}, ${p.created_at}, ${p.settled_at})
      ON CONFLICT (id) DO UPDATE SET status = EXCLUDED.status`
  }

  async getPaymentByOrderId(orderId: string) {
    const rows = await this.q`SELECT * FROM payments WHERE razorpay_order_id = ${orderId} LIMIT 1`

    return rows.length ? rowToPayment(rows[0]) : null
  }

  async updatePayment(id: string, patch: Partial<PaymentRecord>) {
    if (patch.status !== undefined) await this.q`UPDATE payments SET status = ${patch.status} WHERE id = ${id}`
    if (patch.razorpay_payment_id !== undefined)
      await this.q`UPDATE payments SET razorpay_payment_id = ${patch.razorpay_payment_id} WHERE id = ${id}`
    if (patch.failure_reason !== undefined)
      await this.q`UPDATE payments SET failure_reason = ${patch.failure_reason} WHERE id = ${id}`
    if (patch.settled_at !== undefined)
      await this.q`UPDATE payments SET settled_at = ${patch.settled_at} WHERE id = ${id}`
  }

  async listPayments(negotiationId: string) {
    const rows = await this.q`SELECT * FROM payments WHERE negotiation_id = ${negotiationId} ORDER BY created_at`

    return rows.map(rowToPayment)
  }

  /* --- simulations ------------------------------------------------------ */
  async saveSimulation(s: SimulationRecord) {
    await this.q`
      INSERT INTO simulations (id, created_at, config, result)
      VALUES (${s.id}, ${s.created_at}, ${JSON.stringify(s.config)}::jsonb, ${JSON.stringify(s.result)}::jsonb)`
  }

  async listSimulations(limit: number) {
    const rows = await this.q`SELECT * FROM simulations ORDER BY created_at DESC LIMIT ${limit}`

    return rows.map(r => ({
      id: r.id as string,
      created_at: iso(r.created_at),
      config: r.config as Record<string, unknown>,
      result: r.result as Record<string, unknown>
    }))
  }
}

/* eslint-disable @typescript-eslint/no-explicit-any */
const rowToNegotiation = (r: any): Negotiation => ({
  id: r.id,
  raw_request: r.raw_request,
  intent: r.intent,
  status: r.status as NegotiationStatus,
  selected_offer_id: r.selected_offer_id ?? null,
  created_at: iso(r.created_at),
  updated_at: iso(r.updated_at)
})

const rowToOffer = (r: any): Offer => ({
  id: r.id,
  negotiation_id: r.negotiation_id,
  merchant_id: r.merchant_id,
  round: Number(r.round),
  bundle: r.bundle,
  quote: r.quote,
  rationale: r.rationale ?? '',
  changes_from_previous: r.changes ?? [],
  status: r.status as OfferStatus,
  created_at: iso(r.created_at),
  expires_at: iso(r.expires_at)
})

const rowToPayment = (r: any): PaymentRecord => ({
  id: r.id,
  negotiation_id: r.negotiation_id,
  offer_id: r.offer_id,
  razorpay_order_id: r.razorpay_order_id ?? null,
  razorpay_payment_id: r.razorpay_payment_id ?? null,
  amount: Number(r.amount),
  currency: r.currency,
  status: r.status,
  failure_reason: r.failure_reason ?? null,
  created_at: iso(r.created_at),
  settled_at: r.settled_at ? iso(r.settled_at) : null
})
/* eslint-enable @typescript-eslint/no-explicit-any */

/* ==================================================================== *
 * Memory
 * ==================================================================== */

class MemoryStore implements DealTripStore {
  readonly kind = 'memory' as const
  private merchants = new Map<string, Merchant>()
  private negotiations = new Map<string, Negotiation>()
  private offers = new Map<string, Offer>()
  private verdicts: StoredVerdict[] = []
  private audit: AuditEvent[] = []
  private payments = new Map<string, PaymentRecord>()
  private simulations: SimulationRecord[] = []
  private auditSeq = 0

  async init() {}

  async listMerchants(destination?: string) {
    const all = [...this.merchants.values()]
    const filtered = destination
      ? all.filter(m => m.destination.toLowerCase() === destination.toLowerCase())
      : all

    return filtered.sort((a, b) => b.rating - a.rating || a.name.localeCompare(b.name))
  }

  async getMerchant(idOrSlug: string) {
    return this.merchants.get(idOrSlug) ?? [...this.merchants.values()].find(m => m.slug === idOrSlug) ?? null
  }

  async upsertMerchant(m: Merchant) {
    this.merchants.set(m.id, m)
  }

  async deleteMerchant(id: string) {
    this.merchants.delete(id)
  }

  async createNegotiation(n: Negotiation) {
    if (!this.negotiations.has(n.id)) this.negotiations.set(n.id, n)
  }

  async getNegotiation(id: string) {
    return this.negotiations.get(id) ?? null
  }

  async updateNegotiation(id: string, patch: Partial<Pick<Negotiation, 'status' | 'selected_offer_id' | 'intent'>>) {
    const n = this.negotiations.get(id)

    if (n) this.negotiations.set(id, { ...n, ...patch, updated_at: new Date().toISOString() })
  }

  async listNegotiations(limit: number) {
    return [...this.negotiations.values()]
      .sort((a, b) => b.created_at.localeCompare(a.created_at))
      .slice(0, limit)
  }

  async saveOffer(o: Offer) {
    this.offers.set(o.id, o)
  }

  async getOffer(id: string) {
    return this.offers.get(id) ?? null
  }

  async listOffers(negotiationId: string) {
    return [...this.offers.values()]
      .filter(o => o.negotiation_id === negotiationId)
      .sort((a, b) => a.created_at.localeCompare(b.created_at))
  }

  async setOfferStatus(id: string, status: OfferStatus) {
    const o = this.offers.get(id)

    if (o) this.offers.set(id, { ...o, status })
  }

  async saveVerdict(v: StoredVerdict) {
    this.verdicts.push(v)
  }

  async listVerdicts(negotiationId: string) {
    return this.verdicts.filter(v => v.negotiation_id === negotiationId)
  }

  async appendAudit(e: Omit<AuditEvent, 'seq'>) {
    const event = { ...e, seq: ++this.auditSeq }

    this.audit.push(event)

    return event
  }

  async listAudit(negotiationId: string) {
    return this.audit
      .filter(e => e.negotiation_id === negotiationId)
      .map((e, i) => ({ ...e, seq: i + 1 }))
  }

  async savePayment(p: PaymentRecord) {
    this.payments.set(p.id, p)
  }

  async getPaymentByOrderId(orderId: string) {
    return [...this.payments.values()].find(p => p.razorpay_order_id === orderId) ?? null
  }

  async updatePayment(id: string, patch: Partial<PaymentRecord>) {
    const p = this.payments.get(id)

    if (p) this.payments.set(id, { ...p, ...patch })
  }

  async listPayments(negotiationId: string) {
    return [...this.payments.values()].filter(p => p.negotiation_id === negotiationId)
  }

  async saveSimulation(s: SimulationRecord) {
    this.simulations.unshift(s)
  }

  async listSimulations(limit: number) {
    return this.simulations.slice(0, limit)
  }
}

/* ==================================================================== *
 * Singleton
 * ==================================================================== */

declare global {
  // eslint-disable-next-line no-var
  var __dealtripStore: Promise<DealTripStore> | undefined
}

const build = async (): Promise<DealTripStore> => {
  const url = process.env.DATABASE_URL

  if (!url) {
    console.warn('[dealtrip] DATABASE_URL unset — running on the in-memory store.')
    const mem = new MemoryStore()

    await mem.init()

    return mem
  }

  try {
    const pg = new PostgresStore(url)

    await pg.init()

    return pg
  } catch (error) {
    console.error('[dealtrip] Postgres unavailable, falling back to in-memory store:', error)
    const mem = new MemoryStore()

    await mem.init()

    return mem
  }
}

/**
 * A throwaway store. The revenue simulator runs thousands of negotiations and
 * has no business writing that traffic into the production audit log.
 */
export const createMemoryStore = async (): Promise<DealTripStore> => {
  const mem = new MemoryStore()

  await mem.init()

  return mem
}

/** Cached across hot reloads so dev does not reopen a pool per request. */
export const getStore = (): Promise<DealTripStore> => (globalThis.__dealtripStore ??= build())

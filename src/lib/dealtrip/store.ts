/**
 * Persistence.
 *
 * Two implementations behind one interface:
 *   • PostgresStore (Neon). The real one. Audit events are append-only.
 *   • MemoryStore, used when DATABASE_URL is unset, and as an automatic
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

/**
 * A hold on one unit of a room.
 *
 * Taken when a traveller approves an offer, released if the payment fails or
 * the hold lapses, and made permanent when the booking confirms. Without this
 * the guard's inventory check is advisory: it reads a count nobody decrements,
 * so the last room can be sold twice.
 */
export interface Reservation {
  id: string
  negotiation_id: string
  offer_id: string
  merchant_id: string
  room_id: string

  /**
   * How many units of `room_id` this hold takes. A party of four in two doubles
   * holds two, and a capacity test that counted rows would let a second party
   * book the same second room.
   */
  units: number
  status: 'held' | 'confirmed' | 'released'
  created_at: string
  expires_at: string
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

  /** An order already raised for this offer and not yet resolved, if any. */
  getOpenPaymentForOffer(offerId: string): Promise<PaymentRecord | null>

  /**
   * Claim the single open-payment slot for an offer.
   *
   * Returns the row on success, or null if another request already holds it.
   * The check and the write are one statement, so concurrent approvals cannot
   * both believe they are first.
   */
  claimPaymentSlot(payment: PaymentRecord): Promise<PaymentRecord | null>
  updatePayment(id: string, patch: Partial<PaymentRecord>): Promise<void>
  listPayments(negotiationId: string): Promise<PaymentRecord[]>

  saveSimulation(s: SimulationRecord): Promise<void>
  listSimulations(limit: number): Promise<SimulationRecord[]>

  /**
   * Take a hold, but only if one is actually available.
   *
   * Returns null when the room is already fully held or booked. The check and
   * the write must happen together. Reading a count and then writing it back
   * is precisely the race this exists to close.
   */
  reserveRoom(r: Reservation, capacity: number): Promise<Reservation | null>
  releaseReservation(offerId: string, reason: 'released' | 'confirmed'): Promise<void>
  countActiveReservations(merchantId: string, roomId: string): Promise<number>
  listReservations(negotiationId: string): Promise<Reservation[]>
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

  // One order awaiting payment per offer. Approving twice concurrently was
  // raising two payable Razorpay orders for one booking; a read-then-write
  // check cannot prevent that, because both reads happen before either write.
  `CREATE UNIQUE INDEX IF NOT EXISTS payments_open_offer_idx
     ON payments (offer_id) WHERE status = 'created'`,

  `CREATE TABLE IF NOT EXISTS reservations (
     id              TEXT PRIMARY KEY,
     negotiation_id  TEXT NOT NULL,
     offer_id        TEXT NOT NULL,
     merchant_id     TEXT NOT NULL,
     room_id         TEXT NOT NULL,
     units           INTEGER NOT NULL DEFAULT 1,
     status          TEXT NOT NULL,
     created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
     expires_at      TIMESTAMPTZ NOT NULL
   )`,

  // Added after the table shipped, so it has to be applied to existing rows too.
  // Defaulting to 1 makes every hold written before multi-room existed mean
  // exactly what it meant then.
  `ALTER TABLE reservations ADD COLUMN IF NOT EXISTS units INTEGER NOT NULL DEFAULT 1`,

  // One live hold per offer: re-approving the same offer must not take a second unit.
  `CREATE UNIQUE INDEX IF NOT EXISTS reservations_offer_live_idx
     ON reservations (offer_id) WHERE status IN ('held', 'confirmed')`,
  `CREATE INDEX IF NOT EXISTS reservations_room_idx ON reservations (merchant_id, room_id, status)`,

  `CREATE TABLE IF NOT EXISTS simulations (
     id         TEXT PRIMARY KEY,
     created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
     config     JSONB NOT NULL,
     result     JSONB NOT NULL
   )`
]

/**
 * Normalise dashes in model-authored prose on the way out.
 *
 * New rows are cleaned when they are written, but rows stored before that was
 * true would keep rendering em dashes forever. Applied only to fields a model
 * wrote: the traveller's own request is echoed back exactly as they typed it.
 */
const plainProse = (v: string) =>
  v.replace(/\s+[\u2010-\u2015\u2212]\s+/g, ', ').replace(/[\u2010-\u2015\u2212]/g, '-')

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
   
  private q = async (strings: TemplateStringsArray, ...values: unknown[]): Promise<Record<string, any>[]> =>
     
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

  async getOpenPaymentForOffer(offerId: string) {
    const rows = await this.q`
      SELECT * FROM payments
      WHERE offer_id = ${offerId} AND status = 'created'
      ORDER BY created_at DESC LIMIT 1`

    return rows.length ? rowToPayment(rows[0]) : null
  }

  async claimPaymentSlot(p: PaymentRecord) {
    /*
     * Release an abandoned claim first.
     *
     * A request that won the slot and then died before attaching an order id
     * would hold it forever, and the offer could never be approved again. Any
     * slot with no order after the grace period was never going to get one.
     */
    await this.q`
      UPDATE payments
      SET status = 'failed', failure_reason = 'Abandoned before an order was raised'
      WHERE offer_id = ${p.offer_id}
        AND status = 'created'
        AND razorpay_order_id IS NULL
        AND created_at < now() - interval '2 minutes'`

    const rows = await this.q`
      INSERT INTO payments (id, negotiation_id, offer_id, razorpay_order_id, razorpay_payment_id, amount, currency, status, failure_reason, created_at, settled_at)
      VALUES (${p.id}, ${p.negotiation_id}, ${p.offer_id}, NULL, NULL, ${p.amount}, ${p.currency}, 'created', NULL, ${p.created_at}, NULL)
      ON CONFLICT (offer_id) WHERE status = 'created' DO NOTHING
      RETURNING *`

    return rows.length ? rowToPayment(rows[0]) : null
  }

  async updatePayment(id: string, patch: Partial<PaymentRecord>) {
    if (patch.status !== undefined) await this.q`UPDATE payments SET status = ${patch.status} WHERE id = ${id}`

    // Without this the order id never reached the row, so the payment could not
    // be found by order at verification time and a paid booking could never be
    // confirmed. Field-by-field updates fail silently when a field is missed.
    if (patch.razorpay_order_id !== undefined)
      await this.q`UPDATE payments SET razorpay_order_id = ${patch.razorpay_order_id} WHERE id = ${id}`
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

  /* --- reservations ----------------------------------------------------- */

  /**
   * Insert only if the room still has a free unit.
   *
   * The capacity test lives inside the INSERT rather than in a read-then-write,
   * so two approvals racing for the last room cannot both observe it as
   * available. Expired holds are excluded by the same statement, so a lapsed
   * hold frees its unit without a sweeper.
   */
  async reserveRoom(r: Reservation, capacity: number) {
    const units = Math.max(1, Math.trunc(r.units ?? 1))

    const rows = await this.q`
      INSERT INTO reservations (id, negotiation_id, offer_id, merchant_id, room_id, units, status, created_at, expires_at)
      SELECT ${r.id}, ${r.negotiation_id}, ${r.offer_id}, ${r.merchant_id}, ${r.room_id}, ${units}, ${r.status}, ${r.created_at}, ${r.expires_at}
      WHERE (
        SELECT coalesce(sum(units), 0) FROM reservations
        WHERE merchant_id = ${r.merchant_id}
          AND room_id = ${r.room_id}
          AND (status = 'confirmed' OR (status = 'held' AND expires_at > now()))
      ) + ${units} <= ${capacity}
      ON CONFLICT (offer_id) WHERE status IN ('held', 'confirmed') DO NOTHING
      RETURNING *`

    // No row means either the room was full or this offer already holds one.
    if (rows.length === 0) {
      const existing = await this.q`
        SELECT * FROM reservations
        WHERE offer_id = ${r.offer_id} AND status IN ('held', 'confirmed') LIMIT 1`

      return existing.length ? rowToReservation(existing[0]) : null
    }

    return rowToReservation(rows[0])
  }

  async releaseReservation(offerId: string, reason: 'released' | 'confirmed') {
    await this.q`UPDATE reservations SET status = ${reason} WHERE offer_id = ${offerId} AND status = 'held'`
  }

  async countActiveReservations(merchantId: string, roomId: string) {
    const rows = await this.q`
      SELECT coalesce(sum(units), 0)::int AS n FROM reservations
      WHERE merchant_id = ${merchantId} AND room_id = ${roomId}
        AND (status = 'confirmed' OR (status = 'held' AND expires_at > now()))`

    return Number(rows[0]?.n ?? 0)
  }

  async listReservations(negotiationId: string) {
    const rows = await this.q`SELECT * FROM reservations WHERE negotiation_id = ${negotiationId} ORDER BY created_at`

    return rows.map(rowToReservation)
  }
}

 
const rowToNegotiation = (r: any): Negotiation => ({
  id: r.id,
  raw_request: r.raw_request,
  intent: r.intent,
  status: r.status as NegotiationStatus,
  selected_offer_id: r.selected_offer_id ?? null,
  created_at: iso(r.created_at),
  updated_at: iso(r.updated_at)
})

/**
 * Offers written before bundles carried dates.
 *
 * Backfilled with a Monday check-in, chosen because a stay starting Monday has
 * no Friday or Saturday nights, so the weekend uplift does not apply and the
 * guard's independent recomputation still agrees with the stored total to the
 * rupee. A backfill that silently changed a recorded price would turn an audit
 * record into a guess.
 */
const MONDAY_BACKFILL = '2026-01-05'

const hydrateOffer = (bundle: any, quote: any) => {
  if (bundle?.check_in && quote?.check_in) return { bundle, quote }

  const checkIn = bundle?.check_in ?? MONDAY_BACKFILL
  const nights = Number(quote?.nights ?? 1)
  const checkOut = new Date(Date.parse(`${checkIn}T00:00:00Z`) + nights * 86_400_000).toISOString().slice(0, 10)

  return {
    bundle: { ...bundle, check_in: checkIn },
    quote: { ...quote, check_in: checkIn, check_out: checkOut, weekend_nights: quote?.weekend_nights ?? 0 }
  }
}

const rowToOffer = (r: any): Offer => ({
  id: r.id,
  negotiation_id: r.negotiation_id,
  merchant_id: r.merchant_id,
  round: Number(r.round),
  ...hydrateOffer(r.bundle, r.quote),
  rationale: plainProse(r.rationale ?? ''),
  changes_from_previous: (r.changes ?? []).map(plainProse),
  status: r.status as OfferStatus,
  created_at: iso(r.created_at),
  expires_at: iso(r.expires_at)
})

const rowToReservation = (r: any): Reservation => ({
  id: r.id,
  negotiation_id: r.negotiation_id,
  offer_id: r.offer_id,
  merchant_id: r.merchant_id,
  room_id: r.room_id,
  units: Number(r.units ?? 1),
  status: r.status,
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
  private reservations: Reservation[] = []
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

  async getOpenPaymentForOffer(offerId: string) {
    return [...this.payments.values()].find(p => p.offer_id === offerId && p.status === 'created') ?? null
  }

  async claimPaymentSlot(p: PaymentRecord) {
    const open = await this.getOpenPaymentForOffer(p.offer_id)

    // Same rule as Postgres: an abandoned claim must not hold the slot forever.
    const abandoned =
      open !== null && !open.razorpay_order_id && Date.parse(open.created_at) < Date.now() - 120_000

    if (open && abandoned)
      this.payments.set(open.id, { ...open, status: 'failed', failure_reason: 'Abandoned before an order was raised' })
    else if (open) return null

    this.payments.set(p.id, p)

    return p
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

  async reserveRoom(r: Reservation, capacity: number) {
    const live = this.reservations.find(
      x => x.offer_id === r.offer_id && (x.status === 'confirmed' || x.status === 'held')
    )

    if (live) return live

    // Single-threaded, so read-then-write is atomic enough here in a way it
    // would never be against a shared database.
    if (this.countLive(r.merchant_id, r.room_id) + Math.max(1, r.units ?? 1) > capacity) return null

    this.reservations.push(r)

    return r
  }

  async releaseReservation(offerId: string, reason: 'released' | 'confirmed') {
    for (const r of this.reservations) if (r.offer_id === offerId && r.status === 'held') r.status = reason
  }

  async countActiveReservations(merchantId: string, roomId: string) {
    return this.countLive(merchantId, roomId)
  }

  async listReservations(negotiationId: string) {
    return this.reservations.filter(r => r.negotiation_id === negotiationId)
  }

  private countLive(merchantId: string, roomId: string) {
    const now = Date.now()

    return this.reservations
      .filter(
        r =>
          r.merchant_id === merchantId &&
          r.room_id === roomId &&
          (r.status === 'confirmed' || (r.status === 'held' && Date.parse(r.expires_at) > now))
      )
      .reduce((sum, r) => sum + Math.max(1, r.units ?? 1), 0)
  }
}

/* ==================================================================== *
 * Singleton
 * ==================================================================== */

declare global {
   
  var __dealtripStore: Promise<DealTripStore> | undefined
}

const build = async (): Promise<DealTripStore> => {
  const url = process.env.DATABASE_URL

  if (!url) {
    console.warn('[dealtrip] DATABASE_URL unset. Running on the in-memory store.')
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

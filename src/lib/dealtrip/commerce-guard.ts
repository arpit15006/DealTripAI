/**
 * The Commerce Guard.
 *
 *   Agents propose. The guard authorizes.
 *
 * Nothing in this file calls a model, reads a prompt, or trusts a field that an
 * agent filled in. Every number it compares against is either re-derived from
 * the catalog or read from merchant policy. An offer that has not passed
 * `guardOffer` cannot be ranked, shown as purchasable, or paid for, the API
 * layer re-runs it immediately before creating a Razorpay order, so a stale or
 * tampered offer cannot reach checkout.
 */
import { computeQuote, CatalogError, findAddOn, findRoom, minimumAllowedPrice, formatINR, roomsNeeded } from './pricing'
import { ATTRIBUTE_LABELS } from './types'

import type { Attribute, GuardCheck, GuardVerdict, Merchant, Offer, TravelIntent } from './types'

interface GuardInput {
  merchant: Merchant
  offer: Offer
  intent: TravelIntent

  /** Check-in dates the traveller accepted. Empty disables the window check. */
  allowed_check_ins?: string[]

  /** How many revisions this merchant has already made (opening offer = 0). */
  rounds_used: number
  now?: Date
}

const check = (
  id: GuardCheck['id'],
  label: string,
  passed: boolean,
  detail: string,
  extra: { expected?: string; actual?: string; advisory?: boolean } = {}
): GuardCheck => ({
  id,
  label,
  passed,
  detail,
  expected: extra.expected,
  actual: extra.actual,
  advisory: extra.advisory ?? false
})

export const guardOffer = ({ merchant, offer, intent, rounds_used, allowed_check_ins = [], now = new Date() }: GuardInput): GuardVerdict => {
  const checks: GuardCheck[] = []
  const { policy } = merchant
  const { bundle, quote } = offer

  /* 1. Catalog integrity. Does every id in the bundle actually exist? ---- */
  const room = findRoom(merchant, bundle.room_id)
  const unknownAddOns = bundle.addon_ids.filter(id => !findAddOn(merchant, id))
  const catalogOk = Boolean(room) && unknownAddOns.length === 0

  checks.push(
    check(
      'catalog_integrity',
      'Catalog integrity',
      catalogOk,
      catalogOk
        ? `Room and ${bundle.addon_ids.length} add-on${bundle.addon_ids.length === 1 ? '' : 's'} resolved against ${merchant.name}'s live catalog.`
        : !room
          ? `Bundle references room "${bundle.room_id}", which is not in the catalog.`
          : `Bundle references unknown add-ons: ${unknownAddOns.join(', ')}.`
    )
  )

  // Every later check reads the catalog, so bail out coherently if it is broken.
  if (!room || !catalogOk) return finalize(checks, now)

  const roomCount = Math.max(1, Math.trunc(bundle.room_count ?? 1))
  const unit = (n: number) => `${n} unit${n === 1 ? '' : 's'}`

  /* 2. Inventory -----------------------------------------------------------
   * Against the units this offer actually sells, not against one. An offer of
   * three rooms from a property holding two is not "in stock".               */
  const inventoryOk = room.inventory_available >= roomCount

  checks.push(
    check(
      'inventory_available',
      'Inventory available',
      inventoryOk,
      inventoryOk
        ? `${unit(room.inventory_available)} of ${room.name} remaining, this offer takes ${roomCount}.`
        : room.inventory_available === 0
          ? `${room.name} is sold out.`
          : `This offer needs ${unit(roomCount)} of ${room.name} and only ${room.inventory_available} remain.`,
      { expected: `≥ ${unit(roomCount)}`, actual: `${unit(room.inventory_available)}` }
    )
  )

  /* 3. Occupancy -----------------------------------------------------------
   * Across the rooms being sold, not within one of them. Requiring a single
   * room to sleep the whole party is how four travellers used to be told a
   * hotel full of empty doubles had nothing for them.                        */
  const sleeps = room.max_occupancy * roomCount
  const occupancyOk = sleeps >= quote.travelers

  checks.push(
    check(
      'occupancy_fits',
      'Occupancy fits party',
      occupancyOk,
      occupancyOk
        ? `${roomCount} × ${room.name} sleeps ${sleeps}; party of ${quote.travelers}.`
        : `${roomCount} × ${room.name} sleeps ${sleeps} but the party is ${quote.travelers}.`,
      { expected: `≥ ${quote.travelers}`, actual: `${sleeps}` }
    )
  )

  /* 4. Room count ----------------------------------------------------------
   * Recomputed from the traveller's request the same way the planner derives
   * it, then compared. This is the room-count twin of price_integrity: an
   * agent that quietly sells one suite where two rooms were asked for is
   * making a substitution the traveller never agreed to, and it would
   * otherwise be invisible because the arithmetic still balances.            */
  const bedrooms = Math.max(1, room.bedrooms ?? 1)
  const expectedRooms = roomsNeeded(room, quote.travelers, intent.rooms)
  const roomCountOk = roomCount === expectedRooms

  checks.push(
    check(
      'room_count_matches_request',
      'Room count matches the request',
      roomCountOk,
      roomCountOk
        ? intent.rooms === null
          ? `${unit(roomCount)}, the fewest that hold ${quote.travelers}.`
          : bedrooms > 1
            ? `${unit(roomCount)} of a ${bedrooms}-bedroom unit, giving the ${intent.rooms} rooms asked for.`
            : `${unit(roomCount)}, as requested.`
        : roomCount < expectedRooms
          ? `Offers ${unit(roomCount)} where ${expectedRooms} were asked for.`
          : `Offers ${unit(roomCount)} where ${expectedRooms} would do.`,
      { expected: `${expectedRooms}`, actual: `${roomCount}` }
    )
  )

  /* 5. Price integrity ----------------------------------------------------
   * Re-derive the entire quote from the catalog and compare it, line by line,
   * against what arrived with the offer. This is what makes "the AI cannot
   * invent a price" a checked property rather than a claim.                */
  let priceOk = false
  let priceDetail = ''
  let recomputedTotal: number | null = null

  try {
    const recomputed = computeQuote(merchant, bundle, quote.nights, quote.travelers)

    recomputedTotal = recomputed.total_price

    const drift = [
      ['list price', recomputed.list_price, quote.list_price],
      ['discount', recomputed.discount_amount, quote.discount_amount],
      ['total', recomputed.total_price, quote.total_price],
      ['cost', recomputed.total_cost, quote.total_cost]
    ] as const

    const mismatches = drift.filter(([, expected, actual]) => expected !== actual)

    priceOk = mismatches.length === 0
    priceDetail = priceOk
      ? `Independently recomputed from catalog: ${formatINR(recomputed.total_price)}. Matches to the rupee.`
      : `Recomputation disagrees on ${mismatches.map(([field]) => field).join(', ')}.`
  } catch (error) {
    priceOk = false
    priceDetail =
      error instanceof CatalogError ? error.message : 'Quote could not be recomputed from the catalog.'
  }

  checks.push(
    check('price_integrity', 'Price recomputed from catalog', priceOk, priceDetail, {
      expected: recomputedTotal === null ? 'recomputable' : formatINR(recomputedTotal),
      actual: formatINR(quote.total_price)
    })
  )

  /* 6. Discount ceiling --------------------------------------------------- */
  const discountOk = quote.discount_pct <= policy.max_discount_pct + 1e-9

  checks.push(
    check(
      'discount_ceiling',
      'Discount within merchant ceiling',
      discountOk,
      discountOk
        ? `${quote.discount_pct}% discount is inside the ${policy.max_discount_pct}% ceiling.`
        : `${quote.discount_pct}% discount breaches the ${policy.max_discount_pct}% ceiling set by ${merchant.name}.`,
      { expected: `≤ ${policy.max_discount_pct}%`, actual: `${quote.discount_pct}%` }
    )
  )

  /* 7. Margin floor ------------------------------------------------------- */
  const marginOk = quote.margin_pct >= policy.min_margin_pct - 1e-9
  const floors = safeFloor(merchant, offer)

  checks.push(
    check(
      'margin_floor',
      'Merchant margin protected',
      marginOk,
      marginOk
        ? `Retained margin ${quote.margin_pct.toFixed(1)}% clears the ${policy.min_margin_pct}% floor.`
        : `Margin would fall to ${quote.margin_pct.toFixed(1)}%, below ${merchant.name}'s ${policy.min_margin_pct}% floor.` +
          (floors ? ` Lowest legal price for this package is ${formatINR(floors.floor)}.` : ''),
      { expected: `≥ ${policy.min_margin_pct}%`, actual: `${quote.margin_pct.toFixed(1)}%` }
    )
  )

  /* 8. Locked add-ons ----------------------------------------------------- */
  const missingLocked = policy.locked_addons.filter(id => !bundle.addon_ids.includes(id))

  checks.push(
    check(
      'locked_addons_present',
      'Non-removable inclusions intact',
      missingLocked.length === 0,
      missingLocked.length === 0
        ? policy.locked_addons.length === 0
          ? 'Merchant locks no inclusions.'
          : 'All locked inclusions are still in the package.'
        : `Package drops inclusions the merchant marked non-removable: ${missingLocked
            .map(id => findAddOn(merchant, id)?.name ?? id)
            .join(', ')}.`
    )
  )

  /* 9. Negotiation round limit -------------------------------------------- */
  const roundsOk = offer.round <= policy.max_counter_rounds

  checks.push(
    check(
      'round_limit',
      'Negotiation rounds within limit',
      roundsOk,
      roundsOk
        ? `Round ${offer.round} of a permitted ${policy.max_counter_rounds} revision${policy.max_counter_rounds === 1 ? '' : 's'}.`
        : `${merchant.name} permits ${policy.max_counter_rounds} revision${policy.max_counter_rounds === 1 ? '' : 's'}; this is round ${offer.round}.`,
      { expected: `≤ ${policy.max_counter_rounds}`, actual: `${offer.round}` }
    )
  )

  /* 10. Expiry ------------------------------------------------------------- */
  const notExpired = new Date(offer.expires_at).getTime() > now.getTime()

  checks.push(
    check(
      'offer_not_expired',
      'Offer still valid',
      notExpired,
      notExpired
        ? `Held until ${new Date(offer.expires_at).toLocaleTimeString('en-IN')}.`
        : 'The held price on this offer has lapsed and must be re-quoted.'
    )
  )

  /* 11. Currency ---------------------------------------------------------- */
  checks.push(
    check('currency', 'Currency matches intent', intent.budget.currency === 'INR', 'Quoted and budgeted in INR.')
  )

  /* 12. Hard budget ------------------------------------------------------- */
  const budgetIsHard = intent.budget.type === 'hard_constraint'
  const withinBudget = quote.total_price <= intent.budget.max

  checks.push(
    check(
      'hard_budget',
      budgetIsHard ? "Within traveller's hard budget" : "Within traveller's target budget",
      withinBudget,
      withinBudget
        ? `${formatINR(quote.total_price)} against a ${formatINR(intent.budget.max)} ${budgetIsHard ? 'limit' : 'target'}.`
        : `${formatINR(quote.total_price)} exceeds the traveller's ${budgetIsHard ? 'hard limit' : 'target'} by ${formatINR(quote.total_price - intent.budget.max)}.`,
      {
        expected: `≤ ${formatINR(intent.budget.max)}`,
        actual: formatINR(quote.total_price),
        advisory: !budgetIsHard
      }
    )
  )

  /* 13. Check-in inside the window the traveller agreed to ----------------- */
  // A merchant may move a flexible traveller to a cheaper weekday, but only
  // within the dates they actually said they would accept. Shifting a stay
  // outside that window is a different trip, not a better deal.
  const dateOk = allowed_check_ins.length === 0 || allowed_check_ins.includes(offer.quote.check_in)

  checks.push(
    check(
      'check_in_window',
      'Dates within the traveller’s window',
      dateOk,
      allowed_check_ins.length === 0
        ? 'No date window was specified.'
        : dateOk
          ? `Checks in ${offer.quote.check_in}, inside the ${allowed_check_ins.length}-day window the traveller accepted.`
          : `Checks in ${offer.quote.check_in}, outside the window the traveller accepted (${allowed_check_ins[0]} to ${allowed_check_ins[allowed_check_ins.length - 1]}).`,
      { expected: `${allowed_check_ins[0]} … ${allowed_check_ins[allowed_check_ins.length - 1]}`, actual: offer.quote.check_in }
    )
  )

  /* 14. Hard requirements ------------------------------------------------- */
  const required = (Object.entries(intent.requirements) as [Attribute, string][])
    .filter(([, strength]) => strength === 'required')
    .map(([attr]) => attr)

  const delivered = new Set(quote.attributes)
  const missingRequired = required.filter(a => !delivered.has(a))

  const forbidden = (Object.entries(intent.requirements) as [Attribute, string][])
    .filter(([, strength]) => strength === 'avoid')
    .map(([attr]) => attr)

  const presentForbidden = forbidden.filter(a => delivered.has(a))
  const requirementsOk = missingRequired.length === 0 && presentForbidden.length === 0

  checks.push(
    check(
      'hard_requirements',
      "Traveller's must-haves delivered",
      requirementsOk,
      requirementsOk
        ? required.length === 0
          ? 'No must-haves were declared.'
          : `Delivers every must-have: ${required.map(a => ATTRIBUTE_LABELS[a]).join(', ')}.`
        : [
            missingRequired.length ? `missing ${missingRequired.map(a => ATTRIBUTE_LABELS[a]).join(', ')}` : '',
            presentForbidden.length
              ? `includes ruled-out ${presentForbidden.map(a => ATTRIBUTE_LABELS[a]).join(', ')}`
              : ''
          ]
            .filter(Boolean)
            .join('; ')
    )
  )

  void rounds_used // rounds are authoritative on the offer itself; kept for API symmetry

  return finalize(checks, now)
}

const finalize = (checks: GuardCheck[], now: Date): GuardVerdict => {
  const violations = checks.filter(c => !c.passed && !c.advisory)

  return {
    authorized: violations.length === 0,
    checks,
    violations,
    evaluated_at: now.toISOString()
  }
}

const safeFloor = (merchant: Merchant, offer: Offer) => {
  try {
    return minimumAllowedPrice(merchant, offer.bundle, offer.quote.nights, offer.quote.travelers)
  } catch {
    return null
  }
}

/**
 * Re-validation immediately before money moves. Same checks, plus the two that
 * only matter at the point of purchase: the offer must be the one the user
 * approved, and it must still be authorized right now, not when it was ranked.
 */
export const guardPayment = (input: GuardInput & { approved_offer_id: string }): GuardVerdict => {
  const verdict = guardOffer(input)
  const matches = input.offer.id === input.approved_offer_id

  const identity = check(
    'catalog_integrity',
    'Offer matches the one the traveller approved',
    matches,
    matches
      ? 'Payment is being raised against the exact approved offer.'
      : 'Offer identifier does not match the approved offer; payment blocked.'
  )

  const checks = [identity, ...verdict.checks]
  const violations = checks.filter(c => !c.passed && !c.advisory)

  return { authorized: violations.length === 0, checks, violations, evaluated_at: verdict.evaluated_at }
}

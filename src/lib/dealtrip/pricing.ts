/**
 * Deterministic pricing.
 *
 * This module is the ONLY place a rupee figure is produced. Agents choose a
 * bundle; this turns a bundle into money. Because no model output ever reaches
 * a price field, "the AI hallucinated a price" is not a failure mode the system
 * has, the guard re-runs these same functions to verify.
 */
import { addDays, countWeekendNights, isWeekendNight, nightsOf } from './dates'

import type { AddOn, Attribute, Bundle, Merchant, Quote, QuoteLine, Room } from './types'

export class CatalogError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'CatalogError'
  }
}

/**
 * A room's rate for one specific night, after any weekend uplift.
 *
 * The uplift is coerced rather than trusted: a merchant record written before
 * this field existed yields `undefined`, and `undefined / 100` would quietly
 * turn every price into NaN. The Commerce Guard does catch that, it compares
 * a recomputation and NaN never equals NaN, but money should not be able to
 * become NaN in the first place.
 */
export const nightlyRate = (room: Room, weekendUpliftPct: number, night: string): number => {
  const uplift = Number.isFinite(weekendUpliftPct) ? weekendUpliftPct : 0

  return isWeekendNight(night)
    ? Math.round(room.base_price_per_night * (1 + uplift / 100))
    : room.base_price_per_night
}

export const findRoom = (merchant: Merchant, roomId: string): Room | undefined =>
  merchant.rooms.find(r => r.id === roomId)

export const findAddOn = (merchant: Merchant, addonId: string): AddOn | undefined =>
  merchant.addons.find(a => a.id === addonId)

/**
 * How many units of a room type this party needs.
 *
 * Three rules, in order, and the order is the whole point:
 *
 *  1. Occupancy is a floor, not a preference. A party of four cannot be sold
 *     one room that sleeps two however politely they ask, so a stated room
 *     count is raised to what legally holds them rather than honoured blindly.
 *  2. A stated count above that floor is honoured. "Two rooms for four" is a
 *     request for privacy, not a rounding of "one room for four", and quietly
 *     substituting the cheaper arrangement is the kind of silent downgrade this
 *     system exists to prevent.
 *  3. Nobody needs more rooms than there are people, which caps the absurd end
 *     ("nine rooms for two") without needing to argue with the traveller.
 *
 * Inventory is deliberately NOT considered here. Whether the property has the
 * units is a separate question with a separate answer, and the honest one is a
 * withdrawal rather than a smaller booking the traveller never agreed to.
 */
export const roomsNeeded = (room: Room, travelers: number, requested: number | null | undefined): number => {
  const occupancy = Math.max(1, room.max_occupancy)
  const party = Math.max(1, travelers)
  const minimum = Math.ceil(party / occupancy)

  /*
   * Anything that is not a usable number means "not stated".
   *
   * A strict `=== null` test looked equivalent and was not: intents stored
   * before this field existed carry `undefined`, because a Zod default applies
   * when a document is parsed and nothing re-parses rows already in the
   * database. `Math.trunc(undefined)` is NaN, NaN propagates through Math.max,
   * and the guard then rejected a real offer citing "1 unit where NaN would
   * do". Every negotiation older than this field would have been unbookable.
   */
  const stated = Number.isFinite(requested as number) ? Math.trunc(requested as number) : null
  const wanted = stated === null ? minimum : Math.max(stated, minimum)

  return Math.min(wanted, party)
}

/** Add-on price for a whole stay, honouring per-night / per-person flags. */
export const addOnAmount = (addon: AddOn, nights: number, travelers: number, field: 'price' | 'cost') => {
  const unit = addon[field]
  const nightMult = addon.per_night ? nights : 1
  const personMult = addon.per_person ? travelers : 1

  return unit * nightMult * personMult
}

/**
 * Turn a bundle into a fully itemised quote.
 * Throws CatalogError if the bundle references anything not in the catalog -
 * which is exactly how an agent that invents a room id gets caught.
 */
export const computeQuote = (
  merchant: Merchant,
  bundle: Bundle,
  nights: number,
  travelers: number
): Quote => {
  const room = findRoom(merchant, bundle.room_id)

  if (!room) throw new CatalogError(`Unknown room "${bundle.room_id}" for merchant ${merchant.id}`)

  // Rooms are priced night by night: Friday and Saturday nights carry the
  // merchant's weekend uplift, weekdays do not. Cost is flat, so the day of the
  // week changes margin rather than expense.
  const stayNights = nightsOf(bundle.check_in, nights)
  const weekendNights = countWeekendNights(bundle.check_in, nights)

  // A bundle written before room_count existed has no field here, and one unit
  // is the only reading of such a bundle that prices it as it was priced then.
  const roomCount = Math.max(1, Math.trunc(bundle.room_count ?? 1))

  const perRoomAmount = stayNights.reduce(
    (sum, night) => sum + nightlyRate(room, merchant.weekend_uplift_pct, night),
    0
  )

  const lines: QuoteLine[] = [
    {
      label:
        `${room.name}${roomCount > 1 ? ` × ${roomCount} rooms` : ''} × ${nights} night${nights === 1 ? '' : 's'}` +
        `${weekendNights > 0 ? ` (${weekendNights} weekend)` : ''}`,
      kind: 'room',
      ref_id: room.id,
      unit_price: room.base_price_per_night,
      quantity: nights * roomCount,
      amount: perRoomAmount * roomCount,
      cost: room.cost_per_night * nights * roomCount
    }
  ]

  // De-duplicate add-ons; an agent listing the same extra twice must not double-bill.
  const uniqueAddOnIds = [...new Set(bundle.addon_ids)]

  for (const addonId of uniqueAddOnIds) {
    const addon = findAddOn(merchant, addonId)

    if (!addon) throw new CatalogError(`Unknown add-on "${addonId}" for merchant ${merchant.id}`)

    const quantity = (addon.per_night ? nights : 1) * (addon.per_person ? travelers : 1)

    lines.push({
      label: addon.name,
      kind: 'addon',
      ref_id: addon.id,
      unit_price: addon.price,
      quantity,
      amount: addOnAmount(addon, nights, travelers, 'price'),
      cost: addOnAmount(addon, nights, travelers, 'cost')
    })
  }

  const listPrice = lines.reduce((sum, l) => sum + l.amount, 0)
  const totalCost = lines.reduce((sum, l) => sum + l.cost, 0)

  // Round to whole rupees at the single point where money becomes final.
  const discountPct = clampPct(bundle.discount_pct)
  const discountAmount = Math.round((listPrice * discountPct) / 100)
  const totalPrice = listPrice - discountAmount
  const marginAmount = totalPrice - totalCost

  const attributes = collectAttributes(merchant, room, uniqueAddOnIds)

  return {
    check_in: bundle.check_in,
    check_out: addDays(bundle.check_in, nights),
    weekend_nights: weekendNights,
    lines,
    list_price: listPrice,
    discount_pct: discountPct,
    discount_amount: discountAmount,
    total_price: totalPrice,
    total_cost: totalCost,
    margin_amount: marginAmount,
    margin_pct: totalPrice === 0 ? 0 : round2((marginAmount / totalPrice) * 100),
    attributes,
    nights,
    travelers
  }
}

/** Everything this package delivers: property + room + add-on attributes. */
export const collectAttributes = (
  merchant: Merchant,
  room: Room,
  addonIds: string[]
): Attribute[] => {
  const set = new Set<Attribute>([...merchant.attributes, ...room.attributes])

  for (const id of addonIds) {
    const addon = findAddOn(merchant, id)

    if (addon) addon.attributes.forEach(a => set.add(a))
  }

  return [...set]
}

/**
 * The lowest price this merchant may legally sell this bundle for, the binding
 * one of two independent floors:
 *   1. the discount ceiling  (list × (1 − max_discount))
 *   2. the margin floor      (cost ÷ (1 − min_margin))
 * Used by the merchant agent to stay inside policy, and by the guard to verify
 * it did. Same function, both sides: the agent cannot be "more optimistic"
 * about its own floor than the guard is.
 */
export const minimumAllowedPrice = (
  merchant: Merchant,
  bundle: Bundle,
  nights: number,
  travelers: number
): { floor: number; discount_floor: number; margin_floor: number; binding: 'discount' | 'margin' } => {
  const quote = computeQuote(merchant, { ...bundle, discount_pct: 0 }, nights, travelers)
  const { max_discount_pct, min_margin_pct } = merchant.policy

  const discountFloor = Math.ceil(quote.list_price * (1 - max_discount_pct / 100))

  const marginFloor =
    min_margin_pct >= 100 ? Infinity : Math.ceil(quote.total_cost / (1 - min_margin_pct / 100))

  const floor = Math.max(discountFloor, marginFloor)

  return {
    floor,
    discount_floor: discountFloor,
    margin_floor: marginFloor,
    binding: marginFloor > discountFloor ? 'margin' : 'discount'
  }
}

/**
 * Largest discount percentage this bundle can carry without breaching either
 * policy floor. The merchant agent uses this to answer "how far can I actually
 * go?" without guessing.
 */
export const maxAllowedDiscountPct = (
  merchant: Merchant,
  bundle: Bundle,
  nights: number,
  travelers: number
): number => {
  const quote = computeQuote(merchant, { ...bundle, discount_pct: 0 }, nights, travelers)

  if (quote.list_price === 0) return 0

  const { floor } = minimumAllowedPrice(merchant, bundle, nights, travelers)
  const pct = ((quote.list_price - floor) / quote.list_price) * 100

  return Math.max(0, Math.floor(pct * 100) / 100)
}

/**
 * Smallest discount that brings this bundle to or under a target price, or null
 * if no legal discount gets there. Deterministic: the agent asks for a target,
 * arithmetic answers.
 */
export const discountToReach = (
  merchant: Merchant,
  bundle: Bundle,
  nights: number,
  travelers: number,
  targetPrice: number
): number | null => {
  const quote = computeQuote(merchant, { ...bundle, discount_pct: 0 }, nights, travelers)

  if (quote.list_price <= targetPrice) return 0

  const needed = ((quote.list_price - targetPrice) / quote.list_price) * 100
  const rounded = Math.ceil(needed * 100) / 100
  const allowed = maxAllowedDiscountPct(merchant, bundle, nights, travelers)

  return rounded <= allowed ? rounded : null
}

export const clampPct = (n: number) => Math.min(100, Math.max(0, Math.round(n * 100) / 100))
export const round2 = (n: number) => Math.round(n * 100) / 100

export const formatINR = (amount: number) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount)

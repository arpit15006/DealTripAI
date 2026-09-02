/**
 * Deterministic bundle planner, the merchant's own optimizer.
 *
 * Given a catalog, a policy and a target, this enumerates every legal package
 * and picks the one that best serves the merchant's stated objectives. It is
 * exhaustive (add-on subsets are small), so within its model it is optimal, not
 * heuristic.
 *
 * It exists for three reasons:
 *   1. It is the fallback whenever the model is unavailable or non-compliant.
 *   2. It gives the merchant agent a hard floor and a legal reference bundle,
 *      so the model is choosing among vetted options rather than free-styling.
 *   3. It makes the division of labour honest. Price is arithmetic and belongs
 *      here. What the planner CANNOT do is read "our anniversary" and know that
 *      the spa ritual should survive the cut while the water-sports package
 *      should not, that judgement is not in the attribute vocabulary, and it is
 *      the part the model is actually for.
 */
import { computeQuote, discountToReach, maxAllowedDiscountPct, minimumAllowedPrice, roomsNeeded } from './pricing'

import type { AddOn, Attribute, Bundle, Merchant, Quote, RequirementStrength, Room, TravelIntent } from './types'

export interface PlanCandidate {
  bundle: Bundle
  quote: Quote
  floor: number
  binding: 'discount' | 'margin'
  max_discount_pct: number
  objective_score: number
  satisfies_required: boolean
  preferred_hit: number
  preferred_total: number
}

export interface PlanInput {
  merchant: Merchant
  intent: TravelIntent
  nights: number
  travelers: number

  /** Check-in dates the traveller will accept. Must contain at least one. */
  allowed_check_ins: string[]

  /** Price the package must land at or under. Null for an opening offer. */
  target_price: number | null

  /** Attributes that must be present (over and above the intent's own). */
  preserve?: Attribute[]

  /** Restrict which add-on groups may differ from `previous`. */
  previous?: Bundle | null
  substitution_allowed?: string[] | null
}

/** How far above the traveller's budget a merchant will pitch its opening offer. */
const OPENING_STRETCH: Record<string, number> = {
  maximize_revenue: 1.15,
  increase_package_value: 1.12,
  protect_margin: 1.1,
  maximize_occupancy: 1.0,
  move_unsold_inventory: 1.0
}

const OBJECTIVE_WEIGHTS = [3, 2, 1, 1, 1]

const requirementsOf = (intent: TravelIntent, strength: RequirementStrength): Attribute[] =>
  (Object.entries(intent.requirements) as [Attribute, RequirementStrength][])
    .filter(([, s]) => s === strength)
    .map(([a]) => a)

/**
 * Every legal add-on subset: at most one member of each named group, always
 * every locked add-on, never anything carrying an attribute the traveller ruled
 * out. Ungrouped add-ons are independently in or out.
 */
const addOnSubsets = (merchant: Merchant, avoid: Set<Attribute>): string[][] => {
  const locked = merchant.policy.locked_addons.filter(id => merchant.addons.some(a => a.id === id))

  const usable = merchant.addons.filter(
    a => !locked.includes(a.id) && !a.attributes.some(attr => avoid.has(attr))
  )

  const grouped = new Map<string, AddOn[]>()
  const ungrouped: AddOn[] = []

  for (const addon of usable) {
    if (addon.group) {
      const list = grouped.get(addon.group) ?? []

      list.push(addon)
      grouped.set(addon.group, list)
    } else {
      ungrouped.push(addon)
    }
  }

  // Each group contributes one choice: none, or exactly one of its members.
  let combos: string[][] = [[]]

  for (const members of grouped.values()) {
    const next: string[][] = []

    for (const combo of combos) {
      next.push(combo)
      for (const member of members) next.push([...combo, member.id])
    }

    combos = next
  }

  // Ungrouped add-ons are free binary choices. Cap the blow-up defensively.
  for (const addon of ungrouped.slice(0, 10)) {
    combos = combos.flatMap(combo => [combo, [...combo, addon.id]])
  }

  return combos.map(c => [...locked, ...c])
}

/**
 * Where an occupancy-driven merchant wants to land, as a fraction of the
 * traveller's budget. Not zero: a hotel chasing occupancy prices to fill the
 * room, not to give it away, and a quote at 20% of stated budget reads as a
 * downgrade rather than a bargain.
 */
const OCCUPANCY_TARGET_RATIO = 0.9

const scoreObjectives = (
  merchant: Merchant,
  room: Room,
  quote: Quote,
  reference: number
): number => {
  const maxInventory = Math.max(...merchant.rooms.map(r => r.inventory_available), 1)
  const addonCount = quote.lines.filter(l => l.kind === 'addon').length
  const maxAddons = Math.max(merchant.addons.length, 1)

  let total = 0
  let weightSum = 0

  merchant.policy.objectives.forEach((objective, index) => {
    const weight = OBJECTIVE_WEIGHTS[index] ?? 1
    let value = 0

    switch (objective) {
      case 'maximize_revenue':
        value = reference > 0 ? Math.min(1, quote.total_price / reference) : 0
        break
      case 'protect_margin':
        value = Math.min(1, quote.margin_pct / 60)
        break

      case 'maximize_occupancy': {
        // Price to close, not to give away: peak at OCCUPANCY_TARGET_RATIO of
        // what the buyer will pay, falling off in both directions.
        const ratio = reference > 0 ? quote.total_price / reference : 0

        value = Math.max(0, 1 - Math.abs(ratio - OCCUPANCY_TARGET_RATIO) / OCCUPANCY_TARGET_RATIO)
        break
      }

      case 'move_unsold_inventory':
        value = room.inventory_available / maxInventory
        break
      case 'increase_package_value':
        value = addonCount / maxAddons
        break
    }

    total += weight * value
    weightSum += weight
  })

  return weightSum > 0 ? total / weightSum : 0
}

/** Enumerate every legal package for this merchant against this intent. */
export const enumerateCandidates = ({
  merchant,
  intent,
  nights,
  travelers,
  allowed_check_ins,
  target_price,
  preserve = [],
  previous = null,
  substitution_allowed = null
}: PlanInput): PlanCandidate[] => {
  const avoid = new Set(requirementsOf(intent, 'avoid'))
  const required = new Set<Attribute>([...requirementsOf(intent, 'required'), ...preserve])
  const preferred = requirementsOf(intent, 'preferred')

  const stretch = Math.max(...merchant.policy.objectives.map(o => OPENING_STRETCH[o] ?? 1))

  // Two different numbers that were previously conflated:
  //   ceiling  , the highest price a package may carry at all
  //   reference. What the buyer will actually pay, which is what the
  //               merchant's objectives are measured against
  // Scoring against the stretched ceiling made every merchant behave as though
  // the budget were 15% larger than the traveller ever said.
  const ceiling = target_price ?? Math.round(intent.budget.max * stretch)
  const reference = target_price ?? intent.budget.max

  // Which rooms may we consider? A revision that is not allowed to change room
  // category is stuck with the room it already offered.
  const roomLocked =
    previous && substitution_allowed !== null && !substitution_allowed.includes('room_category')

  /*
   * Which rooms can hold this party, and in how many units.
   *
   * The previous filter was `max_occupancy >= travelers`, which required ONE
   * room to sleep everybody. A party of four then eliminated every property
   * whose largest room sleeps two, so four travellers asking for two rooms got
   * a withdrawal from a hotel with forty free doubles. Occupancy is a per-room
   * limit; the party is fitted across rooms, not into one.
   */
  const rooms = merchant.rooms
    .filter(room => !roomLocked || room.id === previous?.room_id)
    .map(room => ({ room, count: roomsNeeded(room, travelers, intent.rooms) }))
    .filter(({ room, count }) => room.inventory_available >= count)

  const subsets = addOnSubsets(merchant, avoid)
  const candidates: PlanCandidate[] = []

  const dates = allowed_check_ins.length > 0 ? allowed_check_ins : [previous?.check_in ?? ''].filter(Boolean)

  for (const checkIn of dates) {
    for (const { room, count } of rooms) {
      for (const addonIds of subsets) {
      // Honour substitution limits: groups the buyer did not open up must match
      // whatever the previous round already contained.
      if (previous && substitution_allowed !== null && !sameOutsideAllowedGroups(merchant, previous.addon_ids, addonIds, substitution_allowed))
        continue

      const bundle: Bundle = {
        room_id: room.id,
        addon_ids: addonIds,
        discount_pct: 0,
        check_in: checkIn,
        room_count: count
      }

      let quote: Quote

      try {
        quote = computeQuote(merchant, bundle, nights, travelers)
      } catch {
        continue
      }

      const delivered = new Set(quote.attributes)
      const satisfiesRequired = [...required].every(a => delivered.has(a))

      if (!satisfiesRequired) continue
      if ([...avoid].some(a => delivered.has(a))) continue

      const { floor, binding } = minimumAllowedPrice(merchant, bundle, nights, travelers)

      // Land the package at or under the ceiling if policy allows it.
      let finalBundle = bundle
      let finalQuote = quote

      if (quote.list_price > ceiling) {
        const discount = discountToReach(merchant, bundle, nights, travelers, ceiling)

        if (discount === null) continue // no legal discount reaches the ceiling

        finalBundle = { ...bundle, discount_pct: discount }
        finalQuote = computeQuote(merchant, finalBundle, nights, travelers)
      }

      if (finalQuote.total_price < floor) continue

      const preferredHit = preferred.filter(a => delivered.has(a)).length

      candidates.push({
        bundle: finalBundle,
        quote: finalQuote,
        floor,
        binding,
        max_discount_pct: maxAllowedDiscountPct(merchant, bundle, nights, travelers),
        objective_score: scoreObjectives(merchant, room, finalQuote, reference),
        satisfies_required: true,
        preferred_hit: preferredHit,
        preferred_total: preferred.length
      })
      }
    }
  }

  /* Preferences first (they are what wins the buyer-side score), then the
     merchant's own objectives, then price as a stable tie-break. */
  return candidates.sort(
    (a, b) =>
      b.preferred_hit - a.preferred_hit ||
      b.objective_score - a.objective_score ||
      b.quote.total_price - a.quote.total_price ||
      a.bundle.room_id.localeCompare(b.bundle.room_id)
  )
}

const sameOutsideAllowedGroups = (
  merchant: Merchant,
  previousIds: string[],
  nextIds: string[],
  allowed: string[]
): boolean => {
  const groupOf = (id: string) => merchant.addons.find(a => a.id === id)?.group ?? `__solo_${id}`

  const frozen = (ids: string[]) =>
    new Set(ids.filter(id => !allowed.includes(groupOf(id)) && groupOf(id) !== null))

  const before = frozen(previousIds)
  const after = frozen(nextIds)

  if (before.size !== after.size) return false

  for (const id of before) if (!after.has(id)) return false

  return true
}

/** The single best legal package, or null if the merchant genuinely has none. */
export const planBundle = (input: PlanInput): PlanCandidate | null =>
  enumerateCandidates(input)[0] ?? null

/**
 * Why a merchant has nothing to offer. Used to produce an honest withdrawal
 * rather than a silent absence.
 */
export const explainNoCandidate = (input: PlanInput): string => {
  const { merchant, intent, nights, travelers, target_price, allowed_check_ins } = input
  const required = requirementsOf(intent, 'required')

  // With nothing to quote for, the price search below reduces to Math.min() of
  // an empty list, and every merchant declined citing a lowest price of INF.
  // The date window is the problem, and saying so is the only useful answer.
  if (allowed_check_ins.length === 0)
    return `No bookable check-in date: every date in the traveller's window has already passed.`

  const fitting = merchant.rooms
    .map(room => ({ room, count: roomsNeeded(room, travelers, intent.rooms) }))
    .filter(({ room, count }) => room.inventory_available >= count)

  // Naming the shortfall matters: "we cannot sleep four" and "we have one of
  // those left and you need two" are different problems, and only the second
  // one is worth the traveller asking about a different date.
  if (fitting.length === 0) {
    const wanted = intent.rooms === null ? null : intent.rooms

    const short = merchant.rooms
      .map(room => ({ room, count: roomsNeeded(room, travelers, intent.rooms) }))
      .filter(({ room }) => room.inventory_available > 0)

    if (short.length > 0) {
      const best = short.sort((a, b) => b.room.inventory_available - a.room.inventory_available)[0]

      return (
        `${merchant.name} would need ${best.count} × ${best.room.name} for ${travelers} ` +
        `guest${travelers === 1 ? '' : 's'}${wanted === null ? '' : ` at ${wanted} room${wanted === 1 ? '' : 's'}`}, ` +
        `and has ${best.room.inventory_available} available.`
      )
    }

    return `No room at ${merchant.name} has availability for ${travelers} guest${travelers === 1 ? '' : 's'}.`
  }

  const canDeliver = fitting.map(f => f.room).filter(room => {
    const delivered = new Set<Attribute>([...merchant.attributes, ...room.attributes])
    const reachable = merchant.addons.flatMap(a => a.attributes)

    reachable.forEach(a => delivered.add(a))

    return required.every(a => delivered.has(a))
  })

  if (canDeliver.length === 0)
    return `${merchant.name} cannot deliver ${required.join(', ')} from any available room.`

  const target = target_price ?? intent.budget.max

  const cheapest = Math.min(
    ...canDeliver.map(room => {
      // Price the cheapest acceptable date, the merchant's best possible case.
      const floors = (allowed_check_ins.length > 0 ? allowed_check_ins : ['']).filter(Boolean).map(checkIn => {
        const bundle: Bundle = {
          room_id: room.id,
          addon_ids: merchant.policy.locked_addons,
          discount_pct: 0,
          check_in: checkIn,
          room_count: roomsNeeded(room, travelers, intent.rooms)
        }

        try {
          return minimumAllowedPrice(merchant, bundle, nights, travelers).floor
        } catch {
          return Infinity
        }
      })

      try {
        return Math.min(...floors)
      } catch {
        return Infinity
      }
    })
  )

  if (cheapest > target)
    return `${merchant.name}'s lowest policy-compliant price for a qualifying room is ₹${cheapest.toLocaleString('en-IN')}, above the ₹${target.toLocaleString('en-IN')} target.`

  return `${merchant.name} has no package that satisfies every constraint at or under ₹${target.toLocaleString('en-IN')}.`
}

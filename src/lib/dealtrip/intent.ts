/**
 * Travel intent extraction.
 *
 * Natural language in, a structured intent out. Bound to the closed attribute
 * vocabulary so that "beachfront" means the same token to the traveller, the
 * merchant catalog, the guard and the scorer.
 *
 * The user always sees and can edit the result before anything is negotiated.
 * A silently misread hard constraint is the single worst failure this product
 * can have, so the parse is a checkpoint rather than a step.
 */
import { z } from 'zod'

import { structured } from './llm'
import { ATTRIBUTES, ATTRIBUTE_LABELS, BudgetSchema, IntentExtractionSchema } from './types'

import type { Attribute, IntentExtraction, RequirementStrength } from './types'
import type { LlmResult } from './llm'

const VOCAB = ATTRIBUTES.map(a => `${a} (${ATTRIBUTE_LABELS[a]})`).join(', ')

const SYSTEM = `You convert a traveller's free-text request into a structured travel intent for a commerce system.

Return ONLY a JSON object with exactly these keys:
{
  "destination": string,              // city or region, Title Case, e.g. "Goa"
  "travelers": integer | null,        // number of people, null if not stated
  "rooms": integer | null,            // rooms they asked for, null if they did not say
  "duration_nights": integer | null,  // null if the traveller never said how long
  "budget": { "max": integer | null, "currency": "INR", "type": "hard_constraint" | "soft_target" },
  "requirements": { "<attribute>": "required" | "preferred" | "avoid" },
  "date_flexibility_days": integer | null, // 0 if they gave fixed dates
  "check_in": string | null,          // ISO yyyy-mm-dd, or null if unspecified
  "priority": "lowest_price" | "best_value" | "best_experience",
  "ambiguities": string[],            // things you could not resolve, max 6
  "restatement": string               // one sentence the traveller can check
}

Rules that matter:
- Write plainly: never use em dashes or en dashes. Use commas or full stops.
- "requirements" keys MUST come from this list and nothing else: ${VOCAB}
- Use "required" only for things the traveller stated as essential, non-negotiable,
  a must, or a deal-breaker. Use "preferred" for things framed as nice, ideally,
  hopefully, would like. Use "avoid" for things they ruled out.
- "rooms" is how many rooms they asked for, not how many people. "2 rooms for 4
  people" is rooms 2 and travelers 4. "a room for 4" is rooms null and travelers 4.
  Leave rooms null unless they actually named a number of rooms.
- budget.type is "hard_constraint" when they say hard limit, max, no more than,
  cannot go over, strictly. Otherwise "soft_target".
- budget.max is the TOTAL trip budget in whole rupees. "60k" means 60000.
- priority: "lowest_price" if they emphasise cheapness, "best_experience" if they
  emphasise quality and barely mention money, otherwise "best_value".
- Never invent a requirement the traveller did not express. An empty requirements
  object is a valid and honest answer.
- If something is genuinely unclear, say so in "ambiguities" rather than guessing.
- travelers, duration_nights, budget.max and date_flexibility_days may be null when
  the traveller genuinely did not say. Null is the correct answer there, and a safe
  default is filled in afterwards and shown to them. Never invent a number to avoid
  a null: a guessed trip length is a constraint merchants get held to.`

/* ------------------------------------------------------------------ *
 * Deterministic fallback
 *
 * Used when there is no API key, the endpoint is down, or the model fails
 * validation twice. Deliberately conservative: it would rather leave a
 * requirement out and let the user add it than assert one the traveller
 * never said.
 * ------------------------------------------------------------------ */

const WORD_NUMBERS: Record<string, number> = {
  one: 1, two: 2, three: 3, four: 4, five: 5, six: 6,
  seven: 7, eight: 8, nine: 9, ten: 10, a: 1, an: 1, couple: 2, few: 3
}

/** Phrases that imply an attribute. First match wins. */
const ATTRIBUTE_CUES: [Attribute, RegExp][] = [
  ['beachfront', /\b(beach\s?front|on the beach|by the beach|beach[- ]?facing|right on the sand|steps from the (beach|sand))\b/i],
  ['sea_view', /\b(sea[- ]?view|ocean[- ]?view|sea facing|ocean facing|view of the (sea|ocean))\b/i],
  ['breakfast', /\bbreakfast\b/i],
  ['all_meals', /\b(all meals|full board|all[- ]inclusive)\b/i],
  ['airport_transfer', /\b(airport (transfer|pickup|pick[- ]?up|drop)|transfers?)\b/i],
  ['private_transfer', /\bprivate (transfer|car|cab)\b/i],
  ['pool', /\b(pool|swimming pool)\b/i],
  ['spa', /\bspa\b/i],
  ['gym', /\b(gym|fitness)\b/i],
  ['wifi', /\b(wi[- ]?fi|internet)\b/i],
  ['air_conditioning', /\b(a\/?c|air[- ]condition)/i],
  ['balcony', /\bbalcon(y|ies)\b/i],
  ['romantic', /\b(romantic|honeymoon|anniversary|just the two of us)\b/i],
  ['family_friendly', /\b(family|kids?|children|toddler)\b/i],
  ['pet_friendly', /\b(pet|dog|cat)[- ]friendly\b/i],
  ['quiet', /\b(quiet|peaceful|secluded|away from the crowds)\b/i],
  ['city_center', /\b(city cent(re|er)|downtown|in town)\b/i],
  ['nightlife_nearby', /\b(nightlife|clubs?|party|bars nearby)\b/i],
  ['water_sports', /\b(water sports|jet ski|snorkel|scuba|diving|parasail)\b/i],
  ['late_checkout', /\blate check[- ]?out\b/i],
  ['early_checkin', /\bearly check[- ]?in\b/i],
  ['free_cancellation', /\b(free cancellation|refundable|cancel for free)\b/i],
  ['kitchenette', /\b(kitchen(ette)?|self[- ]cater)/i],
  ['workspace', /\b(workspace|desk|work from|remote work)\b/i]
]

const REQUIRED_CUES = /\b(essential|must|non[- ]negotiable|deal[- ]?breaker|need|require[ds]?|has to|have to|mandatory|only if|strictly)\b/i
const AVOID_CUES = /\b(no|not|without|avoid|don'?t want|nothing with|rather not)\b/i
const PREFERRED_CUES = /\b(prefer|prefera|nice|ideally|hopefully|would like|would love|bonus|if possible|good to have)\b/i

const CLAUSE_DELIMITERS = ['.', ',', ';', ':', '!', '?', '\u2014', '\n']

/**
 * The clause the cue sits in, not a fixed character window.
 *
 * "Beachfront is essential, breakfast would be nice" is one string and two
 * completely different commitments. A 60-character window straddles the comma
 * and reads "essential" onto breakfast, silently promoting a nice-to-have into
 * a hard constraint. Clause boundaries are the only thing that separates them.
 */
const clauseAround = (text: string, at: number, length: number): string => {
  const before = text.slice(0, at)
  const after = text.slice(at + length)

  const start = Math.max(...CLAUSE_DELIMITERS.map(d => before.lastIndexOf(d))) + 1

  const end = Math.min(
    ...CLAUSE_DELIMITERS.map(d => {
      const i = after.indexOf(d)

      return i === -1 ? after.length : i
    })
  )

  return text.slice(start, at + length + end)
}

/** Strength is judged from the clause the cue sits in. */
const strengthFor = (text: string, match: RegExpMatchArray): RequirementStrength => {
  const clause = clauseAround(text, match.index ?? 0, match[0].length)

  if (AVOID_CUES.test(clause) && !REQUIRED_CUES.test(clause)) return 'avoid'
  if (REQUIRED_CUES.test(clause)) return 'required'
  if (PREFERRED_CUES.test(clause)) return 'preferred'

  return 'preferred'
}

const parseCount = (text: string, unitPattern: string): number | null => {
  const numeric = text.match(new RegExp(`(\\d+)\\s*${unitPattern}`, 'i'))

  if (numeric) return parseInt(numeric[1], 10)

  const worded = text.match(new RegExp(`\\b(${Object.keys(WORD_NUMBERS).join('|')})\\s*${unitPattern}`, 'i'))

  return worded ? WORD_NUMBERS[worded[1].toLowerCase()] : null
}

const parseBudget = (text: string): number | null => {
  // ₹60,000 · Rs 60000 · INR 60k · "60k" · "60 thousand"
  const k = text.match(/(?:₹|rs\.?|inr)?\s*(\d+(?:\.\d+)?)\s*(k|thousand)\b/i)

  if (k) return Math.round(parseFloat(k[1]) * 1000)

  const lakh = text.match(/(?:₹|rs\.?|inr)?\s*(\d+(?:\.\d+)?)\s*(lakh|lac)\b/i)

  if (lakh) return Math.round(parseFloat(lakh[1]) * 100_000)

  const plain = text.match(/(?:₹|rs\.?|inr)\s*([\d,]{3,})/i)

  if (plain) return parseInt(plain[1].replace(/,/g, ''), 10)

  const budgetWord = text.match(/budget[^\d]{0,20}([\d,]{4,})/i)

  return budgetWord ? parseInt(budgetWord[1].replace(/,/g, ''), 10) : null
}

export const heuristicIntent = (raw: string, knownDestinations: string[]): IntentExtraction => {
  const text = raw.trim()
  const ambiguities: string[] = []

  /* destination. Prefer a marketplace we actually have inventory for */
  let destination = knownDestinations.find(d => new RegExp(`\\b${d}\\b`, 'i').test(text)) ?? ''

  if (!destination) {
    const proper = text.match(/\b(?:in|to|at|for)\s+([A-Z][a-zA-Z]+(?:\s[A-Z][a-zA-Z]+)?)/)

    destination = proper ? proper[1] : ''
    if (!destination) ambiguities.push('No destination was recognised. Please set it.')
  }

  const travelers = parseCount(text, '(?:people|persons?|adults?|travell?ers?|guests?|pax)') ??
    (/\bfor (two|2)\b|\bcouple\b/i.test(text) ? 2 : null) ?? 2

  if (!/\b(people|persons?|adults?|travell?ers?|guests?|pax|couple|for (two|2))\b/i.test(text))
    ambiguities.push('Party size was not stated; assumed 2 travellers.')

  /*
   * Rooms, and the trap that comes with them.
   *
   * "2 rooms" is a count. "a room for 2" is a party size that happens to sit
   * next to the word room, and reading it as two rooms would double the bill.
   * Only a number that PRECEDES the noun is a count, which is what parseCount
   * matches, so "room for 4 people" yields nothing here and 4 above.
   */
  const rooms = parseCount(text, 'rooms?')

  const nights = parseCount(text, 'nights?') ?? (parseCount(text, 'days?') ?? 4) - 1

  if (!/night|day/i.test(text)) ambiguities.push('Trip length was not stated; assumed 3 nights.')

  const budgetMax = parseBudget(text)

  if (budgetMax === null) ambiguities.push('No budget was found. Set one before negotiating.')

  const hard = /\b(hard (limit|budget|cap)|max(imum)?|no more than|not (more|over)|cannot go over|can'?t go over|strict|absolute|firm|ceiling|all[- ]in)\b/i.test(text)

  const requirements: Partial<Record<Attribute, RequirementStrength>> = {}

  for (const [attribute, pattern] of ATTRIBUTE_CUES) {
    const match = text.match(pattern)

    if (match) requirements[attribute] = strengthFor(text, match)
  }

  const flexMatch = text.match(/flexib\w*[^.]{0,30}?(\d+|a couple of|couple of|few)\s*days?/i)
  const flexRaw = flexMatch?.[1]?.toLowerCase()

  const flexibility = flexRaw
    ? /\d/.test(flexRaw)
      ? parseInt(flexRaw, 10)
      : (WORD_NUMBERS[flexRaw.replace(/^a couple of$|^couple of$/, 'couple')] ?? 2)
    : /\bflexib/i.test(text)
      ? 2
      : 0

  // Deliberately not triggered by the bare word "budget": stating a budget is
  // not the same as being price-driven. Almost every traveller states a budget.
  const priority: IntentExtraction['priority'] = /\b(cheap(est|er)?|as (cheap|little) as|lowest price|tight budget|save money|budget[- ]friendly|bare minimum|spend as little)\b/i.test(text)
    ? 'lowest_price'
    : /\b(luxur|splurge|best possible|treat (ourselves|myself)|premium|no expense|nothing but the best|special occasion|money is no object)\b/i.test(text)
      ? 'best_experience'
      : 'best_value'

  const requiredList = (Object.entries(requirements) as [Attribute, RequirementStrength][])
    .filter(([, s]) => s === 'required')
    .map(([a]) => ATTRIBUTE_LABELS[a].toLowerCase())

  const bounded = withinLimits(
    {
      destination: destination || 'Goa',
      travelers,
      rooms,
      duration_nights: nights,
      budget: {
        max: budgetMax ?? UNSTATED.budget_max,
        currency: 'INR' as const,
        type: (hard ? 'hard_constraint' : 'soft_target') as 'hard_constraint' | 'soft_target'
      },
      requirements,
      date_flexibility_days: flexibility,
      check_in: null,
      priority,
      notes: ''
    },
    ambiguities
  )

  return {
    ...bounded,
    ambiguities: ambiguities.slice(0, 6),
    restatement:
      `${bounded.duration_nights} night${bounded.duration_nights === 1 ? '' : 's'} in ${bounded.destination} ` +
      `for ${bounded.travelers}` +
      `${bounded.rooms ? ` in ${bounded.rooms} room${bounded.rooms === 1 ? '' : 's'}` : ''}, ` +
      `up to ${bounded.budget.max.toLocaleString('en-IN')} rupees` +
      (requiredList.length ? `, with ${requiredList.join(' and ')} as must-have${requiredList.length === 1 ? '' : 's'}.` : '.')
  }
}

/* ------------------------------------------------------------------ *
 * What the model is allowed to say it does not know
 *
 * The strict intent schema requires a number for trip length, party size and
 * budget. Asked for a trip with no length stated, a well behaved model returns
 * `duration_nights: null`, which is the honest answer, and validation threw it
 * away as invalid output. The whole extraction then fell back to the regex
 * parser, and the UI told the traveller the language model was unavailable
 * when it had in fact answered correctly.
 *
 * So the model-facing schema accepts null on exactly the fields a traveller
 * plausibly leaves out, and the defaults are filled here rather than by the
 * model. That matters: a model pressed to produce a number invents one, and an
 * invented trip length is not a harmless guess, it is a constraint every
 * merchant is then held to. Filling it here also means the assumption is
 * announced in `ambiguities`, where the traveller can see and correct it,
 * which is the same contract the fallback parser already honours.
 * ------------------------------------------------------------------ */

const UNSTATED = {
  travelers: 2,
  nights: 3,
  budget_max: 60_000,
  flexibility: 0
} as const

/**
 * The bounds the rest of the system is built on, and the one place an
 * out-of-range number is brought inside them.
 *
 * Both paths need this, for the same reason and with different urgency.
 *
 * The model can return 400 nights. The regex parser can too: "400 nights for
 * 90 people" is a perfectly good match for its patterns. And the fallback's
 * output was never validated, so it flowed out of a function whose whole
 * purpose is to be the thing that cannot fail, into an endpoint that rejected
 * it with a 502. That failure landed precisely when the model was already
 * down, which is the one moment the fallback exists to cover.
 *
 * Clamping rather than rejecting is deliberate. Somebody who types 400 nights
 * has made a typo or is testing the box; either way "45 nights is more than we
 * can book, using 30" tells them what happened and leaves them a field to fix,
 * where a server error tells them DealTrip is broken.
 */
const LIMITS = {
  travelers: { min: 1, max: 20, unit: 'travellers' },
  rooms: { min: 1, max: 10, unit: 'rooms' },
  duration_nights: { min: 1, max: 30, unit: 'nights' },
  date_flexibility_days: { min: 0, max: 14, unit: 'days' }
} as const

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, Math.trunc(Number.isFinite(value) ? value : min)))

/**
 * Bring the numeric fields inside their bounds, appending a note for anything
 * that actually moved. Mutates `notes` rather than returning them separately
 * so both callers can interleave these with their own assumptions.
 */
const withinLimits = <T extends {
  travelers: number
  rooms: number | null
  duration_nights: number
  date_flexibility_days: number
  check_in: string | null
  budget: { max: number }
}>(
  intent: T,
  notes: string[]
): T => {
  const fix = (key: keyof typeof LIMITS, given: number) => {
    const { min, max, unit } = LIMITS[key]
    const used = clamp(given, min, max)

    if (used !== given) notes.push(`${given} ${unit} is outside what can be booked here, using ${used}.`)

    return used
  }

  /*
   * A check-in that has already been and gone.
   *
   * `resolveCheckIns` filters past dates out of the window, correctly, and an
   * empty window then made every merchant withdraw. The reason they gave was
   * "lowest policy-compliant price is INF", because an empty date list reduces
   * to `Math.min()` of nothing. So a typo in a year produced five merchants
   * declining for a reason that was not true and could not be acted on.
   *
   * Dropping it to null is the honest correction: they clearly meant a date,
   * we cannot tell which, and the merchant proposing one is the existing
   * behaviour for a traveller who never gave one.
   */
  const today = new Date().toISOString().slice(0, 10)
  const checkIn = intent.check_in !== null && intent.check_in < today ? null : intent.check_in

  if (checkIn !== intent.check_in) notes.push(`${intent.check_in} has already passed, so the dates are open.`)

  // A budget of zero or less is not a cheap trip, it is an unusable number, and
  // every merchant would withdraw against it for a reason the traveller could
  // not act on.
  const budgetMax = Math.trunc(intent.budget.max)
  const budget = budgetMax > 0 ? budgetMax : UNSTATED.budget_max

  if (budget !== budgetMax)
    notes.push(`A budget of ${budgetMax} cannot be booked against, using ${budget.toLocaleString('en-IN')} rupees.`)

  return {
    ...intent,
    check_in: checkIn,
    travelers: fix('travelers', intent.travelers),
    rooms: intent.rooms === null ? null : fix('rooms', intent.rooms),
    duration_nights: fix('duration_nights', intent.duration_nights),
    date_flexibility_days: fix('date_flexibility_days', intent.date_flexibility_days),
    budget: { ...intent.budget, max: budget }
  }
}

/**
 * A model that leaves a field null usually also lists it in `ambiguities`, in
 * its own words ("trip length in nights"). Announcing the assumption ourselves
 * would then say the same thing twice in one list, and the six-item cap means
 * the duplicate crowds out a real ambiguity. Ours wins because it names the
 * value that was actually filled in.
 */
const RESTATED_BY_US: Record<'travelers' | 'nights' | 'budget', RegExp> = {
  travelers: /\b(travell?ers?|party size|number of (people|guests)|group size|how many)\b/i,
  nights: /\b(nights?|duration|trip length|how long|length of (stay|trip))\b/i,
  budget: /\bbudget|price range|spend\b/i
}

const ExtractionResponseSchema = IntentExtractionSchema.extend({
  // Bounds are deliberately dropped here and reapplied by `withinLimits`. A
  // model that answers "45 nights" has understood the request and overshot a
  // limit it was never told about; throwing the whole extraction away over it
  // loses the destination, the budget and every requirement too.
  travelers: z.number().int().nullable(),
  rooms: z.number().int().nullable().default(null),
  duration_nights: z.number().int().nullable(),
  budget: BudgetSchema.extend({ max: z.number().int().nullable() }),
  date_flexibility_days: z.number().int().nullable()
}).transform((raw): IntentExtraction => {
  const assumed: string[] = []
  const covered: RegExp[] = []

  if (raw.travelers === null) {
    assumed.push(`Party size was not stated; assumed ${UNSTATED.travelers} travellers.`)
    covered.push(RESTATED_BY_US.travelers)
  }

  if (raw.duration_nights === null) {
    assumed.push(`Trip length was not stated; assumed ${UNSTATED.nights} nights.`)
    covered.push(RESTATED_BY_US.nights)
  }

  if (raw.budget.max === null) {
    assumed.push(`Budget was not stated; assumed ${UNSTATED.budget_max.toLocaleString('en-IN')} rupees.`)
    covered.push(RESTATED_BY_US.budget)
  }

  const bounded = withinLimits(
    {
      ...raw,
      travelers: raw.travelers ?? UNSTATED.travelers,
      duration_nights: raw.duration_nights ?? UNSTATED.nights,
      budget: { ...raw.budget, max: raw.budget.max ?? UNSTATED.budget_max },
      date_flexibility_days: raw.date_flexibility_days ?? UNSTATED.flexibility
    },
    assumed
  )

  return {
    ...bounded,

    // Assumptions first: they are the ones the traveller most needs to correct,
    // and the list is capped at six.
    ambiguities: [...assumed, ...raw.ambiguities.filter(a => !covered.some(re => re.test(a)))].slice(0, 6)
  }
}) satisfies z.ZodType<IntentExtraction>

export const extractIntent = async (
  raw: string,
  knownDestinations: string[]
): Promise<LlmResult<IntentExtraction>> =>
  structured({
    label: 'intent.extract',
    schema: ExtractionResponseSchema,
    system: SYSTEM,
    user:
      `Destinations this marketplace currently has inventory for: ${knownDestinations.join(', ')}.\n` +
      `Today is ${new Date().toISOString().slice(0, 10)}.\n\n` +
      `Traveller's request:\n"""\n${raw}\n"""`,
    fallback: () => heuristicIntent(raw, knownDestinations),
    temperature: 0.1,
    max_tokens: 700
  })

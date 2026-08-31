/**
 * Travel intent extraction.
 *
 * Natural language in, a structured intent out — bound to the closed attribute
 * vocabulary so that "beachfront" means the same token to the traveller, the
 * merchant catalog, the guard and the scorer.
 *
 * The user always sees and can edit the result before anything is negotiated.
 * A silently misread hard constraint is the single worst failure this product
 * can have, so the parse is a checkpoint rather than a step.
 */
import { structured } from './llm'
import { ATTRIBUTES, ATTRIBUTE_LABELS, IntentExtractionSchema } from './types'

import type { Attribute, IntentExtraction, RequirementStrength } from './types'
import type { LlmResult } from './llm'

const VOCAB = ATTRIBUTES.map(a => `${a} (${ATTRIBUTE_LABELS[a]})`).join(', ')

const SYSTEM = `You convert a traveller's free-text request into a structured travel intent for a commerce system.

Return ONLY a JSON object with exactly these keys:
{
  "destination": string,              // city or region, Title Case, e.g. "Goa"
  "travelers": integer,               // number of people
  "duration_nights": integer,
  "budget": { "max": integer, "currency": "INR", "type": "hard_constraint" | "soft_target" },
  "requirements": { "<attribute>": "required" | "preferred" | "avoid" },
  "date_flexibility_days": integer,   // 0 if they gave fixed dates
  "check_in": string | null,          // ISO yyyy-mm-dd, or null if unspecified
  "priority": "lowest_price" | "best_value" | "best_experience",
  "ambiguities": string[],            // things you could not resolve, max 6
  "restatement": string               // one sentence the traveller can check
}

Rules that matter:
- "requirements" keys MUST come from this list and nothing else: ${VOCAB}
- Use "required" only for things the traveller stated as essential, non-negotiable,
  a must, or a deal-breaker. Use "preferred" for things framed as nice, ideally,
  hopefully, would like. Use "avoid" for things they ruled out.
- budget.type is "hard_constraint" when they say hard limit, max, no more than,
  cannot go over, strictly. Otherwise "soft_target".
- budget.max is the TOTAL trip budget in whole rupees. "60k" means 60000.
- priority: "lowest_price" if they emphasise cheapness, "best_experience" if they
  emphasise quality and barely mention money, otherwise "best_value".
- Never invent a requirement the traveller did not express. An empty requirements
  object is a valid and honest answer.
- If something is genuinely unclear, say so in "ambiguities" rather than guessing.`

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
 * The clause the cue sits in — not a fixed character window.
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

  /* destination — prefer a marketplace we actually have inventory for */
  let destination = knownDestinations.find(d => new RegExp(`\\b${d}\\b`, 'i').test(text)) ?? ''

  if (!destination) {
    const proper = text.match(/\b(?:in|to|at|for)\s+([A-Z][a-zA-Z]+(?:\s[A-Z][a-zA-Z]+)?)/)

    destination = proper ? proper[1] : ''
    if (!destination) ambiguities.push('No destination was recognised — please set it.')
  }

  const travelers = parseCount(text, '(?:people|persons?|adults?|travell?ers?|guests?|pax)') ??
    (/\bfor (two|2)\b|\bcouple\b/i.test(text) ? 2 : null) ?? 2

  if (!/\b(people|persons?|adults?|travell?ers?|guests?|pax|couple|for (two|2))\b/i.test(text))
    ambiguities.push('Party size was not stated; assumed 2 travellers.')

  const nights = parseCount(text, 'nights?') ?? (parseCount(text, 'days?') ?? 4) - 1

  if (!/night|day/i.test(text)) ambiguities.push('Trip length was not stated; assumed 3 nights.')

  const budgetMax = parseBudget(text)

  if (budgetMax === null) ambiguities.push('No budget was found — set one before negotiating.')

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

  return {
    destination: destination || 'Goa',
    travelers: Math.max(1, travelers),
    duration_nights: Math.max(1, nights),
    budget: {
      max: budgetMax ?? 60_000,
      currency: 'INR',
      type: hard ? 'hard_constraint' : 'soft_target'
    },
    requirements,
    date_flexibility_days: Math.min(14, flexibility),
    check_in: null,
    priority,
    notes: '',
    ambiguities: ambiguities.slice(0, 6),
    restatement:
      `${Math.max(1, nights)} night${nights === 1 ? '' : 's'} in ${destination || 'Goa'} for ${travelers}, ` +
      `up to ${(budgetMax ?? 60_000).toLocaleString('en-IN')} rupees` +
      (requiredList.length ? `, with ${requiredList.join(' and ')} as must-have${requiredList.length === 1 ? '' : 's'}.` : '.')
  }
}

export const extractIntent = async (
  raw: string,
  knownDestinations: string[]
): Promise<LlmResult<IntentExtraction>> =>
  structured({
    label: 'intent.extract',
    schema: IntentExtractionSchema,
    system: SYSTEM,
    user:
      `Destinations this marketplace currently has inventory for: ${knownDestinations.join(', ')}.\n` +
      `Today is ${new Date().toISOString().slice(0, 10)}.\n\n` +
      `Traveller's request:\n"""\n${raw}\n"""`,
    fallback: () => heuristicIntent(raw, knownDestinations),
    temperature: 0.1,
    max_tokens: 1200
  })

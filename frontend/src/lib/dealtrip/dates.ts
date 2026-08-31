/**
 * Date helpers for stay pricing.
 *
 * All dates are ISO calendar days ('YYYY-MM-DD') handled in UTC. A stay is
 * priced night by night, and a night is identified by the day it begins — so a
 * three-night stay from Friday covers the Friday, Saturday and Sunday nights.
 */

const MS_PER_DAY = 86_400_000

export const parseDay = (iso: string): number => {
  const ms = Date.parse(`${iso}T00:00:00Z`)

  if (Number.isNaN(ms)) throw new Error(`Not an ISO calendar date: "${iso}"`)

  return ms
}

export const toIso = (ms: number): string => new Date(ms).toISOString().slice(0, 10)

export const addDays = (iso: string, days: number): string => toIso(parseDay(iso) + days * MS_PER_DAY)

export const daysBetween = (from: string, to: string): number =>
  Math.round((parseDay(to) - parseDay(from)) / MS_PER_DAY)

/** Every night of a stay, as the day each night begins. */
export const nightsOf = (checkIn: string, nights: number): string[] =>
  Array.from({ length: nights }, (_, index) => addDays(checkIn, index))

/**
 * Friday and Saturday nights carry the weekend rate.
 *
 * Cost does not move with the day of the week, so a weekend night is worth more
 * to the merchant than a weekday one. That asymmetry is the whole point: it
 * gives a flexible traveller something real to trade, and gives the merchant a
 * genuine reason to prefer one date over another.
 */
export const isWeekendNight = (iso: string): boolean => {
  const day = new Date(parseDay(iso)).getUTCDay()

  return day === 5 || day === 6
}

export const countWeekendNights = (checkIn: string, nights: number): number =>
  nightsOf(checkIn, nights).filter(isWeekendNight).length

export const formatStay = (checkIn: string, nights: number): string => {
  const checkOut = addDays(checkIn, nights)
  const fmt = (iso: string) =>
    new Date(parseDay(iso)).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', timeZone: 'UTC' })

  return `${fmt(checkIn)} – ${fmt(checkOut)}`
}

export const weekdayName = (iso: string): string =>
  new Date(parseDay(iso)).toLocaleDateString('en-IN', { weekday: 'short', timeZone: 'UTC' })

/** The dates a traveller will accept, given their anchor and flexibility. */
export const allowedCheckIns = (anchor: string, flexibilityDays: number): string[] =>
  Array.from({ length: flexibilityDays * 2 + 1 }, (_, index) => addDays(anchor, index - flexibilityDays))

/** How far out a stay is anchored when the traveller names no date. */
export const DEFAULT_LEAD_DAYS = 21

/**
 * The check-in dates a traveller will accept.
 *
 * When they gave a date, it is that date plus or minus their stated
 * flexibility. When they gave none, we anchor a stay three weeks out and let
 * the flexibility apply around it — and the composer shows that resolved date,
 * so a stay is never quietly booked on a day nobody chose.
 */
export const resolveCheckIns = (
  checkIn: string | null,
  flexibilityDays: number,
  today: Date = new Date()
): string[] => {
  const anchor = checkIn ?? addDays(toIso(today.getTime()), DEFAULT_LEAD_DAYS)
  const earliest = toIso(today.getTime())

  // Never propose a stay that has already started.
  return allowedCheckIns(anchor, Math.max(0, flexibilityDays)).filter(date => date >= earliest)
}

/**
 * Model access.
 *
 * Three rules hold everywhere in this file:
 *
 *  1. Every call is schema-bound. A response that does not parse against its
 *     Zod schema is not "mostly fine", it is discarded.
 *  2. Every call has a deterministic fallback. If the key is missing, the API
 *     is down, or two attempts fail validation, the caller's own code produces
 *     the answer instead. DealTrip therefore has no single point of failure at
 *     a third-party inference endpoint, and the revenue simulator can run
 *     thousands of intents without spending a token.
 *  3. Nothing here returns money. Models choose ids and prose; `pricing.ts`
 *     turns choices into rupees.
 *
 * Provider-agnostic by construction: this is one `fetch` against an
 * OpenAI-compatible chat-completions endpoint. Swapping Groq for anything else
 * is a base-URL change.
 */
import type { z } from 'zod'

const GROQ_BASE_URL = process.env.LLM_BASE_URL ?? 'https://api.groq.com/openai/v1'
const DEFAULT_MODEL = process.env.GROQ_MODEL ?? 'openai/gpt-oss-120b'
const TIMEOUT_MS = Number(process.env.LLM_TIMEOUT_MS ?? 30_000)

/**
 * Concurrency cap.
 *
 * A negotiation fans out to every merchant at once, and five simultaneous
 * requests is enough to trip a rate limit, at which point every agent quietly
 * falls back to the planner and the demo shows nothing agentic at all. Failing
 * softly made the failure invisible, which is worse than failing loudly.
 * Capping in-flight calls keeps the model actually in the loop.
 */
const MAX_CONCURRENCY = Number(process.env.LLM_MAX_CONCURRENCY ?? 3)

/** Transport-level retries (429 / 5xx). Separate from schema-correction retries. */
const MAX_TRANSPORT_ATTEMPTS = Number(process.env.LLM_MAX_RETRIES ?? 3)

/**
 * Reasoning models spend tokens thinking before they emit anything, so the
 * completion budget has to cover the reasoning as well as the JSON or the
 * response is truncated mid-document and the API rejects its own output.
 *
 * But the ceiling must not be generous "just in case": Groq reserves
 * max_completion_tokens against the per-minute token budget rather than
 * metering what is actually produced. Measured usage on a merchant turn is
 * ~175 completion tokens at low effort, so the ceilings below sit at roughly
 * 4x headroom rather than 10x, which is the difference between four and six
 * agents negotiating per minute.
 */
const REASONING_EFFORT = process.env.LLM_REASONING_EFFORT ?? 'low'

class Semaphore {
  private active = 0
  private waiting: (() => void)[] = []

  constructor(private readonly limit: number) {}

  async run<T>(fn: () => Promise<T>): Promise<T> {
    if (this.active >= this.limit) await new Promise<void>(resolve => this.waiting.push(resolve))

    this.active += 1

    try {
      return await fn()
    } finally {
      this.active -= 1
      this.waiting.shift()?.()
    }
  }
}

declare global {
   
  var __dealtripLlmGate: Semaphore | undefined
}

const gate = (globalThis.__dealtripLlmGate ??= new Semaphore(MAX_CONCURRENCY))

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

/** Usage from the most recent successful call, for tuning the token ceiling. */
let lastUsage: { prompt: number; completion: number } = { prompt: 0, completion: 0 }

export type LlmSource = 'model' | 'fallback'

export interface LlmResult<T> {
  data: T
  source: LlmSource
  model: string
  latency_ms: number
  attempts: number

  /** Populated when the model was tried and did not work out. */
  error: string | null
}

export const llmConfigured = () => Boolean(process.env.GROQ_API_KEY)

interface StructuredArgs<T> {

  /** Short identifier used in logs and audit detail, e.g. "intent.extract". */
  label: string
  schema: z.ZodType<T>
  system: string
  user: string

  /** Produced when the model cannot be used or cannot be trusted. */
  fallback: () => T
  temperature?: number
  max_tokens?: number

  /** Set false to force the deterministic path. Used by the revenue simulator. */
  enabled?: boolean
}

/**
 * Strip typographic dashes from anything a model wrote.
 *
 * Merchant rationale and intent restatements are model prose that lands
 * directly in the interface, and models reach for em dashes constantly. Asking
 * them not to in the prompt is unreliable; rewriting at the boundary is not.
 * Applied to every string in a validated response, however deeply nested.
 */
const deDash = <T,>(value: T): T => {
  if (typeof value === 'string')
    return value
      .replace(/\s+[—–]\s+/g, ', ')
      .replace(/[—–]/g, '-') as unknown as T

  if (Array.isArray(value)) return value.map(deDash) as unknown as T

  if (value && typeof value === 'object')
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, deDash(v)])) as unknown as T

  return value
}

/** Models like to wrap JSON in prose or fences. Recover the object. */
const extractJson = (text: string): string => {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/)
  const candidate = (fenced ? fenced[1] : text).trim()

  const start = candidate.indexOf('{')
  const end = candidate.lastIndexOf('}')

  return start !== -1 && end > start ? candidate.slice(start, end + 1) : candidate
}

class TransportError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly retryAfterMs: number | null
  ) {
    super(message)
    this.name = 'TransportError'
  }
}

const callOnce = async (system: string, user: string, temperature: number, maxTokens: number) => {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)

  try {
    const res = await fetch(`${GROQ_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: DEFAULT_MODEL,
        temperature,
        max_completion_tokens: maxTokens,
        reasoning_effort: REASONING_EFFORT,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: user }
        ]
      }),
      signal: controller.signal
    })

    if (!res.ok) {
      const body = await res.text().catch(() => '')
      const header = res.headers.get('retry-after')
      const retryAfterMs = header ? Math.min(6_000, Math.ceil(parseFloat(header) * 1000)) : null

      throw new TransportError(
        `${res.status} ${res.statusText}${body ? ` - ${body.slice(0, 300)}` : ''}`,
        res.status,
        Number.isFinite(retryAfterMs as number) ? retryAfterMs : null
      )
    }

    const json = (await res.json()) as {
      choices?: { message?: { content?: string } }[]
      usage?: { prompt_tokens?: number; completion_tokens?: number; total_tokens?: number }
    }

    const content = json.choices?.[0]?.message?.content

    if (!content) throw new Error('Model returned no content')

    /*
     * Token accounting matters here beyond curiosity: Groq reserves
     * max_completion_tokens against the per-minute budget rather than metering
     * what is actually produced, so an over-generous ceiling throttles the whole
     * marketplace. Logging real usage is how that ceiling gets sized honestly.
     */
    lastUsage = {
      prompt: json.usage?.prompt_tokens ?? 0,
      completion: json.usage?.completion_tokens ?? 0
    }

    return content
  } finally {
    clearTimeout(timer)
  }
}

/** Retries rate limits and server errors; a 400 is our bug and is not retried. */
const callGroq = async (system: string, user: string, temperature: number, maxTokens: number) => {
  let lastError: unknown

  for (let attempt = 1; attempt <= MAX_TRANSPORT_ATTEMPTS; attempt++) {
    try {
      return await gate.run(() => callOnce(system, user, temperature, maxTokens))
    } catch (error) {
      lastError = error

      const retryable =
        error instanceof TransportError
          ? error.status === 429 || error.status >= 500
          : error instanceof Error && error.name === 'AbortError'

      if (!retryable || attempt === MAX_TRANSPORT_ATTEMPTS) throw error

      const hinted = error instanceof TransportError ? error.retryAfterMs : null
      const backoff = hinted ?? Math.min(8_000, 400 * 2 ** attempt) + Math.random() * 300

      await sleep(backoff)
    }
  }

  throw lastError
}

/**
 * Ask the model for a JSON object matching `schema`. Two attempts: the second
 * is shown exactly what was wrong with the first. Then the fallback, always.
 */
export const structured = async <T>({
  label,
  schema,
  system,
  user,
  fallback,
  temperature = 0.2,
  max_tokens = 1200,
  enabled = true
}: StructuredArgs<T>): Promise<LlmResult<T>> => {
  const started = Date.now()

  if (!enabled) {
    return {
      data: deDash(fallback()),
      source: 'fallback',
      model: 'deterministic',
      latency_ms: Date.now() - started,
      attempts: 0,
      error: null
    }
  }

  if (!llmConfigured()) {
    return {
      data: deDash(fallback()),
      source: 'fallback',
      model: 'deterministic',
      latency_ms: Date.now() - started,
      attempts: 0,
      error: 'GROQ_API_KEY is not set'
    }
  }

  let lastError = ''
  let correction = ''

  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const content = await callGroq(system, user + correction, temperature, max_tokens)
      const parsed = schema.safeParse(JSON.parse(extractJson(content)))

      if (parsed.success) {
        if (process.env.LLM_LOG_USAGE === '1')
          console.info(`[dealtrip:llm] ${label} prompt=${lastUsage.prompt} completion=${lastUsage.completion}`)

        return {
          data: parsed.data,
          source: 'model',
          model: DEFAULT_MODEL,
          latency_ms: Date.now() - started,
          attempts: attempt,
          error: null
        }
      }

      lastError = parsed.error.issues
        .slice(0, 6)
        .map(i => `${i.path.join('.') || '(root)'}: ${i.message}`)
        .join('; ')

      correction =
        `\n\nYour previous reply was rejected by schema validation: ${lastError}\n` +
        'Return corrected JSON only. No prose, no code fences.'
    } catch (error) {
      lastError = error instanceof Error ? error.message : String(error)
      correction = `\n\nYour previous reply could not be read as JSON (${lastError}). Return a single JSON object only.`
    }

    console.warn(`[dealtrip:llm] ${label} attempt ${attempt} failed - ${lastError}`)
  }

  return {
    data: deDash(fallback()),
    source: 'fallback',
    model: DEFAULT_MODEL,
    latency_ms: Date.now() - started,
    attempts: 2,
    error: lastError
  }
}

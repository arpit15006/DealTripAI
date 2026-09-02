/**
 * Intent extraction.
 *
 * The regression these cover: a model that correctly answered "the traveller
 * never said how long" was failing schema validation, so a working extraction
 * was discarded and the interface told the traveller the language model was
 * unavailable. Silent degradation to the regex parser is worse than a visible
 * error, because the parse is the checkpoint every later constraint rests on.
 */
import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { extractIntent } from '../intent'

/** Stands in for the provider so the model path is genuinely the one under test. */
const withModelReply = async <T>(payload: unknown, run: () => Promise<T>): Promise<T> => {
  const realFetch = globalThis.fetch
  const prevKey = process.env.GROQ_API_KEY

  process.env.GROQ_API_KEY = 'test-key'
  globalThis.fetch = (async () =>
    new Response(JSON.stringify({ choices: [{ message: { content: JSON.stringify(payload) } }] }), {
      status: 200,
      headers: { 'content-type': 'application/json' }
    })) as typeof fetch

  try {
    return await run()
  } finally {
    globalThis.fetch = realFetch
    if (prevKey === undefined) delete process.env.GROQ_API_KEY
    else process.env.GROQ_API_KEY = prevKey
  }
}

const reply = (over: Record<string, unknown>) => ({
  destination: 'Manali',
  travelers: 4,
  rooms: null,
  duration_nights: 3,
  budget: { max: 50_000, currency: 'INR', type: 'soft_target' },
  requirements: {},
  date_flexibility_days: 0,
  check_in: null,
  priority: 'best_value',
  ambiguities: [],
  restatement: 'A trip to Manali.',
  ...over
})

describe('a model may say it does not know', () => {
  it('accepts a null trip length instead of falling back', async () => {
    const result = await withModelReply(reply({ duration_nights: null }), () =>
      extractIntent('trip to manali for 4 people, budget 50000', ['Goa', 'Manali', 'Udaipur'])
    )

    assert.equal(result.source, 'model', 'a null on an unstated field is a valid answer, not a failed parse')
    assert.equal(result.data.duration_nights, 3, 'the default is filled here, not invented by the model')
    assert.ok(
      result.data.ambiguities.some(a => /assumed 3 nights/.test(a)),
      'an assumption the traveller cannot see is an assumption they cannot correct'
    )
  })

  it('fills party size and budget the same way', async () => {
    const result = await withModelReply(
      reply({ travelers: null, budget: { max: null, currency: 'INR', type: 'soft_target' } }),
      () => extractIntent('somewhere in udaipur, romantic', ['Goa', 'Manali', 'Udaipur'])
    )

    assert.equal(result.source, 'model')
    assert.equal(result.data.travelers, 2)
    assert.equal(result.data.budget.max, 60_000)
    assert.equal(result.data.ambiguities.length, 2)
  })

  it('does not announce the same gap twice', async () => {
    const result = await withModelReply(
      reply({ duration_nights: null, ambiguities: ['trip length in nights', 'travel dates not specified'] }),
      () => extractIntent('trip to manali for 4', ['Goa', 'Manali', 'Udaipur'])
    )

    // Ours names the value that was filled in, so the model's vaguer phrasing
    // of the same gap is dropped rather than crowding the six item cap.
    assert.equal(result.data.ambiguities.length, 2)
    assert.ok(result.data.ambiguities.some(a => /assumed 3 nights/.test(a)))
    assert.ok(result.data.ambiguities.some(a => /travel dates/.test(a)))
  })

  it('still keeps a stated value when the model gives one', async () => {
    const result = await withModelReply(reply({ duration_nights: 5, travelers: 2 }), () =>
      extractIntent('5 nights in manali for two', ['Goa', 'Manali', 'Udaipur'])
    )

    assert.equal(result.data.duration_nights, 5)
    assert.equal(result.data.travelers, 2)
    assert.deepEqual(result.data.ambiguities, [])
  })
})

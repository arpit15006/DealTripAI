import assert from 'node:assert/strict'
import crypto from 'node:crypto'
import { after, before, describe, it } from 'node:test'

import { verifyWebhookSignature, webhookConfigured } from '../razorpay'

const SECRET = 'whsec_test_dealtrip'
const BODY = JSON.stringify({ event: 'payment.captured', payload: { payment: { entity: { id: 'pay_x' } } } })

const sign = (body: string, secret = SECRET) =>
  crypto.createHmac('sha256', secret).update(body).digest('hex')

describe('webhook signatures, the browser is not the source of truth', () => {
  let previous: string | undefined

  before(() => {
    previous = process.env.RAZORPAY_WEBHOOK_SECRET
    process.env.RAZORPAY_WEBHOOK_SECRET = SECRET
  })

  after(() => {
    if (previous === undefined) delete process.env.RAZORPAY_WEBHOOK_SECRET
    else process.env.RAZORPAY_WEBHOOK_SECRET = previous
  })

  it('accepts a correctly signed delivery', () => {
    assert.equal(webhookConfigured(), true)
    assert.equal(verifyWebhookSignature(BODY, sign(BODY)), true)
  })

  it('rejects a forged signature', () => {
    assert.equal(verifyWebhookSignature(BODY, 'deadbeef'), false)
    assert.equal(verifyWebhookSignature(BODY, sign(BODY, 'the-wrong-secret')), false)
  })

  it('rejects a body altered after signing', () => {
    const signature = sign(BODY)
    const tampered = BODY.replace('pay_x', 'pay_attacker')

    // This is why the raw bytes are verified before the JSON is parsed.
    assert.equal(verifyWebhookSignature(tampered, signature), false)
  })

  it('rejects everything when no secret is configured', () => {
    delete process.env.RAZORPAY_WEBHOOK_SECRET

    assert.equal(webhookConfigured(), false)
    assert.equal(verifyWebhookSignature(BODY, sign(BODY)), false)

    process.env.RAZORPAY_WEBHOOK_SECRET = SECRET
  })
})

describe('model prose is normalised before it reaches the interface', () => {
  it('normalises the MODEL path, not only the fallback', async () => {
    const { structured } = await import('../llm')
    const { z } = await import('zod')

    // Stand in for the provider so the success path is genuinely exercised.
    const realFetch = globalThis.fetch
    const prevKey = process.env.GROQ_API_KEY

    process.env.GROQ_API_KEY = 'test-key'
    globalThis.fetch = (async () =>
      new Response(
        JSON.stringify({
          choices: [{ message: { content: JSON.stringify({ note: 'Sea\u2011View Room \u2014 with breakfast' }) } }]
        }),
        { status: 200, headers: { 'content-type': 'application/json' } }
      )) as typeof fetch

    try {
      const result = await structured({
        label: 'test.model-path',
        schema: z.object({ note: z.string() }),
        system: '',
        user: '',
        fallback: () => ({ note: 'unused' })
      })

      assert.equal(result.source, 'model', 'the model path must be the one under test')
      assert.equal(result.data.note, 'Sea-View Room, with breakfast')
    } finally {
      globalThis.fetch = realFetch
      if (prevKey === undefined) delete process.env.GROQ_API_KEY
      else process.env.GROQ_API_KEY = prevKey
    }
  })

  it('replaces dashes a model wrote, however deeply nested', async () => {
    const { structured } = await import('../llm')
    const { z } = await import('zod')

    const schema = z.object({
      rationale: z.string(),
      changes: z.array(z.string()),
      nested: z.object({ note: z.string() })
    })

    // The fallback path exercises the same normalisation the model path uses.
    const result = await structured({
      label: 'test.dedash',
      schema,
      system: '',
      user: '',
      enabled: false,
      fallback: () => ({
        rationale: 'Beachfront suite \u2014 with breakfast \u2014 and a transfer.',
        changes: ['Swapped the transfer \u2014 a cheaper tier', 'Sea\u2011View Room kept'],
        nested: { note: 'Held until 5pm \u2013 retry any time' }
      })
    })

    const flat = JSON.stringify(result.data)

    // Every unicode dash, not just the two seen so far.
    assert.ok(!/[\u2010-\u2015\u2212]/.test(flat), 'no unicode dashes should survive')
    assert.match(result.data.rationale, /Beachfront suite, with breakfast, and a transfer\./)
    assert.match(result.data.changes[0], /Swapped the transfer, a cheaper tier/)
    assert.match(result.data.changes[1], /Sea-View Room kept/)
    assert.match(result.data.nested.note, /Held until 5pm, retry any time/)
  })
})

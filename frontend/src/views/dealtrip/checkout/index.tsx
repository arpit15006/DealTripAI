'use client'

// React Imports
import { useEffect, useRef, useState } from 'react'

// Next Imports
import Link from 'next/link'
import Script from 'next/script'

// Third-party Imports
import { ArrowLeftIcon, CircleAlertIcon, Loader2Icon, LockIcon, PartyPopperIcon, ScrollTextIcon } from 'lucide-react'

// Component Imports
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Confetti, type ConfettiRef } from '@/components/ui/confetti'
import { Separator } from '@/components/ui/separator'
import GuardChecklist from '@/views/dealtrip/shared/guard-checklist'
import PropertyImage from '@/views/dealtrip/shared/property-image'
import Stepper from '@/views/dealtrip/shared/checkout-stepper'

// Lib Imports
import { ApiError, approveOffer, reportPaymentFailure, verifyPayment } from '@/lib/dealtrip/client'
import { formatStay, weekdayName } from '@/lib/dealtrip/dates'
import { formatINR } from '@/lib/dealtrip/pricing'
import { ATTRIBUTE_LABELS } from '@/lib/dealtrip/vocabulary'

import type { NegotiationView } from '@/lib/dealtrip/negotiation-state'
import type { GuardVerdict } from '@/lib/dealtrip/types'

import './razorpay.d'

const STEPS = [
  { id: 'review', label: 'Review' },
  { id: 'pay', label: 'Pay' },
  { id: 'confirmed', label: 'Confirmed' }
]

type Stage = 'review' | 'authorizing' | 'paying' | 'verifying' | 'confirmed' | 'failed' | 'blocked'

type Props = {
  state: NegotiationView
  negotiationId: string
  offerId: string
}

const Checkout = ({ state, negotiationId, offerId }: Props) => {
  const [stage, setStage] = useState<Stage>(
    state.negotiation.status === 'booked' ? 'confirmed' : 'review'
  )

  const [message, setMessage] = useState<string | null>(null)
  const [blockedVerdict, setBlockedVerdict] = useState<GuardVerdict | null>(null)
  const [scriptReady, setScriptReady] = useState(false)
  const confetti = useRef<ConfettiRef>(null)

  const row = state.ranked.find(r => r.offer.id === offerId) ?? state.ranked[0]

  useEffect(() => {
    if (stage === 'confirmed') confetti.current?.fire?.({})
  }, [stage])

  if (!row) {
    return (
      <div className='mx-auto w-full max-w-2xl px-4 py-10 sm:px-6'>
        <Alert variant='destructive'>
          <CircleAlertIcon />
          <AlertTitle>That offer is no longer on the table</AlertTitle>
          <AlertDescription>Go back and pick from the current deals.</AlertDescription>
        </Alert>
      </div>
    )
  }

  const { offer, merchant, verdict } = row

  /**
   * The only path to a charge.
   *
   * Approval re-runs the Commerce Guard server-side before an order exists, so
   * a stale or tampered offer is refused here rather than at the bank.
   */
  const payNow = async () => {
    setStage('authorizing')
    setMessage(null)
    setBlockedVerdict(null)

    let approval

    try {
      approval = await approveOffer(negotiationId, offer.id)
    } catch (error) {
      if (error instanceof ApiError && error.status === 409) {
        const body = error.body as { verdict?: GuardVerdict; remediation?: string } | null

        setBlockedVerdict(body?.verdict ?? null)
        setMessage(body?.remediation ?? error.message)
        setStage('blocked')

        return
      }

      setMessage(error instanceof ApiError ? error.message : 'Could not raise a payment for this offer.')
      setStage('failed')

      return
    }

    if (!window.Razorpay) {
      setMessage('Razorpay Checkout could not be loaded. Check your connection and try again.')
      setStage('failed')

      return
    }

    setStage('paying')

    const checkout = new window.Razorpay({
      key: approval.key_id,
      amount: approval.order.amount,
      currency: approval.order.currency,
      order_id: approval.order.id,
      name: 'DealTrip',
      description: `${approval.merchant_name} — ${offer.quote.nights} nights`,
      theme: { color: '#0b78bd' },
      notes: { negotiation_id: negotiationId, offer_id: offer.id },
      handler: async response => {
        setStage('verifying')

        try {
          await verifyPayment(response)
          setStage('confirmed')
        } catch (error) {
          setMessage(
            error instanceof ApiError
              ? error.message
              : 'The payment could not be verified server-side. Nothing has been booked.'
          )
          setStage('failed')
        }
      },
      modal: {
        ondismiss: async () => {
          await reportPaymentFailure(approval.order.id, 'Checkout was closed before payment completed.').catch(
            () => undefined
          )
          setMessage('You closed the payment window. Nothing was charged and your negotiated price is still held.')
          setStage('failed')
        }
      }
    })

    checkout.on('payment.failed', async payload => {
      const description = payload.error?.description ?? 'The payment failed.'

      await reportPaymentFailure(approval.order.id, description).catch(() => undefined)

      // A card the gateway will not take is a dead end unless we say what will.
      const unsupportedCard = /international|not supported|not enabled/i.test(description)

      setMessage(
        unsupportedCard
          ? `${description} In Razorpay test mode, Netbanking or a domestic test card completes successfully.`
          : description
      )
      setStage('failed')
    })

    checkout.open()
  }

  const busy = stage === 'authorizing' || stage === 'paying' || stage === 'verifying'

  return (
    <div className='mx-auto w-full max-w-2xl px-4 py-8 sm:px-6'>
      <Script
        src='https://checkout.razorpay.com/v1/checkout.js'
        onLoad={() => setScriptReady(true)}
        onReady={() => setScriptReady(true)}
      />

      <div className='flex items-start justify-between gap-3'>
        <div>
          <h1 className='type-title text-2xl font-semibold'>Approve and pay</h1>
          <p className='text-muted-foreground text-sm'>
            Nothing is charged until you approve this exact offer.
          </p>
        </div>
        <Button variant='outline' size='sm' nativeButton={false} render={<Link href={`/deal/${negotiationId}`} />}>
          <ArrowLeftIcon />
          Back
        </Button>
      </div>

      <Card className='mt-5 py-4'>
        <Stepper steps={STEPS} currentStep={stage === 'confirmed' ? 'confirmed' : stage === 'review' || stage === 'blocked' || stage === 'failed' ? 'review' : 'pay'} />
      </Card>

      {/* ── Confirmed ────────────────────────────────────────────────── */}
      {stage === 'confirmed' && (
        <>
          <Confetti ref={confetti} className='pointer-events-none fixed inset-0 z-50 size-full' manualstart />
          <Alert variant='success' className='mt-5'>
            <PartyPopperIcon />
            <AlertTitle>Deal negotiated. Payment verified. Booking confirmed.</AlertTitle>
            <AlertDescription>
              {merchant.name} for {offer.quote.nights} nights at {formatINR(offer.quote.total_price)}. The signature was
              verified server-side before anything was marked booked.
            </AlertDescription>
          </Alert>
        </>
      )}

      {/* ── Blocked by the guard ─────────────────────────────────────── */}
      {stage === 'blocked' && (
        <Alert variant='destructive' className='mt-5'>
          <CircleAlertIcon />
          <AlertTitle>The Commerce Guard blocked this payment</AlertTitle>
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      )}

      {blockedVerdict && <GuardChecklist verdict={blockedVerdict} defaultOpen className='mt-3' />}

      {/* ── Failed, retryable ────────────────────────────────────────── */}
      {stage === 'failed' && (
        <Alert variant='warning' className='mt-5'>
          <CircleAlertIcon />
          <AlertTitle>Nothing was charged and nothing was booked</AlertTitle>
          <AlertDescription>
            {message ? `${message.replace(/\s*$/, '').replace(/([^.!?])$/, '$1.')} ` : ''}
            Your negotiated price is held until{' '}
            {new Date(offer.expires_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })} — you can
            retry without negotiating again.
          </AlertDescription>
        </Alert>
      )}

      {/* ── Offer summary ────────────────────────────────────────────── */}
      <Card className='mt-5 gap-0 overflow-hidden py-0'>
        <PropertyImage
          src={state.merchants.find(m => m.id === offer.merchant_id)?.image}
          alt={merchant.name}
          fallbackLabel={merchant.name}
          className='aspect-[21/9] w-full'
          sizes='(max-width: 768px) 100vw, 672px'
          priority
        />
        <CardHeader className='flex flex-wrap items-start justify-between gap-2 px-6 pt-5'>
          <div>
            <CardTitle className='text-base'>{merchant.name}</CardTitle>
            <p className='text-muted-foreground text-xs'>{merchant.tagline}</p>
          </div>
          <p className='meta shrink-0 text-right'>
            negotiated over {offer.round} round{offer.round === 1 ? '' : 's'}
            <br />
            {formatStay(offer.quote.check_in, offer.quote.nights)} · {weekdayName(offer.quote.check_in)} in
          </p>
        </CardHeader>

        <CardContent className='flex flex-col gap-4 pb-6'>
          <ul className='text-muted-foreground'>
            {offer.quote.lines.map(line => (
              <li key={line.ref_id} className='line-item'>
                <span>{line.label}</span>
                <span>{formatINR(line.amount)}</span>
              </li>
            ))}
            {offer.quote.discount_amount > 0 && (
              <li className='line-item text-green-600 dark:text-green-400'>
                <span>Negotiated discount ({offer.quote.discount_pct}%)</span>
                <span>−{formatINR(offer.quote.discount_amount)}</span>
              </li>
            )}
          </ul>

          <Separator />

          <div className='flex items-baseline justify-between gap-3'>
            <span className='text-sm font-medium'>Total</span>
            <span className='price'>{formatINR(offer.quote.total_price)}</span>
          </div>

          <p className='text-muted-foreground text-xs leading-relaxed'>
            {offer.quote.attributes.map((a, i) => (
              <span key={a}>
                {i > 0 && <span className='opacity-50'> · </span>}
                {ATTRIBUTE_LABELS[a]}
              </span>
            ))}
          </p>

          <GuardChecklist verdict={verdict} />

          {stage !== 'confirmed' && (
            <>
              <Button size='lg' className='w-full' onClick={payNow} disabled={busy || !scriptReady}>
                {busy ? <Loader2Icon className='animate-spin' /> : <LockIcon />}
                {stage === 'authorizing'
                  ? 'Re-validating with the Commerce Guard…'
                  : stage === 'paying'
                    ? 'Waiting for Razorpay…'
                    : stage === 'verifying'
                      ? 'Verifying the signature…'
                      : stage === 'failed' || stage === 'blocked'
                        ? `Try again — ${formatINR(offer.quote.total_price)}`
                        : `Approve and pay ${formatINR(offer.quote.total_price)}`}
              </Button>
              <p className='text-muted-foreground text-center text-xs'>
                The guard re-runs every check before an order is created, and the amount is recomputed from the
                merchant&apos;s catalog — never taken from this page. Razorpay test mode.
              </p>
            </>
          )}

          {stage === 'confirmed' && (
            <div className='flex flex-col gap-2 sm:flex-row'>
              <Button
                variant='outline'
                className='flex-1'
                nativeButton={false}
                render={<Link href={`/deal/${negotiationId}/timeline`} />}
              >
                <ScrollTextIcon />
                See the full Trust Timeline
              </Button>
              <Button variant='outline' className='flex-1' nativeButton={false} render={<Link href='/' />}>
                Plan another trip
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default Checkout

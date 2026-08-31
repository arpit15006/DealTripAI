'use client'

// React Imports
import { useMemo, useState } from 'react'

// Next Imports
import Link from 'next/link'

// Third-party Imports
import { ArrowLeftIcon, Loader2Icon, RotateCcwIcon, SaveIcon, ShieldCheckIcon } from 'lucide-react'
import { toast } from 'sonner'

// Component Imports
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'

// Lib Imports
import { ApiError, updateMerchantPolicy } from '@/lib/dealtrip/client'
import { computeQuote, minimumAllowedPrice } from '@/lib/dealtrip/pricing'
import { formatINR } from '@/lib/dealtrip/pricing'

import type { Merchant, MerchantPolicy, Objective } from '@/lib/dealtrip/types'

const OBJECTIVE_LABELS: Record<Objective, string> = {
  maximize_revenue: 'Maximise revenue',
  protect_margin: 'Protect margin',
  maximize_occupancy: 'Maximise occupancy',
  move_unsold_inventory: 'Move unsold inventory',
  increase_package_value: 'Increase package value'
}

/**
 * Policy Studio.
 *
 * These numbers are not preferences — they are the limits the Commerce Guard
 * enforces on every offer this merchant's agent makes. So the screen shows,
 * live, what they actually mean in rupees: the lowest price the agent could
 * legally reach for a real package, and which of the two floors is binding.
 * A merchant setting a margin floor should see the price it implies, not just
 * a percentage.
 */
const PolicyStudio = ({ merchant: initial }: { merchant: Merchant }) => {
  const [policy, setPolicy] = useState<MerchantPolicy>(initial.policy)
  const [saving, setSaving] = useState(false)

  const dirty = useMemo(
    () => JSON.stringify(policy) !== JSON.stringify(initial.policy),
    [policy, initial.policy]
  )

  // Preview against the merchant's best room over a representative 3-night stay
  // for two — the same arithmetic the guard runs, not an approximation of it.
  const preview = useMemo(() => {
    const room = [...initial.rooms].sort((a, b) => b.tier - a.tier)[0]

    if (!room) return null

    const bundle = { room_id: room.id, addon_ids: policy.locked_addons, discount_pct: 0 }
    const merchant = { ...initial, policy }

    try {
      const quote = computeQuote(merchant, bundle, 3, 2)
      const floors = minimumAllowedPrice(merchant, bundle, 3, 2)

      return { room, quote, floors }
    } catch {
      return null
    }
  }, [initial, policy])

  const save = async () => {
    setSaving(true)

    try {
      await updateMerchantPolicy(initial.id, policy)
      toast.success('Policy saved — the Commerce Guard now enforces these limits.')
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : 'Could not save the policy.')
    } finally {
      setSaving(false)
    }
  }

  const set = (patch: Partial<MerchantPolicy>) => setPolicy(current => ({ ...current, ...patch }))

  return (
    <div className='flex flex-col gap-6'>
      <div className='flex flex-wrap items-start justify-between gap-3'>
        <div>
          <h1 className='text-xl font-semibold tracking-tight'>{initial.name}</h1>
          <p className='text-muted-foreground text-sm'>
            {initial.tagline} · Policy Studio
          </p>
        </div>
        <div className='flex gap-2'>
          <Button variant='outline' size='sm' render={<Link href='/dashboard/merchants' />}>
            <ArrowLeftIcon />
            All merchants
          </Button>
          {dirty && (
            <Button variant='outline' size='sm' onClick={() => setPolicy(initial.policy)}>
              <RotateCcwIcon />
              Reset
            </Button>
          )}
          <Button size='sm' onClick={save} disabled={!dirty || saving}>
            {saving ? <Loader2Icon className='animate-spin' /> : <SaveIcon />}
            Save policy
          </Button>
        </div>
      </div>

      <div className='grid gap-6 lg:grid-cols-[1fr_20rem]'>
        <div className='flex flex-col gap-4'>
          {/* ── Pricing boundaries ─────────────────────────────────── */}
          <Card>
            <CardHeader>
              <CardTitle className='text-base'>Pricing boundaries</CardTitle>
              <p className='text-muted-foreground text-sm'>
                Two independent floors. Whichever binds first is the lowest your agent can go.
              </p>
            </CardHeader>
            <CardContent className='flex flex-col gap-6'>
              <SliderField
                label='Maximum discount off list'
                value={policy.max_discount_pct}
                min={0}
                max={40}
                step={1}
                suffix='%'
                hint='Your agent may never discount further than this, whatever a buyer asks for.'
                onChange={value => set({ max_discount_pct: value })}
              />
              <SliderField
                label='Minimum retained margin'
                value={policy.min_margin_pct}
                min={0}
                max={60}
                step={1}
                suffix='%'
                hint='An offer that would leave you below this is blocked, even if the discount ceiling allows it.'
                onChange={value => set({ min_margin_pct: value })}
              />
            </CardContent>
          </Card>

          {/* ── Negotiation permissions ────────────────────────────── */}
          <Card>
            <CardHeader>
              <CardTitle className='text-base'>Negotiation permissions</CardTitle>
            </CardHeader>
            <CardContent className='flex flex-col gap-6'>
              <SliderField
                label='Revisions your agent may make'
                value={policy.max_counter_rounds}
                min={0}
                max={5}
                step={1}
                suffix={policy.max_counter_rounds === 1 ? ' round' : ' rounds'}
                hint={
                  policy.max_counter_rounds === 0
                    ? 'Your agent quotes once and will not revise. Effectively a fixed price.'
                    : 'After this many revisions the desk stops asking and your last offer stands.'
                }
                onChange={value => set({ max_counter_rounds: value })}
              />

              <div className='flex items-start justify-between gap-4'>
                <div className='flex flex-col gap-0.5'>
                  <Label htmlFor='substitutions'>Allow package substitutions</Label>
                  <p className='text-muted-foreground text-xs'>
                    Lets the agent swap a room grade or an add-on to reach a target instead of cutting the rate.
                  </p>
                </div>
                <Switch
                  id='substitutions'
                  checked={policy.allow_substitutions}
                  onCheckedChange={checked => set({ allow_substitutions: checked })}
                />
              </div>

              <div className='flex flex-col gap-2'>
                <Label>Substitutable groups</Label>
                <div className='flex flex-wrap gap-1.5'>
                  {policy.substitutable_groups.length === 0 ? (
                    <span className='text-muted-foreground text-xs'>Nothing may be substituted.</span>
                  ) : (
                    policy.substitutable_groups.map(group => (
                      <Badge key={group} variant='outline' className='h-6 px-2 font-normal'>
                        {group.replace(/_/g, ' ')}
                      </Badge>
                    ))
                  )}
                </div>
              </div>

              {policy.locked_addons.length > 0 && (
                <div className='flex flex-col gap-2'>
                  <Label>Never removable</Label>
                  <div className='flex flex-wrap gap-1.5'>
                    {policy.locked_addons.map(id => (
                      <Badge key={id} variant='outline' className='border-primary/40 text-primary h-6 px-2 font-normal'>
                        {initial.addons.find(a => a.id === id)?.name ?? id}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* ── Objectives ─────────────────────────────────────────── */}
          <Card>
            <CardHeader>
              <CardTitle className='text-base'>Business objectives</CardTitle>
              <p className='text-muted-foreground text-sm'>
                In priority order. Your agent optimises for the first, then the second.
              </p>
            </CardHeader>
            <CardContent className='flex flex-wrap gap-1.5'>
              {policy.objectives.map((objective, index) => (
                <Badge key={objective} variant='outline' className='h-6 gap-1.5 px-2 font-normal'>
                  <span className='text-muted-foreground font-mono text-[11px]'>{index + 1}</span>
                  {OBJECTIVE_LABELS[objective]}
                </Badge>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* ── What your agent is allowed to do ──────────────────────── */}
        <Card className='h-fit lg:sticky lg:top-20'>
          <CardHeader>
            <CardTitle className='flex items-center gap-2 text-sm'>
              <ShieldCheckIcon className='size-4' />
              What your agent may do
            </CardTitle>
          </CardHeader>
          <CardContent className='flex flex-col gap-4'>
            {preview ? (
              <>
                <p className='text-muted-foreground text-xs'>
                  For your {preview.room.name} over 3 nights, 2 guests:
                </p>

                <div className='flex flex-col gap-1.5 text-sm'>
                  <Row label='List price' value={formatINR(preview.quote.list_price)} />
                  <Row
                    label='Discount floor'
                    value={formatINR(preview.floors.discount_floor)}
                    muted={preview.floors.binding !== 'discount'}
                  />
                  <Row
                    label='Margin floor'
                    value={formatINR(preview.floors.margin_floor)}
                    muted={preview.floors.binding !== 'margin'}
                  />
                </div>

                <Separator />

                <div>
                  <p className='text-muted-foreground text-xs'>Lowest your agent can legally sell this for</p>
                  <p className='text-xl font-semibold tabular-nums'>{formatINR(preview.floors.floor)}</p>
                  <p className='text-muted-foreground text-xs'>
                    The <span className='text-foreground font-medium'>{preview.floors.binding}</span> floor is binding —
                    it is the higher of the two.
                  </p>
                </div>

                <Alert>
                  <AlertTitle className='text-xs'>Buyers never see these numbers</AlertTitle>
                  <AlertDescription className='text-xs'>
                    Your published profile says only that you negotiate and over what. The ceiling and the floor are
                    enforced server-side, so a buyer cannot open by demanding your limit.
                  </AlertDescription>
                </Alert>
              </>
            ) : (
              <p className='text-muted-foreground text-xs'>No room available to preview against.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

const Row = ({ label, value, muted }: { label: string; value: string; muted?: boolean }) => (
  <div className={`flex justify-between gap-3 ${muted ? 'text-muted-foreground' : ''}`}>
    <span>{label}</span>
    <span className='shrink-0 tabular-nums'>{value}</span>
  </div>
)

const SliderField = ({
  label,
  value,
  min,
  max,
  step,
  suffix,
  hint,
  onChange
}: {
  label: string
  value: number
  min: number
  max: number
  step: number
  suffix: string
  hint: string
  onChange: (value: number) => void
}) => (
  <div className='flex flex-col gap-2'>
    <div className='flex items-baseline justify-between gap-3'>
      <Label>{label}</Label>
      <span className='font-mono text-sm tabular-nums'>
        {value}
        {suffix}
      </span>
    </div>
    <Slider
      value={[value]}
      min={min}
      max={max}
      step={step}
      onValueChange={next => onChange(Array.isArray(next) ? next[0] : next)}
    />
    <p className='text-muted-foreground text-xs'>{hint}</p>
  </div>
)

export default PolicyStudio

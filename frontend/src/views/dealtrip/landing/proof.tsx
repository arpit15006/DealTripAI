'use client'

// React Imports
import { useState } from 'react'

// Third-party Imports
import { CheckIcon, CopyIcon, TerminalIcon } from 'lucide-react'
import { toast } from 'sonner'

// Component Imports
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

const COMMAND = `curl -sX POST localhost:3000/api/agent/oceanvista/quote \\
  -H 'content-type: application/json' \\
  -d '{"intent":{…},"bundle":{"room_id":"ov-premium-beach",
       "addon_ids":[],"discount_pct":40}}' | jq '.guard'`

const RESPONSE = [
  { ok: false, label: 'Discount within merchant ceiling', detail: '40% breaches the 5% ceiling set by OceanVista Resort.' },
  { ok: false, label: 'Merchant margin protected', detail: 'Margin would fall to 17.4%, below the 30% floor.' },
  { ok: true, label: 'Price recomputed from catalog', detail: 'Independently recomputed. Matches to the rupee.' }
]

/**
 * The claim, and the way to check it.
 *
 * "Agent-readable catalog" is an assertion; a command someone can paste is
 * evidence. This section exists so a sceptical reader can try to break the
 * guard themselves rather than take the previous section on trust.
 */
const Proof = () => {
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(COMMAND.replace(/\\\n\s*/g, ' ').replace(/…/, ''))
      setCopied(true)
      toast.success('Command copied')
      setTimeout(() => setCopied(false), 1800)
    } catch {
      toast.error('Could not copy to the clipboard')
    }
  }

  return (
    <section aria-labelledby='proof-heading' className='bg-muted/40 border-y'>
      <div className='mx-auto w-full max-w-5xl px-4 py-12 sm:px-6 sm:py-16'>
        <div className='flex flex-col items-center gap-3 text-center'>
          <Badge variant='outline' className='h-auto gap-1.5 py-1 font-normal'>
            <TerminalIcon className='size-3.5' aria-hidden />
            Try to break it
          </Badge>
          <h2 id='proof-heading' className='type-title text-2xl font-semibold sm:text-3xl'>
            Ask for a 40% discount against a 5% ceiling
          </h2>
          <p className='type-body text-muted-foreground max-w-xl'>
            Every merchant publishes a machine-readable catalog and accepts structured negotiation. These are the same
            endpoints DealTrip&apos;s own desk calls, so you can put a deliberately illegal offer to one and read the
            refusal.
          </p>
        </div>

        <div className='mt-8 grid gap-4 lg:grid-cols-2'>
          <Card className='gap-0 overflow-hidden py-0'>
            <div className='flex items-center justify-between gap-2 border-b px-4 py-2'>
              <span className='type-caption text-muted-foreground font-mono text-xs'>request</span>
              <Button variant='ghost' size='xs' onClick={copy}>
                {copied ? <CheckIcon className='text-green-600' aria-hidden /> : <CopyIcon aria-hidden />}
                {copied ? 'Copied' : 'Copy'}
              </Button>
            </div>
            <CardContent className='p-0'>
              <pre className='text-muted-foreground overflow-x-auto px-4 py-3 text-xs leading-relaxed'>{COMMAND}</pre>
            </CardContent>
          </Card>

          <Card className='gap-0 overflow-hidden py-0'>
            <div className='flex items-center justify-between gap-2 border-b px-4 py-2'>
              <span className='type-caption text-muted-foreground font-mono text-xs'>response</span>
              <Badge
                variant='outline'
                className='border-destructive/40 text-destructive h-5 px-1.5 font-mono text-xs'
              >
                409
              </Badge>
            </div>
            <CardContent className='flex flex-col gap-2 px-4 py-3'>
              {RESPONSE.map(check => (
                <div key={check.label} className='flex items-start gap-2'>
                  <span
                    aria-hidden
                    className={
                      check.ok
                        ? 'mt-0.5 text-green-600 dark:text-green-400'
                        : 'text-destructive mt-0.5'
                    }
                  >
                    {check.ok ? '✓' : '✕'}
                  </span>
                  <span className='min-w-0'>
                    <span className='block text-xs font-medium'>
                      {check.label}
                      <span className='sr-only'>{check.ok ? ' (passed' : ') failed'}</span>
                    </span>
                    <span className='type-caption text-muted-foreground block text-xs'>{check.detail}</span>
                  </span>
                </div>
              ))}
              <p className='type-caption text-muted-foreground mt-1 text-xs'>
                Returned with the lowest legal price for that exact package. The ceiling and the floor themselves are
                never published.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}

export default Proof

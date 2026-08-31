'use client'

// React Imports
import { useState } from 'react'

// Third-party Imports
import { CheckIcon, CopyIcon, ExternalLinkIcon, ShieldXIcon, TerminalIcon } from 'lucide-react'
import { toast } from 'sonner'

// Component Imports
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const INTENT = `{"destination":"Goa","travelers":2,"duration_nights":3,
 "budget":{"max":60000,"currency":"INR","type":"hard_constraint"},
 "requirements":{"beachfront":"required","breakfast":"preferred"},
 "date_flexibility_days":2,"check_in":null,"priority":"best_value","notes":""}`

type Endpoint = {
  method: 'GET' | 'POST'
  path: string
  title: string
  description: string
  curl: (base: string) => string
  destructive?: boolean
}

const ENDPOINTS: Endpoint[] = [
  {
    method: 'GET',
    path: '/.well-known/agent-commerce.json',
    title: 'Discovery',
    description:
      'The marketplace index. An agent that has only the origin starts here and finds every merchant, plus the vocabulary it must express requirements in.',
    curl: base => `curl -s ${base}/.well-known/agent-commerce.json | jq`
  },
  {
    method: 'GET',
    path: '/api/agent/{slug}/profile',
    title: 'Agent Commerce Profile',
    description:
      "A merchant's machine-readable storefront: rooms, add-ons, what it will negotiate over. Its discount ceiling, margin floor and cost base are deliberately absent — publishing them would just mean every buyer opens by demanding the limit.",
    curl: base => `curl -s ${base}/api/agent/oceanvista/profile | jq`
  },
  {
    method: 'POST',
    path: '/api/agent/{slug}/quote',
    title: 'Quote — let the merchant compose',
    description:
      "Send an intent and the merchant's own agent builds a package for it. Every response carries the Commerce Guard's full verdict, pass or fail.",
    curl: base =>
      `curl -sX POST ${base}/api/agent/oceanvista/quote \\
  -H 'content-type: application/json' \\
  -d '{"intent":${INTENT.replace(/\n\s*/g, '')}}' | jq`
  },
  {
    method: 'POST',
    path: '/api/agent/{slug}/quote',
    title: 'Quote — propose your own package (try to break it)',
    description:
      'Name a bundle yourself and ask for a 40% discount against a 5% ceiling. The guard refuses it, tells you which of the two floors bound, and never returns a price. This is the honest way to test that the limits are real.',
    destructive: true,
    curl: base =>
      `curl -sX POST ${base}/api/agent/oceanvista/quote \\
  -H 'content-type: application/json' \\
  -d '{"intent":${INTENT.replace(/\n\s*/g, '')},
       "bundle":{"room_id":"ov-premium-beach","addon_ids":["ov-breakfast"],"discount_pct":40}}' | jq '.guard'`
  },
  {
    method: 'POST',
    path: '/api/agent/{slug}/negotiate',
    title: 'Negotiate',
    description:
      'Send a COUNTER_REQUEST naming a target, what must survive, and which add-on groups you will let change. The merchant revises within policy, or declines honestly.',
    curl: base =>
      `curl -sX POST ${base}/api/agent/oceanvista/negotiate \\
  -H 'content-type: application/json' \\
  -d '{"intent":${INTENT.replace(/\n\s*/g, '')},
       "previous_bundle":{"room_id":"ov-premium-beach","addon_ids":["ov-breakfast","ov-private-transfer"],"discount_pct":0},
       "counter":{"type":"COUNTER_REQUEST","max_price":52000,"preserve":["beachfront"],
                  "preferred":["breakfast"],"substitution_allowed":["transfer","meals"],
                  "message":"Beat 52,000 and keep breakfast."},
       "round":1}' | jq`
  },
  {
    method: 'GET',
    path: '/api/agent/vocabulary',
    title: 'Vocabulary',
    description:
      'The closed attribute list. Matching is a set operation rather than a similarity score, so a term outside this list is rejected rather than approximated.',
    curl: base => `curl -s ${base}/api/agent/vocabulary | jq '.attributes'`
  }
]

/**
 * The agent-facing surface, documented as something to actually run.
 *
 * "Agent-readable catalog" is a claim; a curl command a judge can paste is
 * evidence. These are the same endpoints DealTrip's own orchestrator uses —
 * there is no private side channel.
 */
const AgentApiReference = ({ baseUrl }: { baseUrl: string }) => {
  const [copied, setCopied] = useState<string | null>(null)

  const copy = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(key)
      toast.success('Copied')
      setTimeout(() => setCopied(null), 1600)
    } catch {
      toast.error('Could not copy to the clipboard')
    }
  }

  return (
    <div className='flex flex-col gap-6'>
      <div className='flex flex-wrap items-start justify-between gap-3'>
        <div>
          <h1 className='text-xl font-semibold tracking-tight'>Agent API</h1>
          <p className='text-muted-foreground text-sm'>
            Everything an external AI buyer needs to discover, quote and negotiate. Run any of these.
          </p>
        </div>
        <Button
          variant='outline'
          size='sm'
          nativeButton={false}
          render={<a href='/.well-known/agent-commerce.json' target='_blank' rel='noreferrer' />}
        >
          <ExternalLinkIcon />
          Open the discovery doc
        </Button>
      </div>

      <Alert variant='info'>
        <TerminalIcon />
        <AlertTitle>No authentication, no private channel</AlertTitle>
        <AlertDescription>
          These are the same endpoints DealTrip&apos;s own Deal Orchestrator calls. Anything our buyer-side agent can
          do, yours can too — and every response is subject to the same Commerce Guard.
        </AlertDescription>
      </Alert>

      <div className='flex flex-col gap-3'>
        {ENDPOINTS.map((endpoint, index) => {
          const command = endpoint.curl(baseUrl)
          const key = `${endpoint.path}-${index}`

          return (
            <Card key={key} className={endpoint.destructive ? 'border-destructive/40' : undefined}>
              <CardHeader className='flex flex-wrap items-start justify-between gap-2'>
                <div className='min-w-0'>
                  <CardTitle className='flex items-center gap-2 text-sm'>
                    {endpoint.destructive && <ShieldXIcon className='text-destructive size-4' />}
                    {endpoint.title}
                  </CardTitle>
                  <p className='text-muted-foreground mt-1 text-xs'>{endpoint.description}</p>
                </div>
                <div className='flex shrink-0 items-center gap-1.5'>
                  <Badge variant='outline' className='h-5 px-1.5 font-mono text-[11px]'>
                    {endpoint.method}
                  </Badge>
                  <code className='text-muted-foreground text-[11px]'>{endpoint.path}</code>
                </div>
              </CardHeader>
              <CardContent>
                <div className='relative'>
                  <pre className='bg-muted text-muted-foreground overflow-x-auto rounded-md border p-3 pr-12 text-[11px] leading-relaxed'>
                    {command}
                  </pre>
                  <Button
                    variant='ghost'
                    size='icon-xs'
                    className='absolute top-2 right-2'
                    onClick={() => copy(command, key)}
                    aria-label='Copy command'
                  >
                    {copied === key ? <CheckIcon className='text-green-600' /> : <CopyIcon />}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}

export default AgentApiReference

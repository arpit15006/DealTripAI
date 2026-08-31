// Next Imports
import Link from 'next/link'

// Third-party Imports
import { ArrowRightIcon, SlidersHorizontalIcon, StoreIcon, UploadIcon } from 'lucide-react'

// Component Imports
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

const STEPS = [
  {
    icon: UploadIcon,
    title: 'Paste what you already have',
    body: 'A rate card, a website blurb, a list of rooms. DealTrip turns it into a structured catalog for review — nothing is published until you say so.'
  },
  {
    icon: SlidersHorizontalIcon,
    title: 'Set the limits you will not cross',
    body: 'A discount ceiling, a margin floor, how many revisions your agent may make, what it may substitute. The studio shows you the rupee floor each setting implies.'
  },
  {
    icon: StoreIcon,
    title: 'Your agent negotiates; the guard holds the line',
    body: 'Buyers see your catalog and what you will negotiate over. They never see your limits — those are enforced server-side, so nobody opens by demanding them.'
  }
]

/**
 * The merchant's side of the market.
 *
 * The track's framing is "make merchants sellable to AI buyers", so the offer
 * to a merchant is stated in their terms — what they control and what they
 * never have to expose — rather than in the buyer's.
 */
const ForMerchants = () => (
  <section aria-labelledby='merchants-heading' className='mx-auto w-full max-w-5xl px-4 py-12 sm:px-6 sm:py-16'>
    <div className='flex flex-col items-center gap-3 text-center'>
      <h2 id='merchants-heading' className='type-title text-2xl font-semibold sm:text-3xl'>
        For merchants: become transactable by AI buyers
      </h2>
      <p className='type-body text-muted-foreground max-w-xl'>
        Traditional listings can&apos;t negotiate, and can&apos;t be read by an agent. Three steps to a storefront that
        can do both — without handing anyone your pricing floor.
      </p>
    </div>

    <ol className='mt-8 grid gap-4 md:grid-cols-3'>
      {STEPS.map(({ icon: Icon, title, body }, index) => (
        <li key={title}>
          <Card className='h-full gap-3 py-5'>
            <CardContent className='flex h-full flex-col gap-2.5 px-5'>
              <div className='flex items-center gap-2'>
                <span className='bg-primary text-primary-foreground tabular flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold'>
                  {index + 1}
                </span>
                <Icon className='text-muted-foreground size-4' aria-hidden />
              </div>
              <h3 className='type-title text-base font-semibold'>{title}</h3>
              <p className='type-body text-muted-foreground text-sm'>{body}</p>
            </CardContent>
          </Card>
        </li>
      ))}
    </ol>

    <div className='mt-8 flex flex-wrap justify-center gap-3'>
      <Button size='lg' nativeButton={false} render={<Link href='/dashboard/merchants/onboard' />}>
        Onboard a merchant
        <ArrowRightIcon aria-hidden />
      </Button>
      <Button size='lg' variant='outline' nativeButton={false} render={<Link href='/dashboard/merchants' />}>
        Browse the marketplace
      </Button>
    </div>
  </section>
)

export default ForMerchants

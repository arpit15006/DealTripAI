// Third-party Imports
import { CalculatorIcon, ScrollTextIcon, ShieldXIcon } from 'lucide-react'

// Component Imports
import { Card, CardContent } from '@/components/ui/card'

const GUARANTEES = [
  {
    icon: CalculatorIcon,
    title: 'Agents choose packages. Code computes money.',
    body: 'A merchant agent picks a room, add-ons and dates. It never emits a rupee figure, one module does, and the Commerce Guard re-derives every quote from the catalog to check it. An invented price is caught, not trusted.'
  },
  {
    icon: ShieldXIcon,
    title: 'Two floors, and the higher one binds.',
    body: 'Each merchant sets a discount ceiling and a margin floor, enforced server-side and never published. An agent that asks for more is refused outright, not quietly repriced to something it can have.'
  },
  {
    icon: ScrollTextIcon,
    title: 'Nothing happens off the record.',
    body: 'Every offer, counter, ruling and payment lands in an append-only trail you can open to its raw payload, and replay, event by event, after the fact.'
  }
]

/** The three claims the product actually rests on, stated plainly. */
const Guarantees = () => (
  <section aria-labelledby='guarantees-heading' className='mx-auto w-full max-w-5xl px-4 py-12 sm:px-6 sm:py-16'>
    <h2 id='guarantees-heading' className='type-title text-center text-2xl font-semibold sm:text-3xl'>
      An agent you can let near money
    </h2>
    <p className='type-body text-muted-foreground mx-auto mt-3 max-w-xl text-center'>
      Autonomy is only useful if it is bounded. These three are enforced in code, not promised in a prompt.
    </p>

    <ul className='mt-8 grid gap-4 md:grid-cols-3'>
      {GUARANTEES.map(({ icon: Icon, title, body }) => (
        <li key={title}>
          <Card className='h-full gap-3 py-5'>
            <CardContent className='flex h-full flex-col gap-2.5 px-5'>
              <span className='bg-primary/10 text-primary flex size-9 shrink-0 items-center justify-center rounded-lg'>
                <Icon className='size-4.5' aria-hidden />
              </span>
              <h3 className='type-title text-base font-semibold'>{title}</h3>
              <p className='type-body text-muted-foreground text-sm'>{body}</p>
            </CardContent>
          </Card>
        </li>
      ))}
    </ul>
  </section>
)

export default Guarantees

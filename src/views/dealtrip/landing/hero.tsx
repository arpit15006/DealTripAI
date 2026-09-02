'use client'

// Third-party Imports
import { motion, useReducedMotion } from 'motion/react'
import { ShieldCheckIcon, SparklesIcon } from 'lucide-react'

// Component Imports
import { Badge } from '@/components/ui/badge'

/**
 * The opening statement.
 *
 * Entrance motion is a plain cross-fade with a short rise, no overshoot,
 * because nothing here was thrown by the user. Bounce belongs to gestures that
 * carried momentum, not to text arriving on load.
 */
const Hero = () => {
  const reduced = useReducedMotion()

  const rise = (delay: number) =>
    reduced
      ? { initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { duration: 0.25, delay } }
      : {
          initial: { opacity: 0, y: 12 },
          animate: { opacity: 1, y: 0 },
          transition: { type: 'spring' as const, bounce: 0, duration: 0.5, delay }
        }

  return (
    <section className='relative overflow-hidden'>
      {/* A single, slow, low-contrast wash. Nothing loops fast enough to
          distract, and it sits behind a solid ground for legibility. */}
      <div
        aria-hidden
        className='from-primary/8 pointer-events-none absolute inset-x-0 -top-40 h-100 bg-gradient-to-b via-transparent to-transparent blur-3xl'
      />

      <div className='relative mx-auto flex max-w-3xl flex-col items-center gap-5 px-4 pt-16 pb-10 text-center sm:px-6 sm:pt-24'>
        <motion.div {...rise(0)}>
          <Badge variant='outline' className='border-primary/40 text-primary h-auto gap-1.5 py-1 font-normal'>
            <SparklesIcon className='size-3.5' aria-hidden />
            Razorpay Buildathon · Agentic Commerce
          </Badge>
        </motion.div>

        <motion.h1 {...rise(0.06)} className='type-display text-4xl font-semibold sm:text-5xl lg:text-6xl'>
          Don&apos;t search for a trip.
          <br />
          <span className='text-primary'>Let your AI make the deal.</span>
        </motion.h1>

        <motion.p {...rise(0.12)} className='type-body text-muted-foreground max-w-xl text-lg'>
          Describe the trip you want. DealTrip turns it into hard constraints, negotiates with merchant agents that
          each defend their own margin, and settles through Razorpay. Refusing anything that falls outside policy.
        </motion.p>

        <motion.p
          {...rise(0.18)}
          className='type-caption text-muted-foreground flex items-center gap-1.5 text-sm'
        >
          <ShieldCheckIcon className='size-4 shrink-0' aria-hidden />
          Every money action explainable, bounded, gated and recorded.
        </motion.p>
      </div>
    </section>
  )
}

export default Hero

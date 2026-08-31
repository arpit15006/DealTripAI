'use client'

// Next Imports
import Link from 'next/link'

// Third-party Imports
import { motion } from 'motion/react'

// Component Imports
import { Button } from '@/components/ui/button'
import { Magnetic } from '@/components/ui/magnet'

const DUNE_IMAGE_URL = '/images/bg-beach-light.webp'
const DUNE_IMAGE_URL_DARK = '/images/bg-beach-dark.webp'

const duneMaskStyle = {
  maskImage: 'linear-gradient(to bottom, transparent 0px, black 48px, black 100%)',
  WebkitMaskImage: 'linear-gradient(to bottom, transparent 0px, black 48px, black 100%)'
}

const fadeUpVariants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } }
}

const ErrorPageView = () => {
  return (
    <div className='relative h-screen w-screen overflow-hidden bg-linear-to-b from-[#4496cd] via-[#3fa8dc] to-[#089dc6] dark:from-[#0f172a] dark:via-[#0f172a] dark:to-[#0f172a] dark:*:bg-linear-to-b'>
      <motion.span
        initial={{ opacity: 0, y: 'calc(-50% - 30px)' }}
        animate={{ opacity: 1, y: '-50%' }}
        transition={{ type: 'spring', stiffness: 100, damping: 16 }}
        className='absolute inset-x-0 top-1/2 z-0 bg-linear-to-b from-white from-30% to-transparent bg-clip-text text-center text-[clamp(10rem,16vw,16.625rem)] leading-none font-bold text-transparent'
      >
        404
      </motion.span>

      <Magnetic
        strength={0.1}
        range={1600}
        springOptions={{ stiffness: 60, damping: 20, mass: 0.6 }}
        style={{ display: 'block', ...duneMaskStyle }}
        className='pointer-events-none absolute bottom-[-33%] left-1/2 z-10 h-full w-[105%] -translate-x-1/2 transform overflow-hidden'
      >
        <img
          src={DUNE_IMAGE_URL}
          alt='Desert dunes at sunset'
          draggable={false}
          className='h-full w-full object-cover object-bottom dark:hidden'
        />
        <img
          src={DUNE_IMAGE_URL_DARK}
          alt='Desert dunes at sunset'
          draggable={false}
          className='hidden h-full w-full object-cover object-bottom dark:block'
        />
      </Magnetic>

      <motion.div
        className='absolute inset-x-0 bottom-[8%] z-20 flex flex-col items-center gap-6 px-6 text-center sm:bottom-[12%]'
        variants={{ show: { transition: { staggerChildren: 0.15, delayChildren: 0.5 } } }}
        initial='hidden'
        animate='show'
      >
        <motion.p variants={fadeUpVariants} className='text-primary-foreground text-xl drop-shadow-sm sm:text-2xl'>
          We couldn&apos;t find the page you are looking for
        </motion.p>
        <motion.div variants={fadeUpVariants}>
          <Button
            size='lg'
            className='rounded-full'
            render={<Link href='/' rel='noopener noreferrer' />}
            nativeButton={false}
          >
            Go back to home
          </Button>
        </motion.div>
      </motion.div>
    </div>
  )
}

export default ErrorPageView

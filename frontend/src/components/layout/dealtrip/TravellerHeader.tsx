'use client'

// Next Imports
import Link from 'next/link'

// Component Imports
import { Button } from '@/components/ui/button'
import ModeToggle from '@/components/layout/ModeToggle'
import Logo from '@/assets/svg/logo'

const TravellerHeader = () => {
  return (
    <header className='bg-background/80 sticky top-0 z-50 w-full border-b backdrop-blur-sm'>
      <div className='mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-4 sm:px-6'>
        <Link href='/' className='flex items-center gap-2.5'>
          <Logo className='size-8' />
          <span className='text-base font-semibold tracking-tight'>
            DealTrip
            <span className='text-muted-foreground ml-2 hidden text-xs font-normal sm:inline'>
              the agentic deal desk
            </span>
          </span>
        </Link>

        <nav className='flex items-center gap-1'>
          {/* Base UI composes via `render`, not `asChild`. */}
          <Button variant='ghost' size='sm' nativeButton={false} render={<Link href='/dashboard/merchants' />}>
            Merchants
          </Button>
          <Button variant='ghost' size='sm' className='max-sm:hidden' nativeButton={false} render={<Link href='/dashboard/agent-api' />}>
            Agent API
          </Button>
          <ModeToggle />
        </nav>
      </div>
    </header>
  )
}

export default TravellerHeader

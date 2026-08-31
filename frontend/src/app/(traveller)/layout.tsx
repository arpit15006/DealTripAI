// React Imports
import type { ReactNode } from 'react'

// Component Imports
import { Toaster } from '@/components/ui/sonner'
import TravellerHeader from '@/components/layout/dealtrip/TravellerHeader'

const TravellerLayout = ({ children }: Readonly<{ children: ReactNode }>) => {
  return (
    <div className='flex min-h-full w-full flex-col'>
      {/* First stop for a keyboard user: past the nav, straight to the work. */}
      <a href='#main' className='skip-link'>
        Skip to main content
      </a>

      <TravellerHeader />

      <main id='main' tabIndex={-1} className='flex flex-1 flex-col'>
        {children}
      </main>

      <footer className='type-caption text-muted-foreground border-t px-4 py-6 text-center text-xs sm:px-6'>
        Synthetic demonstration inventory built for the Razorpay Buildathon. Not real merchants and not bookable.
      </footer>

      <Toaster />
    </div>
  )
}

export default TravellerLayout

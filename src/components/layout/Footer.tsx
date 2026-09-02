// Next Imports
import Link from 'next/link'

// Hook Imports
import { useSettings } from '@/hooks/use-settings'

// Utils Imports
import { cn } from '@/lib/utils'

const Footer = () => {
  const { settings } = useSettings()

  return (
    <footer>
      <div
        className={cn(
          'text-muted-foreground mx-auto flex size-full items-center justify-between gap-3 px-4 py-3 max-sm:flex-col sm:gap-6 sm:px-6',
          settings.layout === 'compact' ? 'max-w-360' : 'w-full'
        )}
      >
        <p className='text-sm text-balance max-sm:text-center'>
          {`©${new Date().getFullYear()}`} DealTrip, the agentic deal desk for travel. Synthetic demonstration
          inventory built for the Razorpay Buildathon.
        </p>
        <div className='flex items-center gap-5 max-sm:hidden'>
          <Link
            href='/dashboard/agent-api'
            className='text-muted-foreground hover:text-foreground text-sm transition duration-300'
          >
            Agent API
          </Link>
          <Link
            href='/.well-known/agent-commerce.json'
            target='_blank'
            className='text-muted-foreground hover:text-foreground text-sm transition duration-300'
          >
            Discovery document
          </Link>
        </div>
      </div>
    </footer>
  )
}

export default Footer

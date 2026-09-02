'use client'

// React Imports
import { Suspense } from 'react'
import type { ReactNode } from 'react'

// Component Imports
import { SidebarInset } from '@/components/ui/sidebar'
import { Toaster } from '@/components/ui/sonner'
import Footer from '@/components/layout/Footer'
import Header from '@/components/layout/Header'
import Sidebar from '@/components/layout/Sidebar'

// Hook Imports
import { useSettings } from '@/hooks/use-settings'

// Util Imports
import { cn } from '@/lib/utils'
import { ScrollArea } from '@/components/ui/scroll-area'

const DashboardLayout = ({ children }: Readonly<{ children: ReactNode }>) => {
  const { settings } = useSettings()

  return (
    <div className='bg-muted flex h-dvh w-full min-w-0 overflow-hidden'>
      <Suspense>
        <Sidebar />
      </Suspense>
      <SidebarInset className='flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden md:peer-data-[variant=inset]:m-0 md:peer-data-[variant=inset]:mt-3 md:peer-data-[variant=inset]:rounded-none md:peer-data-[variant=inset]:rounded-tl-3xl md:peer-data-[variant=inset]:border'>
        <Header />
        <div className='min-h-0 flex-1'>
          <ScrollArea className='h-full'>
            <div className='flex min-h-full flex-col'>
              <main
                className={cn(
                  'mx-auto size-full flex-1 px-4 py-6 sm:px-6',
                  settings.layout === 'compact' ? 'mx-auto max-w-360' : 'w-full'
                )}
              >
                {children}
              </main>
              <Footer />
            </div>
            <Toaster />
          </ScrollArea>
        </div>
      </SidebarInset>
    </div>
  )
}

export default DashboardLayout

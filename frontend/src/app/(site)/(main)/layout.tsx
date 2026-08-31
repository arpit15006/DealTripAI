// React Imports
import type { ReactNode } from 'react'

// Component Imports
import { Toaster } from '@/components/ui/sonner'
import SiteFooter from '@/components/layout/site/SiteFooter'
import SiteHeader from '@/components/layout/site/SiteHeader'
import CtaSection from '@/views/pages/home/cta-section'

const MainLayout = ({ children }: Readonly<{ children: ReactNode }>) => {
  return (
    <div className='flex min-h-full w-full flex-col'>
      <SiteHeader />
      <main className='flex flex-col'>{children}</main>
      <CtaSection />
      <Toaster />
      <SiteFooter />
    </div>
  )
}

export default MainLayout

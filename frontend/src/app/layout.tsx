// React Imports
import type { ReactNode } from 'react'

import type { Metadata } from 'next'

// Next Imports
import { cookies } from 'next/headers'

import type { Settings } from '@/contexts/settingsContext'

// Component Imports
import Providers from '@/components/Providers'
import { TooltipProvider } from '@/components/ui/tooltip'

// Util Imports
import { cn } from '@/lib/utils'

// Font Imports
import { allFonts } from '@/utils/fonts'

// Style Imports
import './globals.css'
import ScrollToTop from '@/components/layout/ScrollToTop'

// Config Imports
import themeConfig from '@/configs/themeConfig'

export const metadata: Metadata = {
  title: 'Tourix - Shadcn UI Travel Management App Template',
  description:
    'Build modern travel platforms faster with Tourix Shadcn Travel Management App Template, featuring bookings, tour packages, customers, payments, invoices, and travel management tools.',
  openGraph: {
    title: 'Tourix - Shadcn UI Travel Management App Template',
    description:
      'Build modern travel platforms faster with Tourix Shadcn Travel Management App Template, featuring bookings, tour packages, customers, payments, invoices, and travel management tools.',
    type: 'website',
    siteName: 'Tourix',
    url: process.env.NEXT_PUBLIC_APP_URL,
    images: [
      {
        url: '/images/og-image.png',
        type: 'image/png',
        width: 1200,
        height: 630,
        alt: 'Tourix - Shadcn UI Travel Management App Template'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Tourix - Shadcn UI Travel Management App Template',
    description:
      'Build modern travel platforms faster with Tourix Shadcn Travel Management App Template, featuring bookings, tour packages, customers, payments, invoices, and travel management tools.'
  }
}

const RootLayout = async ({ children }: Readonly<{ children: ReactNode }>) => {
  // Get the settings cookie
  const cookieStore = await cookies()
  const settingsCookie = cookieStore.get(themeConfig.settingsCookieName)

  let settingsData: Settings | undefined

  if (settingsCookie) {
    try {
      settingsData = JSON.parse(settingsCookie.value) as Settings
    } catch (error) {
      console.error('Failed to parse settings cookie:', error)
    }
  }

  // Get the mode from settings or fall back to themeConfig default
  const mode = settingsData?.mode ?? themeConfig.mode

  // Get sidebar state from settings or fall back to themeConfig default
  const sidebarOpen = settingsData?.sidebarOpen ?? themeConfig.sidebarOpen

  const defaultOpen = sidebarOpen

  return (
    <html
      lang='en'
      className={cn(
        ...allFonts.map(f => f.variable),
        'flex min-h-full w-full antialiased',
        mode,
        'font-sans',
        'font-sans',
        'font-sans'
      )}
      suppressHydrationWarning
    >
      <body className='flex min-h-full w-full flex-auto flex-col'>
        <Providers settingsCookie={settingsData} sidebarDefaultOpen={defaultOpen}>
          <TooltipProvider>{children}</TooltipProvider>
        </Providers>

        <ScrollToTop />
      </body>
    </html>
  )
}

export default RootLayout

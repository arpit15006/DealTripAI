'use client'

// Third-party Imports
import { useTheme } from 'next-themes'
import { MoonStarIcon, SunIcon } from 'lucide-react'

// Type Imports
import type { Mode } from '@/contexts/settingsContext'

// Component Imports
import { Button } from '@/components/ui/button'

// Hook Imports
import { useSettings } from '@/hooks/use-settings'

const ModeToggle = () => {
  const { setTheme, resolvedTheme } = useTheme()
  const { settings, updateSettings } = useSettings()

  const handleModeChange = () => {
    const currentTheme = resolvedTheme || settings.mode || 'light'
    const newMode: Mode = currentTheme === 'dark' ? 'light' : 'dark'

    updateSettings({ mode: newMode })

    setTheme(newMode)
  }

  return (
    <Button variant='ghost' size='icon' className='relative' onClick={handleModeChange}>
      <MoonStarIcon className='scale-100 dark:scale-0' />
      <SunIcon className='absolute scale-0 dark:scale-100' />
      <span className='sr-only'>Toggle theme</span>
    </Button>
  )
}

export default ModeToggle

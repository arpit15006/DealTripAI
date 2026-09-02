'use client'

// React Imports
import { useEffect } from 'react'

// Third-party Imports
import { useTheme } from 'next-themes'

// Hook Imports
import { useSettings } from '@/hooks/use-settings'

/**
 * Applies the saved light/dark preference. Renders nothing.
 *
 * This effect used to live inside ModeToggle, so that button quietly did two
 * jobs: offering the control, and applying the preference. Taking the button
 * out of a header therefore took the preference with it, and that whole
 * surface lost its theme rather than merely losing a switch.
 *
 * Mounted alongside the provider that owns the setting, it survives any change
 * to the header chrome.
 */
const ModeSync = () => {
  const { setTheme } = useTheme()
  const { settings } = useSettings()

  useEffect(() => {
    if (settings.mode) setTheme(settings.mode)
  }, [settings.mode, setTheme])

  return null
}

export default ModeSync

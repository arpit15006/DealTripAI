'use client'

// React Imports
import { useSyncExternalStore } from 'react'

const emptySubscribe = () => () => {}

export const useMounted = () =>
  useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  )

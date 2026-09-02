'use client'

// Third-party Imports
import { create } from 'zustand'
import { useShallow } from 'zustand/react/shallow'

/**
 * The signed-in operator.
 *
 * DealTrip has no auth yet, so this is a single static identity used by the
 * dashboard chrome. It stays a store rather than a constant so that wiring a
 * real session later is a change to the initial state, not a change to every
 * component that reads it.
 */
export type AdminProfile = {
  firstName: string
  lastName: string
  email: string
  avatar: string
  role: string
}

type AdminProfileStore = {
  profile: AdminProfile
  setProfile: (profile: Partial<AdminProfile>) => void
}

export const useAdminProfileStore = create<AdminProfileStore>()(set => ({
  profile: {
    firstName: 'Deal',
    lastName: 'Desk',
    email: 'ops@dealtrip.ai',
    avatar: '',
    role: 'Marketplace operator'
  },
  setProfile: profile => set(state => ({ profile: { ...state.profile, ...profile } }))
}))

export const useAdminPersonalInfo = () =>
  useAdminProfileStore(useShallow(state => ({ profile: state.profile, setProfile: state.setProfile })))

// Third-party Imports
import { create } from 'zustand'

// Type Imports
import type { CurrentUser } from '@/types/account/user-types'

// Data Imports
import { db } from '@/fake-db/account/current-user'

type PersonalInfoInput = Pick<CurrentUser, 'firstName' | 'lastName' | 'email' | 'phone' | 'gender'> & {
  country: string
}

interface ProfileState {
  user: CurrentUser
  updatePersonalInfo: (input: PersonalInfoInput) => void
  updateAvatar: (avatar: string) => void
  removeAvatar: () => void
}

export const useProfileStore = create<ProfileState>()(set => ({
  user: db,

  updatePersonalInfo: ({ country, ...input }) =>
    set(state => ({
      user: { ...state.user, ...input, address: { ...state.user.address, country } }
    })),

  updateAvatar: avatar => set(state => ({ user: { ...state.user, avatar } })),

  removeAvatar: () => set(state => ({ user: { ...state.user, avatar: '' } }))
}))

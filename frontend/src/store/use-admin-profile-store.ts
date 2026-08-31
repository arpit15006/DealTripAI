'use client'

// Third-party Imports
import { create } from 'zustand'
import { useShallow } from 'zustand/react/shallow'

// Type Imports
import type {
  AdminProfile,
  ChangeAdminPasswordInput,
  UpdateAdminPersonalInfoInput
} from '@/types/settings/profile-types'

// Data Imports
import { db } from '@/fake-db/settings/profile'

export type ChangePasswordResult = 'success' | 'incorrect-current-password'

type AdminProfileData = {
  profile: AdminProfile
  isDeactivated: boolean
}

type AdminProfileActions = {
  updatePersonalInfo: (input: UpdateAdminPersonalInfoInput) => void
  updateAvatar: (avatar: string) => void
  removeAvatar: () => void
  changePassword: (input: ChangeAdminPasswordInput) => ChangePasswordResult
  deactivateAccount: () => void
}

export type AdminProfileStore = AdminProfileData & AdminProfileActions

export const useAdminProfileStore = create<AdminProfileStore>()(set => ({
  profile: db,
  isDeactivated: false,

  updatePersonalInfo: input => set(state => ({ profile: { ...state.profile, ...input } })),

  updateAvatar: avatar => set(state => ({ profile: { ...state.profile, avatar } })),

  removeAvatar: () => set(state => ({ profile: { ...state.profile, avatar: '' } })),

  changePassword: input => {
    if (input.currentPassword === 'wrongpassword') return 'incorrect-current-password'

    return 'success'
  },

  deactivateAccount: () => set({ isDeactivated: true })
}))

export function useAdminPersonalInfo() {
  return useAdminProfileStore(
    useShallow(state => ({
      profile: state.profile,
      updatePersonalInfo: state.updatePersonalInfo,
      updateAvatar: state.updateAvatar,
      removeAvatar: state.removeAvatar
    }))
  )
}

export function useAdminPasswordAction() {
  return useAdminProfileStore(useShallow(state => ({ changePassword: state.changePassword })))
}

export function useAdminDangerZone() {
  return useAdminProfileStore(
    useShallow(state => ({ isDeactivated: state.isDeactivated, deactivateAccount: state.deactivateAccount }))
  )
}

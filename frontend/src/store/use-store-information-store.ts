'use client'

// Third-party Imports
import { create } from 'zustand'
import { useShallow } from 'zustand/react/shallow'

// Type Imports
import type { CompanyProfile, LocalizationSettings, SocialLinks } from '@/types/settings/store-information-types'

// Data Imports
import { db } from '@/fake-db/settings/store-information'

type StoreInformationData = {
  companyProfile: CompanyProfile
  localization: LocalizationSettings
  socialLinks: SocialLinks
}

type StoreInformationActions = {
  updateCompanyProfile: (input: CompanyProfile) => void
  updateLocalization: (input: LocalizationSettings) => void
  updateSocialLinks: (input: SocialLinks) => void
}

export type StoreInformationStore = StoreInformationData & StoreInformationActions

export const useStoreInformationStore = create<StoreInformationStore>()(set => ({
  companyProfile: db.companyProfile,
  localization: db.localization,
  socialLinks: db.socialLinks,

  updateCompanyProfile: input => set({ companyProfile: input }),
  updateLocalization: input => set({ localization: input }),
  updateSocialLinks: input => set({ socialLinks: input })
}))

export function useCompanyProfile() {
  return useStoreInformationStore(
    useShallow(state => ({ companyProfile: state.companyProfile, updateCompanyProfile: state.updateCompanyProfile }))
  )
}

export function useLocalizationSettings() {
  return useStoreInformationStore(
    useShallow(state => ({ localization: state.localization, updateLocalization: state.updateLocalization }))
  )
}

export function useSocialLinks() {
  return useStoreInformationStore(
    useShallow(state => ({ socialLinks: state.socialLinks, updateSocialLinks: state.updateSocialLinks }))
  )
}

// Third-party Imports
import { z } from 'zod'

// Type Imports
import type { AdminProfile } from '@/types/settings/profile-types'
import { ADMIN_GENDER_LIST } from '@/types/settings/profile-types'

export const personalInfoSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Enter a valid email address'),
  phone: z.string().min(6, 'Enter a valid phone number'),
  jobTitle: z.string().min(2, 'Job title must be at least 2 characters'),
  bio: z.string().max(240, 'Bio must be 240 characters or fewer'),
  gender: z.enum(ADMIN_GENDER_LIST as [string, ...string[]]),
  timezone: z.string().min(1, 'Select a timezone'),
  language: z.string().min(1, 'Select a language'),
  avatar: z.string()
})

export type PersonalInfoFormValues = z.infer<typeof personalInfoSchema>

export const buildPersonalInfoDefaultValues = (profile: AdminProfile): PersonalInfoFormValues => ({
  firstName: profile.firstName,
  lastName: profile.lastName,
  email: profile.email,
  phone: profile.phone,
  jobTitle: profile.jobTitle,
  bio: profile.bio,
  gender: profile.gender,
  timezone: profile.timezone,
  language: profile.language,
  avatar: profile.avatar
})

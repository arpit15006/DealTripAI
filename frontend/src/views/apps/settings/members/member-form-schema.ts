// Third-party Imports
import { z } from 'zod'

// Type Imports
import type { Member } from '@/types/settings/members-types'

export const memberSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Enter a valid email address'),
  phone: z.string().min(6, 'Enter a valid phone number'),
  jobTitle: z.string().min(2, 'Job title must be at least 2 characters'),
  role: z.string().min(1, 'Role is required')
})

export type MemberFormValues = z.infer<typeof memberSchema>

export const MEMBER_FORM_DEFAULT_VALUES: MemberFormValues = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  jobTitle: '',
  role: ''
}

export const buildMemberFormDefaultValues = (member: Member): MemberFormValues => ({
  firstName: member.firstName,
  lastName: member.lastName,
  email: member.email,
  phone: member.phone,
  jobTitle: member.jobTitle,
  role: member.role
})

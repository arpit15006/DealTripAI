export type AdminGender = 'male' | 'female' | 'other'

export const ADMIN_GENDER_LIST: AdminGender[] = ['male', 'female', 'other']

export interface AdminProfile {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  avatar: string
  jobTitle: string
  bio: string
  gender: AdminGender
  timezone: string
  language: string
}

export type UpdateAdminPersonalInfoInput = Pick<
  AdminProfile,
  'firstName' | 'lastName' | 'email' | 'phone' | 'jobTitle' | 'bio' | 'gender' | 'timezone' | 'language'
>

export interface ChangeAdminPasswordInput {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

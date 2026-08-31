// Third-party Imports
import { z } from 'zod'

export const PASSWORD_REQUIREMENTS = [
  { regex: /.{12,}/, text: 'At least 12 characters' },
  { regex: /[a-z]/, text: 'At least 1 lowercase letter' },
  { regex: /[A-Z]/, text: 'At least 1 uppercase letter' },
  { regex: /[0-9]/, text: 'At least 1 number' },
  { regex: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/, text: 'At least 1 special character' }
]

export const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Enter your current password'),
    newPassword: z.string().refine(value => PASSWORD_REQUIREMENTS.every(req => req.regex.test(value)), {
      message: 'Password does not meet all requirements'
    }),
    confirmPassword: z.string()
  })
  .refine(data => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword']
  })

export type PasswordFormValues = z.infer<typeof passwordSchema>

export const PASSWORD_FORM_DEFAULT_VALUES: PasswordFormValues = {
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
}

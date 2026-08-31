// Third-party Imports
import { z } from 'zod'

export const localizationSchema = z.object({
  currency: z.string().min(1, 'Select a currency'),
  timezone: z.string().min(1, 'Select a timezone'),
  language: z.string().min(1, 'Select a language'),
  dateFormat: z.string().min(1, 'Select a date format'),
  weekStart: z.string().min(1, 'Select a week start day')
})

export type LocalizationFormValues = z.infer<typeof localizationSchema>

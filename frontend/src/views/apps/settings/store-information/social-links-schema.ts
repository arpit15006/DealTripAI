// Third-party Imports
import { z } from 'zod'

const optionalUrl = z.union([z.literal(''), z.string().url('Enter a valid URL')])

export const socialLinksSchema = z.object({
  instagram: optionalUrl,
  facebook: optionalUrl,
  twitter: optionalUrl
})

export type SocialLinksFormValues = z.infer<typeof socialLinksSchema>

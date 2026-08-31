// Third-party Imports
import { z } from 'zod'

export const editCustomerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters.'),
  email: z.string().email('Enter a valid email address.'),
  phone: z.string().min(7, 'Enter a valid phone number.'),
  status: z.enum(['active', 'inactive', 'pending'])
})

export type EditCustomerFormValues = z.infer<typeof editCustomerSchema>

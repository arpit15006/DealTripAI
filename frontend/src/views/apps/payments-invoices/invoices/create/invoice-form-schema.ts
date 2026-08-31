// Third-party Imports
import { addDays } from 'date-fns'
import { z } from 'zod'

export const invoiceLineItemSchema = z.object({
  label: z.string().min(1, 'Item is required.'),
  description: z.string().optional(),
  quantity: z.number().min(1, 'Quantity must be at least 1.'),
  unitPrice: z.number().min(0, 'Unit price must be 0 or greater.')
})

export const invoiceFormSchema = z.object({
  transactionId: z.string().min(1, 'Select a transaction to invoice.'),
  dueDate: z.date(),
  billToName: z.string().min(1, 'Customer name is required.'),
  billToEmail: z.string().email('Enter a valid email address.'),
  billToPhone: z.string().optional(),
  lineItems: z.array(invoiceLineItemSchema).min(1, 'Add at least one line item.'),
  discountAmount: z.number().min(0, 'Discount cannot be negative.'),
  couponCode: z.string().optional(),
  taxRate: z.number().min(0).max(100, 'Tax rate cannot exceed 100%.'),
  notes: z.string().optional()
})

export type InvoiceFormValues = z.infer<typeof invoiceFormSchema>

const DEFAULT_DUE_DAYS = 14

export const buildBlankInvoiceFormValues = (transactionId = ''): InvoiceFormValues => ({
  transactionId,
  dueDate: addDays(new Date(), DEFAULT_DUE_DAYS),
  billToName: '',
  billToEmail: '',
  billToPhone: '',
  lineItems: [{ label: '', description: '', quantity: 1, unitPrice: 0 }],
  discountAmount: 0,
  couponCode: '',
  taxRate: 0,
  notes: ''
})

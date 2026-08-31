export type CheckoutStep = 'enter-info' | 'payment' | 'confirmation'

export type PaymentMethod = 'card' | 'upi'

export type TravelerGender = 'male' | 'female' | 'other'

export interface BookingContactInfo {
  firstName: string
  lastName: string
  email: string
  phone: string
}

export interface TravelerInfo {
  firstName: string
  lastName: string
  email: string
  phone: string
  age: number
  gender: TravelerGender
}

export interface SavedPaymentMethod {
  id: string
  name: string
  expiry: string
  logo: string
  alt: string
}

export interface AddCardInput {
  cardName: string
  cardNumber: string
  expiryDate: string
}

export interface PaymentResult {
  method: PaymentMethod
  cardLast4?: string
}

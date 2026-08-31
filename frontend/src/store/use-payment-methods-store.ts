// Third-party Imports
import { create } from 'zustand'

// Type Imports
import type { AddCardInput, SavedPaymentMethod } from '@/types/packages/checkout-types'

// Data Imports
import { db } from '@/fake-db/packages/payment-methods'

const CARD_BRAND_LOGOS: Record<'visa' | 'mastercard', { logo: string; alt: string }> = {
  visa: { logo: '/images/brands/visa.webp', alt: 'Visa' },
  mastercard: { logo: '/images/brands/mastercard.webp', alt: 'Mastercard' }
}

const detectCardBrand = (cardNumber: string): 'visa' | 'mastercard' => {
  return cardNumber.trim().startsWith('4') ? 'visa' : 'mastercard'
}

const buildNewCard = (input: AddCardInput): SavedPaymentMethod => {
  const digits = input.cardNumber.replace(/\D/g, '')
  const last4 = digits.slice(-4)
  const brand = detectCardBrand(digits)
  const { logo, alt } = CARD_BRAND_LOGOS[brand]

  return {
    id: crypto.randomUUID(),
    name: `${alt} ending in ${last4}`,
    expiry: input.expiryDate,
    logo,
    alt
  }
}

interface PaymentMethodsState {
  items: SavedPaymentMethod[]
  addCard: (input: AddCardInput) => void
  updateCard: (id: string, expiry: string) => void
  removeCard: (id: string) => void
}

export const usePaymentMethodsStore = create<PaymentMethodsState>()(set => ({
  items: db,

  addCard: input => set(state => ({ items: [...state.items, buildNewCard(input)] })),

  updateCard: (id, expiry) =>
    set(state => ({ items: state.items.map(item => (item.id === id ? { ...item, expiry } : item)) })),

  removeCard: id => set(state => ({ items: state.items.filter(item => item.id !== id) }))
}))

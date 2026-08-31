// Third-party Imports
import { create } from 'zustand'
import { format } from 'date-fns'

// Type Imports
import type { Coupon, CreateCouponInput, UpdateCouponInput } from '@/types/apps/coupon-types'

// Utils Imports
import { getCouponStatus } from '@/utils/coupon-utils'

// Data Imports
import { db } from '@/fake-db/apps/coupons'

export const MAX_FEATURED_COUPONS = 4

type CouponsData = {
  items: Coupon[]
}

export type ToggleFeaturedResult = 'featured' | 'unfeatured' | 'limit-reached' | 'not-active'

type CouponsActions = {
  addCoupon: (input: CreateCouponInput) => string
  updateCoupon: (id: string, input: UpdateCouponInput) => void
  deleteCoupon: (id: string) => void
  toggleCouponStatus: (id: string) => void
  duplicateCoupon: (id: string) => void

  incrementUsageByCode: (code: string) => void

  decrementUsageByCode: (code: string) => void

  toggleFeatured: (id: string) => ToggleFeaturedResult
}

export type CouponsStore = CouponsData & CouponsActions

export const useCouponsStore = create<CouponsStore>()((set, get) => ({
  items: db,

  addCoupon: input => {
    const id = crypto.randomUUID()
    const today = format(new Date(), 'yyyy-MM-dd')

    const newCoupon: Coupon = {
      ...input,
      id,
      usedCount: input.usedCount ?? 0,
      isActive: input.isActive ?? true,
      isFeatured: input.isFeatured ?? false,
      createdAt: input.createdAt ?? today,
      updatedAt: input.updatedAt ?? today
    }

    set(state => ({ items: [newCoupon, ...state.items] }))

    return id
  },

  updateCoupon: (id, input) => {
    const today = format(new Date(), 'yyyy-MM-dd')

    set(state => ({
      items: state.items.map(item => (item.id === id ? { ...item, ...input, updatedAt: today } : item))
    }))
  },

  deleteCoupon: id => set(state => ({ items: state.items.filter(item => item.id !== id) })),

  toggleCouponStatus: id => {
    const today = format(new Date(), 'yyyy-MM-dd')

    set(state => ({
      items: state.items.map(item => (item.id === id ? { ...item, isActive: !item.isActive, updatedAt: today } : item))
    }))
  },

  incrementUsageByCode: code => {
    const normalized = code.trim().toUpperCase()

    set(state => ({
      items: state.items.map(item =>
        item.code.toUpperCase() === normalized ? { ...item, usedCount: item.usedCount + 1 } : item
      )
    }))
  },

  decrementUsageByCode: code => {
    const normalized = code.trim().toUpperCase()

    set(state => ({
      items: state.items.map(item =>
        item.code.toUpperCase() === normalized ? { ...item, usedCount: Math.max(0, item.usedCount - 1) } : item
      )
    }))
  },

  duplicateCoupon: id => {
    const source = get().items.find(item => item.id === id)

    if (!source) return

    const today = format(new Date(), 'yyyy-MM-dd')

    const duplicate: Coupon = {
      ...source,
      id: crypto.randomUUID(),
      code: `${source.code}-COPY`,
      title: `${source.title} (Copy)`,
      usedCount: 0,
      isActive: false,
      isFeatured: false,
      createdAt: today,
      updatedAt: today
    }

    set(state => ({ items: [duplicate, ...state.items] }))
  },

  toggleFeatured: id => {
    const target = get().items.find(item => item.id === id)

    if (!target) return 'not-active'

    if (!target.isFeatured) {
      if (getCouponStatus(target) !== 'active') return 'not-active'

      const featuredCount = get().items.filter(item => item.isFeatured).length

      if (featuredCount >= MAX_FEATURED_COUPONS) return 'limit-reached'
    }

    const today = format(new Date(), 'yyyy-MM-dd')

    set(state => ({
      items: state.items.map(item =>
        item.id === id ? { ...item, isFeatured: !item.isFeatured, updatedAt: today } : item
      )
    }))

    return target.isFeatured ? 'unfeatured' : 'featured'
  }
}))

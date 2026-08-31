// Third-party Imports
import { create } from 'zustand'
import { format } from 'date-fns'

// Type Imports
import type { CreateCustomerInput, Customer, CustomerStatus, UpdateCustomerInput } from '@/types/apps/customer-types'

// Data Imports
import { db } from '@/fake-db/apps/customers'

type CustomersData = {
  items: Customer[]
}

type CustomersActions = {
  deleteCustomer: (id: string) => void
  importCustomers: (customers: CreateCustomerInput[]) => void
  updateCustomer: (id: string, input: UpdateCustomerInput) => void
  setCustomerStatus: (id: string, status: CustomerStatus) => void
}

export type CustomersStore = CustomersData & CustomersActions

export const useCustomersStore = create<CustomersStore>()(set => ({
  items: db,

  deleteCustomer: id => set(state => ({ items: state.items.filter(item => item.id !== id) })),

  importCustomers: customers => {
    const today = format(new Date(), 'yyyy-MM-dd')

    const newCustomers: Customer[] = customers.map(customer => ({
      ...customer,
      id: crypto.randomUUID(),
      avatar: customer.avatar ?? '',
      registeredAt: customer.registeredAt ?? today,
      updatedAt: customer.updatedAt ?? today
    }))

    set(state => ({ items: [...newCustomers, ...state.items] }))
  },

  updateCustomer: (id, input) => {
    const today = format(new Date(), 'yyyy-MM-dd')

    set(state => ({
      items: state.items.map(item => (item.id === id ? { ...item, ...input, updatedAt: today } : item))
    }))
  },

  setCustomerStatus: (id, status) => {
    const today = format(new Date(), 'yyyy-MM-dd')

    set(state => ({
      items: state.items.map(item => (item.id === id ? { ...item, status, updatedAt: today } : item))
    }))
  }
}))

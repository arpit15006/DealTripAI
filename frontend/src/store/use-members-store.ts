// Third-party Imports
import { create } from 'zustand'
import { format } from 'date-fns'

// Type Imports
import type { CreateMemberInput, Member, MemberStatus, UpdateMemberInput } from '@/types/settings/members-types'

// Data Imports
import { db } from '@/fake-db/settings/members'

type MembersData = {
  items: Member[]
}

type MembersActions = {
  addMember: (input: CreateMemberInput) => void
  updateMember: (id: string, input: UpdateMemberInput) => void
  deleteMember: (id: string) => void
  setMemberStatus: (id: string, status: MemberStatus) => void
}

export type MembersStore = MembersData & MembersActions

export const useMembersStore = create<MembersStore>()(set => ({
  items: db,

  addMember: input => {
    const today = format(new Date(), 'yyyy-MM-dd')

    const newMember: Member = {
      ...input,
      id: crypto.randomUUID(),
      avatar: input.avatar ?? '',
      status: input.status ?? 'invited',
      joinedAt: input.joinedAt ?? today,
      updatedAt: input.updatedAt ?? today
    }

    set(state => ({ items: [newMember, ...state.items] }))
  },

  updateMember: (id, input) => {
    const today = format(new Date(), 'yyyy-MM-dd')

    set(state => ({
      items: state.items.map(item => (item.id === id ? { ...item, ...input, updatedAt: today } : item))
    }))
  },

  deleteMember: id => set(state => ({ items: state.items.filter(item => item.id !== id) })),

  setMemberStatus: (id, status) => {
    const today = format(new Date(), 'yyyy-MM-dd')

    set(state => ({
      items: state.items.map(item => (item.id === id ? { ...item, status, updatedAt: today } : item))
    }))
  }
}))

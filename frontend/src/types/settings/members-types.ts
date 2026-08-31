export type MemberStatus = 'active' | 'invited' | 'suspended'

export const MEMBER_STATUS_LIST: MemberStatus[] = ['active', 'invited', 'suspended']

export const MEMBER_STATUS_STYLES: Record<MemberStatus, { dot: string; text: string; bg: string }> = {
  active: {
    dot: 'bg-green-600 dark:bg-green-400',
    text: 'text-green-600 dark:text-green-400',
    bg: 'bg-green-600/10 dark:bg-green-400/10'
  },
  invited: {
    dot: 'bg-amber-600 dark:bg-amber-400',
    text: 'text-amber-600 dark:text-amber-400',
    bg: 'bg-amber-600/10 dark:bg-amber-400/10'
  },
  suspended: { dot: 'bg-destructive', text: 'text-destructive', bg: 'bg-destructive/10' }
}

export interface Member {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  avatar: string
  jobTitle: string
  role: string
  status: MemberStatus
  joinedAt: string
  updatedAt: string
}

export type CreateMemberInput = Omit<Member, 'id' | 'avatar' | 'status' | 'joinedAt' | 'updatedAt'> &
  Partial<Pick<Member, 'avatar' | 'status' | 'joinedAt' | 'updatedAt'>>

export type UpdateMemberInput = Pick<Member, 'firstName' | 'lastName' | 'email' | 'phone' | 'jobTitle' | 'role'>

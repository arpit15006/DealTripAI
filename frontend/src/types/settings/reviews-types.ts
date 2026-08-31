export type ReviewStatus = 'published' | 'pending' | 'rejected'

export const REVIEW_STATUS_LIST: ReviewStatus[] = ['published', 'pending', 'rejected']

export const REVIEW_STATUS_STYLES: Record<ReviewStatus, { dot: string; text: string; bg: string }> = {
  published: {
    dot: 'bg-green-600 dark:bg-green-400',
    text: 'text-green-600 dark:text-green-400',
    bg: 'bg-green-600/10 dark:bg-green-400/10'
  },
  pending: {
    dot: 'bg-amber-600 dark:bg-amber-400',
    text: 'text-amber-600 dark:text-amber-400',
    bg: 'bg-amber-600/10 dark:bg-amber-400/10'
  },
  rejected: { dot: 'bg-destructive', text: 'text-destructive', bg: 'bg-destructive/10' }
}

export interface Review {
  id: string
  userName: string
  userAvatar: string
  tourPackageTitle: string
  rating: number
  review: string
  date: string
  status: ReviewStatus
}

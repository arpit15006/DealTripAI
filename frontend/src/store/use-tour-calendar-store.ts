'use client'

// React Imports
import { useMemo } from 'react'

// Third-party Imports
import { addDays, addMonths, subMonths } from 'date-fns'
import { create } from 'zustand'
import { useShallow } from 'zustand/react/shallow'

// Type Imports
import type { TourCalendarEvent, TourCalendarView } from '@/types/packages/tour-calendar-types'
import type { TourPackageCategory } from '@/types/packages/tour-package-types'
import { TOUR_PACKAGE_CATEGORY_LIST } from '@/types/packages/tour-package-types'

const DEFAULT_VIEW: TourCalendarView = 'month'

export const AGENDA_DAYS_TO_SHOW = 30

const hasSameCategorySelection = (current: TourPackageCategory[], next: TourPackageCategory[]) =>
  current.length === next.length && current.every(category => next.includes(category))

const getActiveCategories = (showAllCategories: boolean, selectedCategories: TourPackageCategory[]) =>
  showAllCategories ? TOUR_PACKAGE_CATEGORY_LIST : selectedCategories

type TourCalendarData = {
  currentDate: Date
  view: TourCalendarView
  secondarySelectedDate: Date | undefined
  secondaryMonth: Date
  showAllCategories: boolean
  selectedCategories: TourPackageCategory[]
  isDialogOpen: boolean
  selectedEvent: TourCalendarEvent | null
}

type TourCalendarActions = {
  initialize: (options?: { initialView?: TourCalendarView }) => void
  setView: (view: TourCalendarView) => void
  goToPrevious: () => void
  goToNext: () => void
  goToToday: () => void
  selectSecondaryDate: (date: Date | undefined) => void
  setSecondaryMonth: (month: Date) => void
  setShowAllCategories: (checked: boolean) => void
  toggleCategoryFilter: (category: TourPackageCategory, checked: boolean) => void
  openDialog: (event: TourCalendarEvent) => void
  closeDialog: () => void
}

export type TourCalendarStore = TourCalendarData & TourCalendarActions

export const useTourCalendarStore = create<TourCalendarStore>((set, get) => ({
  currentDate: new Date(),
  view: DEFAULT_VIEW,
  secondarySelectedDate: new Date(),
  secondaryMonth: new Date(),
  showAllCategories: true,
  selectedCategories: [...TOUR_PACKAGE_CATEGORY_LIST],
  isDialogOpen: false,
  selectedEvent: null,

  initialize: ({ initialView } = {}) => {
    const updates: Partial<TourCalendarData> = {}

    if (initialView && get().view !== initialView) updates.view = initialView

    if (Object.keys(updates).length > 0) set(updates)
  },

  setView: view => {
    if (get().view === view) return
    set({ view })
  },

  goToPrevious: () => {
    const { view, currentDate } = get()

    set({ currentDate: view === 'agenda' ? addDays(currentDate, -AGENDA_DAYS_TO_SHOW) : subMonths(currentDate, 1) })
  },

  goToNext: () => {
    const { view, currentDate } = get()

    set({ currentDate: view === 'agenda' ? addDays(currentDate, AGENDA_DAYS_TO_SHOW) : addMonths(currentDate, 1) })
  },

  goToToday: () => set({ currentDate: new Date() }),

  selectSecondaryDate: date => {
    if (!date) return
    set({ secondarySelectedDate: date, currentDate: date })
  },

  setSecondaryMonth: month => set({ secondaryMonth: month }),

  setShowAllCategories: checked => {
    const { showAllCategories, selectedCategories } = get()

    if (checked) {
      if (showAllCategories && hasSameCategorySelection(selectedCategories, TOUR_PACKAGE_CATEGORY_LIST)) return
      set({ showAllCategories: true, selectedCategories: [...TOUR_PACKAGE_CATEGORY_LIST] })
    } else {
      if (!showAllCategories && selectedCategories.length === 0) return
      set({ showAllCategories: false, selectedCategories: [] })
    }
  },

  toggleCategoryFilter: (category, checked) => {
    const { showAllCategories, selectedCategories } = get()
    const activeCategories = getActiveCategories(showAllCategories, selectedCategories)

    const next = checked
      ? [...new Set([...activeCategories, category])]
      : activeCategories.filter(item => item !== category)

    if (next.length === TOUR_PACKAGE_CATEGORY_LIST.length) {
      if (showAllCategories && hasSameCategorySelection(selectedCategories, TOUR_PACKAGE_CATEGORY_LIST)) return
      set({ showAllCategories: true, selectedCategories: [...TOUR_PACKAGE_CATEGORY_LIST] })
    } else {
      if (!showAllCategories && hasSameCategorySelection(selectedCategories, next)) return
      set({ showAllCategories: false, selectedCategories: next })
    }
  },

  openDialog: event => set({ selectedEvent: event, isDialogOpen: true }),
  closeDialog: () => set({ isDialogOpen: false, selectedEvent: null })
}))

export function useFilteredTourCalendarEvents(events: TourCalendarEvent[]) {
  const showAllCategories = useTourCalendarStore(state => state.showAllCategories)
  const selectedCategories = useTourCalendarStore(state => state.selectedCategories)

  return useMemo(() => {
    if (showAllCategories) return events

    return events.filter(event => selectedCategories.includes(event.category))
  }, [events, showAllCategories, selectedCategories])
}

export function useTourCalendarNavigation() {
  return useTourCalendarStore(
    useShallow(state => ({
      currentDate: state.currentDate,
      view: state.view,
      setView: state.setView,
      goToPrevious: state.goToPrevious,
      goToNext: state.goToNext,
      goToToday: state.goToToday
    }))
  )
}

export function useSecondaryTourCalendar() {
  return useTourCalendarStore(
    useShallow(state => ({
      secondarySelectedDate: state.secondarySelectedDate,
      secondaryMonth: state.secondaryMonth,
      selectSecondaryDate: state.selectSecondaryDate,
      setSecondaryMonth: state.setSecondaryMonth
    }))
  )
}

export function useTourCalendarFilters() {
  return useTourCalendarStore(
    useShallow(state => ({
      showAllCategories: state.showAllCategories,
      selectedCategories: state.selectedCategories,
      setShowAllCategories: state.setShowAllCategories,
      toggleCategoryFilter: state.toggleCategoryFilter
    }))
  )
}

export function useTourCalendarDialog() {
  return useTourCalendarStore(
    useShallow(state => ({
      isDialogOpen: state.isDialogOpen,
      selectedEvent: state.selectedEvent,
      openDialog: state.openDialog,
      closeDialog: state.closeDialog
    }))
  )
}

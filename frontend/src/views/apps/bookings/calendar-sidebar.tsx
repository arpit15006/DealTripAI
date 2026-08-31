'use client'

// Component Imports
import { Calendar } from '@/components/ui/calendar'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'

// Store Imports
import { useSecondaryTourCalendar, useTourCalendarFilters } from '@/store/use-tour-calendar-store'

// Utils Imports
import { cn } from '@/lib/utils'
import { CATEGORY_FILTER_OPTIONS } from '@/utils/tour-calendar-utils'

type CalendarSidebarProps = {
  eventDates: Date[]
}

const CalendarSidebar = ({ eventDates }: CalendarSidebarProps) => {
  const { secondarySelectedDate, secondaryMonth, selectSecondaryDate, setSecondaryMonth } = useSecondaryTourCalendar()

  const { showAllCategories, selectedCategories, setShowAllCategories, toggleCategoryFilter } = useTourCalendarFilters()

  return (
    <>
      <div className='p-2'>
        <Calendar
          mode='single'
          className='w-full'
          selected={secondarySelectedDate}
          onSelect={selectSecondaryDate}
          month={secondaryMonth}
          onMonthChange={setSecondaryMonth}
          modifiers={{ hasDeparture: eventDates }}
          modifiersClassNames={{
            hasDeparture:
              'after:absolute after:bottom-1 after:left-1/2 after:-translate-x-1/2 after:size-1 after:rounded-full after:bg-primary'
          }}
        />
      </div>

      <div className='flex flex-col gap-4 p-4'>
        <span className='text-lg font-semibold'>Categories</span>
        <div className='flex flex-col gap-3'>
          <div className='flex items-center gap-2'>
            <Checkbox
              id='filter-all'
              checked={showAllCategories}
              onCheckedChange={checked => setShowAllCategories(checked === true)}
            />
            <Label htmlFor='filter-all' className='cursor-pointer font-normal'>
              All
            </Label>
          </div>
          {CATEGORY_FILTER_OPTIONS.map(option => {
            const isChecked = showAllCategories || selectedCategories.includes(option.value)

            return (
              <div key={option.value} className='flex items-center gap-2'>
                <Checkbox
                  id={`filter-${option.value}`}
                  checked={isChecked}
                  onCheckedChange={checked => toggleCategoryFilter(option.value, checked === true)}
                  aria-label={option.label}
                />
                <span className={cn('size-2 shrink-0 rounded-full', option.dotClass)} aria-hidden='true' />
                <Label htmlFor={`filter-${option.value}`} className='cursor-pointer text-sm font-normal'>
                  {option.label}
                </Label>
              </div>
            )
          })}
        </div>
      </div>
    </>
  )
}

export default CalendarSidebar

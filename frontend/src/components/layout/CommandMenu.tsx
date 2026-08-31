'use client'

// React Imports
import { Fragment, cloneElement, useCallback, useEffect, useState } from 'react'
import type { ReactElement } from 'react'

// Next Imports
import { useRouter } from 'next/navigation'

// Third-party Imports
import { HomeIcon, UserCircleIcon, MapIcon, SearchIcon, TicketIcon, HeartIcon } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

// Component Imports
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut
} from '@/components/ui/command'

// Type Imports
import type { SearchData } from '@/assets/data/search'

// Data Imports
import { searchData } from '@/assets/data/search'

type SuggestionItem = {
  icon: LucideIcon
  name: string
  href: string
}

const DEFAULT_SUGGESTIONS: SuggestionItem[] = [
  { icon: HomeIcon, name: 'Home', href: '/' },
  { icon: UserCircleIcon, name: 'User Pages', href: '/my-dashboard' },
  { icon: TicketIcon, name: 'My Bookings', href: '/my-dashboard/bookings' },
  { icon: HeartIcon, name: 'My Favourites', href: '/my-dashboard/favourites' },
  { icon: MapIcon, name: 'Tour Packages', href: '/tour-packages' }
]

type CommandMenuProps = {
  trigger?: ReactElement<{ onClick?: () => void }>
  compactTrigger?: ReactElement<{ onClick?: () => void }>
  data?: SearchData[]
  suggestions?: SuggestionItem[]
}

const CommandMenu = ({
  trigger,
  compactTrigger,
  data = searchData,
  suggestions = DEFAULT_SUGGESTIONS
}: CommandMenuProps) => {
  // States
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')

  // Hooks
  const router = useRouter()

  const runCommand = useCallback((command: () => unknown) => {
    setOpen(false)
    command()
  }, [])

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.key === 'k' && (e.metaKey || e.ctrlKey)) || e.key === '/') {
        if (
          (e.target instanceof HTMLElement && e.target.isContentEditable) ||
          e.target instanceof HTMLInputElement ||
          e.target instanceof HTMLTextAreaElement ||
          e.target instanceof HTMLSelectElement
        ) {
          return
        }

        e.preventDefault()
        setOpen(open => !open)
      }
    }

    document.addEventListener('keydown', down)

    return () => document.removeEventListener('keydown', down)
  }, [])

  return (
    <>
      {compactTrigger && cloneElement(compactTrigger, { onClick: () => setOpen(true) })}
      {trigger ? (
        cloneElement(trigger, { onClick: () => setOpen(true) })
      ) : (
        <Button variant='ghost' className='hidden px-2.5 font-normal sm:block' onClick={() => setOpen(true)}>
          <div className='text-muted-foreground hidden items-center gap-1.5 text-sm sm:flex'>
            <SearchIcon />
            <span>Type to search...</span>
          </div>
        </Button>
      )}
      <CommandDialog open={open} onOpenChange={setOpen}>
        <Command
          className='[&_[cmdk-group-heading]]:text-muted-foreground **:data-[slot=command-input-wrapper]:h-12 [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group]]:px-2 [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 [&_[cmdk-input-wrapper]_svg]:h-5 [&_[cmdk-input-wrapper]_svg]:w-5 [&_[cmdk-input]]:h-12 [&_[cmdk-item]]:px-2 [&_[cmdk-item]]:py-3 [&_[cmdk-item]_svg]:h-5 [&_[cmdk-item]_svg]:w-5'
          filter={(value, search, keywords) => {
            search = search.toLowerCase()
            value = value.toLowerCase()

            if (value === search) return 2

            if (value.includes(search)) return 1.5

            if (keywords && keywords.length > 0) {
              if (keywords.some(keyword => keyword.toLowerCase() === search)) return 1.25

              const extendedValue = value + ' ' + keywords.join(' ').toLowerCase()

              if (extendedValue.includes(search)) return 1
            }

            return 0
          }}
        >
          <CommandInput placeholder='Type a command or search...' value={search} onValueChange={setSearch} />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            {search ? (
              data.map((searchGroup, index) => (
                <Fragment key={index}>
                  <CommandGroup heading={searchGroup.title}>
                    {searchGroup.data.map((item, i) => (
                      <CommandItem
                        key={i}
                        keywords={item.tags}
                        onSelect={() =>
                          runCommand(() => {
                            if (item.openInNewTab) {
                              window.open(item.href, '_blank', 'noopener,noreferrer')
                            } else {
                              router.push(item.href)
                            }
                          })
                        }
                      >
                        <item.icon />
                        <span>{item.name}</span>
                        {item.shortcut && <CommandShortcut>{item.shortcut}</CommandShortcut>}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                  {index !== data.length - 1 && <CommandSeparator />}
                </Fragment>
              ))
            ) : (
              <CommandGroup heading='Suggestions'>
                {suggestions.map(item => (
                  <CommandItem key={item.href} onSelect={() => runCommand(() => router.push(item.href))}>
                    <item.icon />
                    <span>{item.name}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </CommandDialog>
    </>
  )
}

export default CommandMenu

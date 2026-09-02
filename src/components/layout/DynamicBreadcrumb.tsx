'use client'

// React Imports
import { Fragment, useMemo } from 'react'

// Next Imports
import Link from 'next/link'
import { usePathname } from 'next/navigation'

// Component Imports
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from '@/components/ui/breadcrumb'

// Config Imports
import type { MenuGroupSubItem, MenuItem, MenuSubItem } from '@/configs/navConfig'
import { navItems } from '@/configs/navConfig'
import { cn } from '@/lib/utils'

const isSubGroup = (item: MenuSubItem): item is MenuGroupSubItem => 'childItems' in item

const humanize = (segment: string) =>
  segment
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')

const buildLabelMap = (items: MenuItem[]) => {
  const map = new Map<string, string>()

  for (const item of items) {
    if (item.href) map.set(item.href, item.label)

    item.childItems?.forEach(subItem => {
      if (isSubGroup(subItem)) {
        subItem.childItems.forEach(leaf => map.set(leaf.href, leaf.label))
      } else {
        map.set(subItem.href, subItem.label)
      }
    })
  }

  return map
}

const labelMap = navItems.reduce(
  (map, group) => new Map([...map, ...buildLabelMap(group.items)]),
  new Map<string, string>()
)

const DynamicBreadcrumb = ({ className }: { className?: string }) => {
  const pathname = usePathname()

  const crumbs = useMemo(() => {
    const segments = pathname.split('/').filter(Boolean)

    return segments.map((segment, index) => {
      const href = `/${segments.slice(0, index + 1).join('/')}`

      return { href, label: labelMap.get(href) ?? humanize(segment) }
    })
  }, [pathname])

  if (crumbs.length === 0) return null

  return (
    <Breadcrumb className={cn(className)}>
      <BreadcrumbList className='flex-nowrap'>
        {crumbs.map((crumb, index) => (
          <Fragment key={crumb.href}>
            <BreadcrumbItem className={index < crumbs.length - 1 ? 'hidden sm:inline-flex' : undefined}>
              {index === crumbs.length - 1 ? (
                <BreadcrumbPage className='truncate'>{crumb.label}</BreadcrumbPage>
              ) : (
                <BreadcrumbLink render={<Link href={crumb.href} />}>{crumb.label}</BreadcrumbLink>
              )}
            </BreadcrumbItem>
            {index < crumbs.length - 1 && <BreadcrumbSeparator className='hidden sm:inline-flex' />}
          </Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  )
}

export default DynamicBreadcrumb

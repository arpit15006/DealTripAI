// Third-party Imports
import { CircleCheckIcon, CircleXIcon } from 'lucide-react'

// Component Imports
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

type ServicesComparisonProps = {
  includedServices: string[]
  excludedServices: string[]
}

const ServicesComparison = ({ includedServices, excludedServices }: ServicesComparisonProps) => {
  const rowCount = Math.max(includedServices.length, excludedServices.length)

  const rows = Array.from({ length: rowCount }, (_, index) => ({
    included: includedServices[index],
    excluded: excludedServices[index]
  }))

  return (
    <div className='flex flex-col gap-4'>
      <h2 className='text-lg font-semibold'>What&apos;s Included &amp; Excluded</h2>
      <div className='overflow-hidden rounded-lg border'>
        <Table>
          <TableHeader>
            <TableRow className='bg-muted *:border-border [&>:not(:last-child)]:border-r'>
              <TableHead className='w-1/2'>Included</TableHead>
              <TableHead className='w-1/2'>Excluded</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row, index) => (
              <TableRow key={index} className='*:border-border [&>:not(:last-child)]:border-r'>
                <TableCell className='align-top whitespace-normal'>
                  {row.included && (
                    <span className='flex items-start gap-2'>
                      <CircleCheckIcon className='mt-0.5 size-4 shrink-0 text-green-600 dark:text-green-400' />
                      {row.included}
                    </span>
                  )}
                </TableCell>
                <TableCell className='align-top whitespace-normal'>
                  {row.excluded && (
                    <span className='flex items-start gap-2'>
                      <CircleXIcon className='text-destructive mt-0.5 size-4 shrink-0' />
                      {row.excluded}
                    </span>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

export default ServicesComparison

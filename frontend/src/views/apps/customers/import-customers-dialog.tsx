'use client'

// React Imports
import { useState } from 'react'
import type { ChangeEvent } from 'react'

// Third-party Imports
import Papa from 'papaparse'

// Type Imports
import type { CreateCustomerInput, CustomerStatus } from '@/types/apps/customer-types'
import { CUSTOMER_STATUS_LIST } from '@/types/apps/customer-types'

// Component Imports
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

type ImportCustomersDialogProps = {
  open: boolean
  onClose: () => void
  onImport: (customers: CreateCustomerInput[]) => void
}

const PREVIEW_ROW_LIMIT = 5
const REQUIRED_FIELDS = ['name', 'email'] as const
const DEFAULT_STATUS: CustomerStatus = 'pending'

const getRowValue = (row: Record<string, string>, keys: string[]): string | undefined => {
  for (const key of keys) {
    const value = row[key]?.trim()

    if (value) return value
  }

  return undefined
}

const parseStatus = (value: string | undefined): CustomerStatus =>
  CUSTOMER_STATUS_LIST.includes(value as CustomerStatus) ? (value as CustomerStatus) : DEFAULT_STATUS

const ImportCustomersDialog = ({ open, onClose, onImport }: ImportCustomersDialogProps) => {
  const [parsedRows, setParsedRows] = useState<Partial<CreateCustomerInput>[]>([])
  const [errorCount, setErrorCount] = useState(0)
  const [fileName, setFileName] = useState<string | null>(null)

  const handleClose = () => {
    setParsedRows([])
    setErrorCount(0)
    setFileName(null)
    onClose()
  }

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]

    if (!file) return

    setFileName(file.name)

    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      complete: results => {
        let invalidRows = 0

        const rows = results.data.map(row => {
          const name = getRowValue(row, ['name', 'Name'])
          const email = getRowValue(row, ['email', 'Email'])

          if (!name || !email) invalidRows += 1

          return {
            name,
            email,
            phone: getRowValue(row, ['phone', 'Phone']) ?? '',
            status: parseStatus(getRowValue(row, ['status', 'Status']))
          } satisfies Partial<CreateCustomerInput>
        })

        setParsedRows(rows)
        setErrorCount(invalidRows)
      }
    })

    event.target.value = ''
  }

  const handleImport = () => {
    const validRows = parsedRows.filter(row => REQUIRED_FIELDS.every(field => Boolean(row[field]?.toString().trim())))

    if (validRows.length === 0) return

    onImport(validRows as CreateCustomerInput[])
    handleClose()
  }

  const previewRows = parsedRows.slice(0, PREVIEW_ROW_LIMIT)

  return (
    <Dialog open={open} onOpenChange={isOpen => !isOpen && handleClose()}>
      <DialogContent className='flex max-h-[min(90vh,720px)] w-[90vw] max-w-2xl flex-col overflow-auto sm:max-w-2xl'>
        <DialogHeader>
          <DialogTitle>Import Customers</DialogTitle>
          <DialogDescription>Upload a CSV file to preview and import customers into the list.</DialogDescription>
        </DialogHeader>

        <div className='min-h-0 flex-1 space-y-4 overflow-y-auto pr-1'>
          <Input type='file' accept='.csv,text/csv' onChange={handleFileChange} />

          {fileName ? <p className='text-muted-foreground text-sm'>Selected file: {fileName}</p> : null}

          {errorCount > 0 ? (
            <p className='text-destructive text-sm'>
              {errorCount} row{errorCount === 1 ? '' : 's'} missing required fields (name, email).
            </p>
          ) : null}

          {previewRows.length > 0 ? (
            <div className='overflow-hidden rounded-md border'>
              <div className='overflow-x-auto'>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className='whitespace-nowrap'>Name</TableHead>
                      <TableHead className='whitespace-nowrap'>Email</TableHead>
                      <TableHead className='whitespace-nowrap'>Phone</TableHead>
                      <TableHead className='whitespace-nowrap'>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {previewRows.map((row, index) => (
                      <TableRow key={`${row.email}-${index}`}>
                        <TableCell className='max-w-40 truncate whitespace-nowrap'>{row.name ?? '—'}</TableCell>
                        <TableCell className='max-w-52 truncate whitespace-nowrap'>{row.email ?? '—'}</TableCell>
                        <TableCell className='whitespace-nowrap'>{row.phone || '—'}</TableCell>
                        <TableCell className='whitespace-nowrap capitalize'>{row.status ?? '—'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              {parsedRows.length > PREVIEW_ROW_LIMIT ? (
                <p className='text-muted-foreground border-t px-4 py-2 text-sm'>
                  Showing first {PREVIEW_ROW_LIMIT} of {parsedRows.length} rows.
                </p>
              ) : null}
            </div>
          ) : null}
        </div>

        <DialogFooter>
          <Button variant='outline' onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleImport} disabled={parsedRows.length === 0 || parsedRows.length === errorCount}>
            Confirm Import
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default ImportCustomersDialog

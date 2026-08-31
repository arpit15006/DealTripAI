// Third-party Imports
import { format } from 'date-fns'
import Papa from 'papaparse'
import * as XLSX from 'xlsx'

// Type Imports
import type { Customer } from '@/types/apps/customer-types'

type CustomerExportRow = {
  ID: string
  Name: string
  Email: string
  Phone: string
  Status: string
  'Registration Date': string
  'Last Updated': string
}

const toExportRows = (customers: Customer[]): CustomerExportRow[] =>
  customers.map(customer => ({
    ID: customer.id,
    Name: customer.name,
    Email: customer.email,
    Phone: customer.phone,
    Status: customer.status,
    'Registration Date': format(new Date(customer.registeredAt), 'dd MMM yyyy'),
    'Last Updated': format(new Date(customer.updatedAt), 'dd MMM yyyy')
  }))

const getExportFilename = (extension: string): string =>
  `customers-export-${format(new Date(), 'yyyy-MM-dd')}.${extension}`

const downloadBlob = (blob: Blob, filename: string): void => {
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)

  link.setAttribute('href', url)
  link.setAttribute('download', filename)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export function exportCustomersToCSV(customers: Customer[]): void {
  const csv = Papa.unparse(toExportRows(customers), { header: true })

  downloadBlob(new Blob([csv], { type: 'text/csv;charset=utf-8;' }), getExportFilename('csv'))
}

export function exportCustomersToExcel(customers: Customer[]): void {
  const worksheet = XLSX.utils.json_to_sheet(toExportRows(customers))
  const workbook = XLSX.utils.book_new()

  XLSX.utils.book_append_sheet(workbook, worksheet, 'Customers')
  worksheet['!cols'] = [{ wch: 14 }, { wch: 22 }, { wch: 30 }, { wch: 18 }, { wch: 12 }, { wch: 16 }, { wch: 16 }]

  XLSX.writeFile(workbook, getExportFilename('xlsx'))
}

export function exportCustomersToJSON(customers: Customer[]): void {
  const json = JSON.stringify(toExportRows(customers), null, 2)

  downloadBlob(new Blob([json], { type: 'application/json' }), getExportFilename('json'))
}

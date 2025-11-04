import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format as formatDateFns } from 'date-fns'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(value: number | string, locale = 'en-IN') {
  const num = typeof value === 'string' ? Number(value) : value
  if (Number.isNaN(num)) return ''
  const nf = new Intl.NumberFormat(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  return `${nf.format(num)} ₹`
}

export function formatDate(date: string | Date, pattern = 'dd/MM/yyyy') {
  return formatDateFns(new Date(date), pattern)
}

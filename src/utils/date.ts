import { format, formatDistanceToNow, isPast, isToday, isWithinInterval, addDays, parseISO } from 'date-fns'
import { ru } from 'date-fns/locale'

export function formatDate(iso: string | null): string {
  if (!iso) return '—'
  return format(parseISO(iso), 'd MMM yyyy', { locale: ru })
}

export function formatDateTime(iso: string | null): string {
  if (!iso) return '—'
  return format(parseISO(iso), 'd MMM yyyy, HH:mm', { locale: ru })
}

export function relativeTime(iso: string): string {
  return formatDistanceToNow(parseISO(iso), { addSuffix: true, locale: ru })
}

export function isOverdue(dueDate: string | null, status: string): boolean {
  if (!dueDate || status === 'done') return false
  return isPast(parseISO(dueDate)) && !isToday(parseISO(dueDate))
}

export function isDueSoon(dueDate: string | null, status: string): boolean {
  if (!dueDate || status === 'done') return false
  const date = parseISO(dueDate)
  return isWithinInterval(date, { start: new Date(), end: addDays(new Date(), 7) }) || isToday(date)
}

export function minutesToHuman(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (h === 0) return `${m} мин`
  if (m === 0) return `${h} ч`
  return `${h} ч ${m} мин`
}

export function toDatetimeLocalValue(iso: string | null): string {
  if (!iso) return ''
  return iso.slice(0, 16)
}

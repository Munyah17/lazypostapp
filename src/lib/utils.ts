import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, formatDistanceToNow } from 'date-fns'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date, pattern = 'MMM d, yyyy') {
  return format(new Date(date), pattern)
}

export function timeAgo(date: string | Date) {
  return formatDistanceToNow(new Date(date), { addSuffix: true })
}

export function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return n.toString()
}

export function truncate(str: string, length: number) {
  return str.length > length ? str.slice(0, length) + '…' : str
}

export function slugify(str: string) {
  return str.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '')
}

export function getInitials(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export function extractHashtags(text: string): string[] {
  const matches = text.match(/#\w+/g)
  return matches ? matches.map((h) => h.slice(1)) : []
}

export function countTweetChars(text: string): number {
  const urlRegex = /https?:\/\/\S+/g
  return text.replace(urlRegex, '        ').length
}

export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export const PLAN_COLORS: Record<string, string> = {
  free: 'text-slate-400',
  starter: 'text-blue-400',
  pro: 'text-violet-400',
  agency: 'text-amber-400',
}

export const PLAN_BADGES: Record<string, string> = {
  free: 'bg-slate-800 text-slate-300',
  starter: 'bg-blue-900/50 text-blue-300',
  pro: 'bg-violet-900/50 text-violet-300',
  agency: 'bg-amber-900/50 text-amber-300',
}

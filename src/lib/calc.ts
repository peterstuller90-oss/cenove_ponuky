import type { Line, Quote, Settings } from './types'

const r2 = (n: number) => Math.round(n * 100) / 100

export const lineTotal = (l: Line) => r2(l.qty * l.unitPrice * (l.coef || 1))

export function totals(q: Pick<Quote, 'lines' | 'discountPct' | 'depositPct'>, s: Pick<Settings, 'vatPayer' | 'vatRate'>) {
  const subtotal = r2(q.lines.reduce((sum, l) => sum + lineTotal(l), 0))
  const discount = r2(subtotal * (q.discountPct || 0) / 100)
  const base = r2(subtotal - discount)
  const vat = s.vatPayer ? r2(base * s.vatRate / 100) : 0
  const total = r2(base + vat)
  const deposit = r2(total * (q.depositPct || 0) / 100)
  return { subtotal, discount, base, vat, total, deposit }
}

const eur = new Intl.NumberFormat('sk-SK', { style: 'currency', currency: 'EUR' })
const num = new Intl.NumberFormat('sk-SK', { maximumFractionDigits: 2 })
export const money = (n: number) => eur.format(n)
export const fmtNum = (n: number) => num.format(n)
export const fmtDate = (iso: string) => iso ? new Date(iso + (iso.length === 10 ? 'T12:00:00' : '')).toLocaleDateString('sk-SK') : ''

export const today = () => new Date().toISOString().slice(0, 10)
export function addDays(iso: string, days: number) {
  const d = new Date(iso + 'T12:00:00')
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
}

export const uid = () => crypto.randomUUID()
/** Long random token for the client's link; unguessable, URL-safe. */
export function token() {
  const b = crypto.getRandomValues(new Uint8Array(18))
  return btoa(String.fromCharCode(...b)).replace(/\+/g, '-').replace(/\//g, '_')
}

/** Next number like CP-2026-004, counting quotes of the current year. */
export function nextNumber(existing: string[], prefix: string) {
  const year = new Date().getFullYear()
  const head = `${prefix}-${year}-`
  const max = existing.filter((n) => n.startsWith(head)).map((n) => parseInt(n.slice(head.length), 10) || 0).reduce((a, b) => Math.max(a, b), 0)
  return head + String(max + 1).padStart(3, '0')
}

import type { Category, Freebies, Line, Quote, Settings, TaxSettings } from './types'

const r2 = (n: number) => Math.round(n * 100) / 100

export const lineTotal = (l: Line) => r2(Math.max(0, l.qty - (l.free || 0)) * l.unitPrice * (l.coef || 1))

/** Mockup and print-prep lines from the price list: their kind and the name shown on the quote. */
export function productLine(category: Category, name: string): { kind?: Line['kind']; name: string } {
  if (category === 'aplikacia') return { kind: 'mockup', name: `Mockup: ${name}` }
  if (category === 'tlac') return { kind: 'tlac', name: `Príprava do tlače: ${name}` }
  return { name }
}

const isTshirt = (l: Line) => /trič|tric|t-shirt/i.test(l.name)

/**
 * Mark the free units on a quote's lines: mockups on a T-shirt, then mockups on any product,
 * then print-ready files (in line order). Returns the same array when nothing changed.
 */
export function applyFreebies(lines: Line[], f: Freebies): Line[] {
  const free = new Map<string, number>()
  const give = (l: Line, left: number) => {
    const n = Math.max(0, Math.min(Math.floor(l.qty) - (free.get(l.id) ?? 0), left))
    if (n > 0) free.set(l.id, (free.get(l.id) ?? 0) + n)
    return left - n
  }
  let tee = f.tshirtMockups, other = f.otherMockups, print = f.printPreps
  for (const l of lines) if (l.kind === 'mockup' && isTshirt(l)) tee = give(l, tee)
  for (const l of lines) if (l.kind === 'mockup') other = give(l, other)
  for (const l of lines) if (l.kind === 'tlac') print = give(l, print)
  let changed = false
  const out = lines.map((l) => {
    const n = free.get(l.id) ?? 0
    if ((l.free ?? 0) === n) return l
    changed = true
    return { ...l, free: n }
  })
  return changed ? out : lines
}

/** Health insurance and income tax the authors pay from a fee, and what is left on hand. */
export function levies(fee: number, t: TaxSettings) {
  if (t.mode === 'zrazka') {
    const tax = r2(fee * t.withholdPct / 100)
    return { health: 0, tax, net: r2(fee - tax), base: fee }
  }
  const base = fee * (1 - t.expensePct / 100)
  const health = r2(base * t.healthPct / 100)
  const tax = r2(Math.max(0, base - health) * t.taxPct / 100)
  return { health, tax, net: r2(fee - health - tax), base: r2(base) }
}

/** Share of the fee that goes to levies (0.18 = 18 %). */
export function levyRate(t: TaxSettings) {
  return 1 - levies(1000, t).net / 1000
}

export function totals(q: Pick<Quote, 'lines' | 'discountPct' | 'depositPct'> & Partial<Pick<Quote, 'orgPct'>>, s: Pick<Settings, 'tax'>) {
  const subtotal = r2(q.lines.reduce((sum, l) => sum + lineTotal(l), 0))
  const org = r2(subtotal * (q.orgPct || 0) / 100)
  const afterOrg = subtotal + org
  const discount = r2(afterOrg * (q.discountPct || 0) / 100)
  const priced = r2(afterOrg - discount)
  // Price list in "on hand" amounts: gross the fee up so that the levies are covered.
  const total = s.tax.pricesAreNet ? r2(priced / (1 - levyRate(s.tax))) : priced
  const deposit = r2(total * (q.depositPct || 0) / 100)
  const l = levies(total, s.tax)
  return { subtotal, org, discount, total, deposit, rest: r2(total - deposit), ...l }
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

export const slug = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '')

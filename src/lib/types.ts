export type Category = 'ilustracia' | 'logo' | 'mural' | 'aplikacia' | 'workshop' | 'doplnky' | 'ine'

export const CATEGORIES: { id: Category; label: string }[] = [
  { id: 'ilustracia', label: 'Ilustrácia' },
  { id: 'logo', label: 'Logo / logotyp' },
  { id: 'mural', label: 'Mural' },
  { id: 'aplikacia', label: 'Aplikácia na produkty' },
  { id: 'workshop', label: 'Workshop' },
  { id: 'doplnky', label: 'Doplnky (materiál, doprava…)' },
  { id: 'ine', label: 'Iné' },
]

export const UNITS = ['paušál', 'ks', 'm²', 'hod', 'osoba', 'deň', 'km', 'noc'] as const

export interface PriceItem {
  id: string
  category: Category
  name: string
  unit: string
  price: number
  note: string
  sort: number
  active: boolean
  /** True while the price is Claude's guess and has not been confirmed by Peter. */
  placeholder: boolean
}

export interface Complexity { label: string; coef: number }

export interface Company {
  name: string
  person: string
  address: string
  ico: string
  dic: string
  icdph: string
  iban: string
  email: string
  phone: string
  web: string
}

export interface Settings {
  company: Company
  vatPayer: boolean
  vatRate: number
  validityDays: number
  depositPct: number
  numberPrefix: string
  complexity: Complexity[]
  intro: string
  terms: string
}

export interface Client {
  id: string
  name: string
  company: string
  ico: string
  dic: string
  address: string
  email: string
  phone: string
}

export interface Line {
  id: string
  name: string
  description: string
  qty: number
  unit: string
  unitPrice: number
  /** Multiplier, e.g. mural complexity. 1 when unused. */
  coef: number
  coefLabel: string
}

export type Status = 'koncept' | 'odoslana' | 'prijata' | 'zamietnuta'

export const STATUSES: { id: Status; label: string }[] = [
  { id: 'koncept', label: 'Koncept' },
  { id: 'odoslana', label: 'Odoslaná' },
  { id: 'prijata', label: 'Prijatá' },
  { id: 'zamietnuta', label: 'Zamietnutá' },
]

export interface Quote {
  id: string
  number: string
  status: Status
  publicToken: string
  client: Omit<Client, 'id'>
  title: string
  intro: string
  issueDate: string
  validUntil: string
  lines: Line[]
  discountPct: number
  depositPct: number
  note: string
  acceptedAt: string | null
  acceptedName: string
  createdAt: string
  updatedAt: string
}

/** What the client sees through the shared link. */
export interface PublicQuote { quote: Quote; settings: Settings }

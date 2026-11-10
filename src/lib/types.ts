export type Category = 'ilustracia' | 'logo' | 'mural' | 'aplikacia' | 'tlac' | 'workshop' | 'doplnky' | 'ine'

export const CATEGORIES: { id: Category; label: string }[] = [
  { id: 'ilustracia', label: 'Ilustrácia' },
  { id: 'logo', label: 'Logo / logotyp' },
  { id: 'mural', label: 'Mural' },
  { id: 'aplikacia', label: 'Mockupy na produkty' },
  { id: 'tlac', label: 'Príprava do tlače' },
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

/** What every client gets for free with a design. */
export interface Freebies {
  /** Mockups on a T-shirt. */
  tshirtMockups: number
  /** Mockups on any product the client picks. */
  otherMockups: number
  /** Print-ready files for one product. */
  printPreps: number
}

export interface Complexity { label: string; coef: number }

/** Price adjustment by who the client is (a school pays less than a company). */
export interface OrgType { label: string; pct: number }

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

/** One of the authors who signs the contract (natural person, not a business). */
export interface Author { name: string; born: string; address: string }

/**
 * How author fees are taxed. 'priznanie': the author files a tax return (flat 60 % expenses,
 * health insurance and income tax from what is left). 'zrazka': the client withholds 19 % and that's it.
 */
export interface TaxSettings {
  mode: 'priznanie' | 'zrazka'
  expensePct: number
  healthPct: number
  taxPct: number
  withholdPct: number
  /** When true, price-list prices are what you want on hand and the client price is grossed up. */
  pricesAreNet: boolean
}

export interface Settings {
  company: Company
  authors: Author[]
  tax: TaxSettings
  orgTypes: OrgType[]
  /** Kept for old data; authors are not VAT payers. */
  vatPayer: boolean
  vatRate: number
  validityDays: number
  depositPct: number
  numberPrefix: string
  complexity: Complexity[]
  freebies: Freebies
  intro: string
  terms: string
  contractTemplate: string
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
  /** Mockup of the design on a product, or print-ready files for a product. Drives the free allowance. */
  kind?: 'mockup' | 'tlac'
  /** Units given for free (set automatically by applyFreebies). */
  free?: number
}

export type Status = 'koncept' | 'odoslana' | 'prijata' | 'zamietnuta'

export const STATUSES: { id: Status; label: string }[] = [
  { id: 'koncept', label: 'Koncept' },
  { id: 'odoslana', label: 'Poslaná' },
  { id: 'prijata', label: 'Podpísaná' },
  { id: 'zamietnuta', label: 'Zamietnutá' },
]

/** What the client wrote in the brief PDF, label → answer, shown to Peter as-is. */
export interface BriefAnswer { label: string; value: string }

export interface ContractInfo {
  place: string
  deadline: string
  exclusive: boolean
  territory: string
  duration: string
  uses: string
}

export interface Quote {
  id: string
  number: string
  status: Status
  publicToken: string
  client: Omit<Client, 'id'>
  orgType: string
  orgPct: number
  title: string
  intro: string
  issueDate: string
  validUntil: string
  lines: Line[]
  discountPct: number
  depositPct: number
  note: string
  brief: BriefAnswer[]
  contract: ContractInfo
  acceptedAt: string | null
  acceptedName: string
  createdAt: string
  updatedAt: string
}

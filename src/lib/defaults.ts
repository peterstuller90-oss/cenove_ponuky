import { slug } from './calc'
import { DEFAULT_CONTRACT } from './contractTemplate'
import type { Category, PriceItem, Settings } from './types'

// Starting price list. Every price is a placeholder (marked "over cenu" in the app) until Peter edits it.
type Seed = [Category, string, string, number, string?]

const SEED: Seed[] = [
  ['ilustracia', 'Tematická ilustrácia', 'paušál', 350, 'Na zadanie klienta, vrátane 2 kôl pripomienok'],
  ['ilustracia', 'Voľná ilustrácia', 'paušál', 250, 'Autorská ilustrácia v štýle Štullers'],
  ['logo', 'Logo / logotyp', 'paušál', 450, 'Návrh, 2 kolá pripomienok, finálne dáta'],

  ['aplikacia', 'Tričko', 'ks', 20, 'Vizualizácia návrhu na produkte'],
  ['aplikacia', 'Taška', 'ks', 20, 'Vizualizácia návrhu na produkte'],
  ['aplikacia', 'Čiapka', 'ks', 20, 'Vizualizácia návrhu na produkte'],
  ['aplikacia', 'Šiltovka', 'ks', 20, 'Vizualizácia návrhu na produkte'],
  ['aplikacia', 'Mikina', 'ks', 20, 'Vizualizácia návrhu na produkte'],
  ['aplikacia', 'Nohavice', 'ks', 20, 'Vizualizácia návrhu na produkte'],
  ['aplikacia', 'Kraťasy', 'ks', 20, 'Vizualizácia návrhu na produkte'],
  ['aplikacia', 'Nálepky', 'ks', 20, 'Vizualizácia návrhu na produkte'],
  ['aplikacia', 'Zimná čiapka', 'ks', 20, 'Vizualizácia návrhu na produkte'],
  ['aplikacia', 'Bufka', 'ks', 20, 'Vizualizácia návrhu na produkte'],
  ['aplikacia', 'Office produkty', 'ks', 30, 'Vizitky, hlavičkový papier, podpis do e-mailu… (pri voľnej ilustrácii a logu)'],

  ['mural', 'Voľný mural', 'm²', 70, 'Autorský motív'],
  ['mural', 'Tematický mural', 'm²', 90, 'Motív na zadanie klienta'],

  ['workshop', 'Maľovanie na stenu', 'osoba', 25],
  ['workshop', 'Farebné kompozície', 'osoba', 25],
  ['workshop', 'Tímový workshop', 'osoba', 35],
  ['workshop', 'Workshop pre deti', 'osoba', 20],
  ['workshop', 'Vonkajší workshop', 'osoba', 30],
  ['workshop', 'Firemný event', 'osoba', 40],

  ['doplnky', 'Návrh / skica', 'paušál', 150],
  ['doplnky', 'Farby a materiál', 'm²', 12],
  ['doplnky', 'Plošina / lešenie', 'deň', 120],
  ['doplnky', 'Doprava', 'km', 0.4, 'Z Trenčína a späť'],
  ['doplnky', 'Ubytovanie', 'noc', 60],
  ['doplnky', 'Licencia na použitie diela', 'paušál', 200],
]

export const DEFAULT_PRICES: PriceItem[] = SEED.map(([category, name, unit, price, note], i) => ({
  id: `seed-${i + 1}`, category, name, unit, price, note: note ?? '', sort: i, active: true, placeholder: true,
}))

/** Print-ready files, one per product from the mockup list (placeholder prices). */
export function printPrepFor(products: PriceItem[], startSort: number): PriceItem[] {
  return products.map((p, i) => ({
    id: `tlac-${slug(p.name)}`, category: 'tlac', name: p.name, unit: 'ks', price: /office/i.test(p.name) ? 60 : 40,
    note: 'Finálne tlačové dáta pre výrobcu', sort: startSort + i, active: p.active, placeholder: true,
  }))
}
DEFAULT_PRICES.push(...printPrepFor(DEFAULT_PRICES.filter((p) => p.category === 'aplikacia'), DEFAULT_PRICES.length))

export const DEFAULT_SETTINGS: Settings = {
  company: {
    name: 'Štullers Creative',
    person: 'Peter Štuller',
    address: 'Trenčín',
    ico: '', dic: '', icdph: '', iban: '',
    email: '',
    phone: '',
    web: 'instagram.com/stullers_creative',
  },
  authors: [
    { name: 'Peter Štuller', born: '', address: 'Trenčín' },
    { name: '', born: '', address: '' },
  ],
  tax: { mode: 'priznanie', expensePct: 60, healthPct: 16, taxPct: 15, withholdPct: 19, pricesAreNet: false },
  orgTypes: [
    { label: 'Súkromná osoba', pct: 0 },
    { label: 'Firma', pct: 20 },
    { label: 'Mesto / obec / štátna inštitúcia', pct: 0 },
    { label: 'Škola', pct: -10 },
    { label: 'Nezisková organizácia / OZ', pct: -15 },
    { label: 'Festival / kultúrna inštitúcia', pct: -10 },
  ],
  contractTemplate: DEFAULT_CONTRACT,
  vatPayer: false,
  vatRate: 23,
  validityDays: 30,
  depositPct: 50,
  numberPrefix: 'CP',
  complexity: [
    { label: 'Jednoduchý', coef: 1 },
    { label: 'Stredný', coef: 1.3 },
    { label: 'Detailný', coef: 1.6 },
  ],
  freebies: { tshirtMockups: 1, otherMockups: 2, printPreps: 1 },
  intro: 'Ďakujeme za záujem o spoluprácu. Na základe vášho zadania posielame cenovú ponuku.',
  terms: 'Zálohu platíte pri podpise zmluvy, zvyšok po odovzdaní diela. Ceny murálov platia pri bežne prístupnej stene; pri zhoršenom prístupe alebo poveternostných podmienkach sa termín môže posunúť.',
}

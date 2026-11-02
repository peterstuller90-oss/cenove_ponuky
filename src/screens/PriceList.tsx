import { useState } from 'react'
import { NumInput, toast } from '../components/ui'
import { uid } from '../lib/calc'
import { CATEGORIES, UNITS, type Category, type PriceItem } from '../lib/types'

export function PriceList({ prices, onSave, onDelete }: { prices: PriceItem[]; onSave: (p: PriceItem) => Promise<void>; onDelete: (id: string) => Promise<void> }) {
  const unconfirmed = prices.filter((p) => p.placeholder && p.active).length
  async function add(category: Category) {
    const sort = Math.max(0, ...prices.map((p) => p.sort)) + 1
    await onSave({ id: uid(), category, name: 'Nová položka', unit: 'paušál', price: 0, note: '', sort, active: true, placeholder: false })
  }
  return (
    <>
      <h1 className="page-title">Cenník</h1>
      {unconfirmed > 0 && (
        <div className="banner">
          {unconfirmed} cien je zatiaľ len odhad (označené <span className="pill pill-warn">over cenu</span>). Prepíš ich na svoje, alebo ich potvrď ťuknutím na štítok.
        </div>
      )}
      {CATEGORIES.map((c) => {
        const items = prices.filter((p) => p.category === c.id).sort((a, b) => a.sort - b.sort)
        return (
          <section key={c.id} className="stack" style={{ gap: 8 }}>
            <p className="section-title">{c.label}</p>
            <div className="card" style={{ padding: '4px 16px' }}>
              {items.map((p) => <PriceRow key={p.id} item={p} onSave={onSave} onDelete={onDelete} />)}
              <button className="link-btn" onClick={() => add(c.id)}>+ Pridať položku</button>
            </div>
          </section>
        )
      })}
    </>
  )
}

function PriceRow({ item, onSave, onDelete }: { item: PriceItem; onSave: (p: PriceItem) => Promise<void>; onDelete: (id: string) => Promise<void> }) {
  const [p, setP] = useState(item)
  const [dirty, setDirty] = useState(false)
  const edit = (patch: Partial<PriceItem>) => { setP((x) => ({ ...x, ...patch })); setDirty(true) }
  const commit = (next = p) => { if (dirty || next !== p) { setDirty(false); onSave(next).catch((e) => toast('Neuložené: ' + e.message)) } }
  const now = (patch: Partial<PriceItem>) => { const next = { ...p, ...patch }; setP(next); onSave(next).catch((e) => toast('Neuložené: ' + e.message)) }
  return (
    <div className={p.active ? 'price-row' : 'price-row off'} onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node)) commit() }}>
      <div className="name-cell">
        <div className="row" style={{ gap: 6, flexWrap: 'nowrap' }}>
          <input aria-label="Názov" value={p.name} onChange={(e) => edit({ name: e.target.value })} />
          {p.placeholder && <button className="pill pill-warn" title="Potvrdiť cenu" onClick={() => now({ placeholder: false })}>over cenu</button>}
        </div>
        <input className="note" aria-label="Popis" placeholder="Popis na ponuke" value={p.note} onChange={(e) => edit({ note: e.target.value })} />
      </div>
      <label><span className="muted" style={{ fontSize: 12 }}>€</span>
        <NumInput aria-label={`Cena: ${p.name}`} value={p.price} onChange={(n) => edit({ price: n, placeholder: false })} />
      </label>
      <label className="unit-cell"><span className="muted" style={{ fontSize: 12 }}>za</span>
        <select aria-label="Jednotka" value={p.unit} onChange={(e) => now({ unit: e.target.value })}>
          {[...new Set([...UNITS, p.unit])].map((u) => <option key={u}>{u}</option>)}
        </select>
      </label>
      <div className="stack" style={{ gap: 4 }}>
        <button className="icon-btn" title={p.active ? 'Skryť z ponúk' : 'Zobraziť v ponukách'} aria-label={p.active ? 'Skryť' : 'Zobraziť'} onClick={() => now({ active: !p.active })}>{p.active ? '👁' : '—'}</button>
        <button className="icon-btn danger" aria-label="Zmazať" onClick={() => { if (confirm(`Zmazať „${p.name}“ z cenníka?`)) onDelete(p.id) }}>✕</button>
      </div>
    </div>
  )
}

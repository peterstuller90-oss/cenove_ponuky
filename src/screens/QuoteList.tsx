import { useState } from 'react'
import { fmtDate, money, totals } from '../lib/calc'
import { STATUSES, type Quote, type Settings, type Status } from '../lib/types'

export function QuoteList({ quotes, settings, onOpen, onNew }: { quotes: Quote[]; settings: Settings; onOpen: (id: string) => void; onNew: () => void }) {
  const [filter, setFilter] = useState<Status | 'all'>('all')
  const [q, setQ] = useState('')
  const shown = quotes
    .filter((x) => filter === 'all' || x.status === filter)
    .filter((x) => !q || `${x.number} ${x.title} ${x.client.name} ${x.client.company}`.toLowerCase().includes(q.toLowerCase()))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  const sum = (s: Status[]) => quotes.filter((x) => s.includes(x.status)).reduce((acc, x) => acc + totals(x, settings).total, 0)
  return (
    <>
      <div className="topline">
        <h1 className="page-title">Ponuky</h1>
        <button className="btn-primary" onClick={onNew}>+ Nová ponuka</button>
      </div>
      <div className="stats">
        <div className="card stat"><strong>{quotes.filter((x) => x.status === 'odoslana').length}</strong><span>čaká na klienta</span></div>
        <div className="card stat"><strong>{money(sum(['prijata']))}</strong><span>prijaté</span></div>
        <div className="card stat"><strong>{money(sum(['odoslana']))}</strong><span>v hre</span></div>
      </div>
      <div className="chips">
        <button className={filter === 'all' ? 'chip on' : 'chip'} onClick={() => setFilter('all')}>Všetky</button>
        {STATUSES.map((s) => <button key={s.id} className={filter === s.id ? 'chip on' : 'chip'} onClick={() => setFilter(s.id)}>{s.label}</button>)}
      </div>
      {quotes.length > 4 && <label className="field"><input placeholder="Hľadať klienta, číslo, projekt…" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Hľadať" /></label>}
      <div className="card">
        {shown.length === 0 ? (
          <div className="empty">
            <p style={{ fontSize: 44 }}>🧾</p>
            <p>{quotes.length ? 'Nič tu nie je.' : 'Zatiaľ žiadna ponuka.'}</p>
            {!quotes.length && <button className="btn-secondary" onClick={onNew}>Vytvoriť prvú</button>}
          </div>
        ) : (
          <ul className="list">
            {shown.map((x) => (
              <li key={x.id}>
                <button className="list-item" onClick={() => onOpen(x.id)}>
                  <div className="list-main">
                    <strong>{x.client.company || x.client.name || 'Bez klienta'}</strong>
                    <small>{x.number} · {x.title || 'bez názvu'} · {fmtDate(x.issueDate)}</small>
                  </div>
                  <div className="list-side">
                    <strong>{money(totals(x, settings).total)}</strong>
                    <span className={`pill st-${x.status}`}>{STATUSES.find((s) => s.id === x.status)?.label}</span>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  )
}

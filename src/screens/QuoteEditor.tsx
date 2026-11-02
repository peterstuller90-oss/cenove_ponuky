import { useEffect, useRef, useState } from 'react'
import { AddServiceSheet } from '../components/AddServiceSheet'
import { NumInput, toast } from '../components/ui'
import { fmtNum, lineTotal, money, totals } from '../lib/calc'
import { STATUSES, UNITS, type Client, type Line, type PriceItem, type Quote, type Settings } from '../lib/types'

interface Props {
  quote: Quote
  settings: Settings
  prices: PriceItem[]
  clients: Client[]
  onSave: (q: Quote, rememberClient?: boolean) => Promise<void>
  onBack: () => void
  onPreview: () => void
  onDuplicate: () => void
  onDelete: () => void
  publicUrl: string
}

export function QuoteEditor({ quote, settings, prices, clients, onSave, onBack, onPreview, onDuplicate, onDelete, publicUrl }: Props) {
  const [q, setQ] = useState(quote)
  const [adding, setAdding] = useState(false)
  const [saved, setSaved] = useState(true)
  const [moreClient, setMoreClient] = useState(!!(quote.client.ico || quote.client.address))
  const first = useRef(true)

  // Autosave: shortly after the last change.
  useEffect(() => {
    if (first.current) { first.current = false; return }
    setSaved(false)
    const t = setTimeout(() => { onSave({ ...q, updatedAt: new Date().toISOString() }).then(() => setSaved(true)).catch((e) => toast('Neuložené: ' + e.message)) }, 700)
    return () => clearTimeout(t)
  }, [q, onSave])

  const set = (patch: Partial<Quote>) => setQ((x) => ({ ...x, ...patch }))
  const setClient = (patch: Partial<Quote['client']>) => setQ((x) => ({ ...x, client: { ...x.client, ...patch } }))
  const setLine = (id: string, patch: Partial<Line>) => setQ((x) => ({ ...x, lines: x.lines.map((l) => (l.id === id ? { ...l, ...patch } : l)) }))
  const move = (i: number, d: number) => setQ((x) => {
    const lines = [...x.lines]
    const j = i + d
    if (j < 0 || j >= lines.length) return x
    ;[lines[i], lines[j]] = [lines[j], lines[i]]
    return { ...x, lines }
  })
  const t = totals(q, settings)

  function pickClient(name: string) {
    const c = clients.find((c) => c.name === name || c.company === name)
    if (c) { const { id: _id, ...rest } = c; setClient(rest); if (c.ico || c.address) setMoreClient(true) } else setClient({ name })
  }

  async function share() {
    let next = q
    if (q.status === 'koncept') { next = { ...q, status: 'odoslana' }; setQ(next) }
    await onSave(next, true)
    if (navigator.share) {
      try { await navigator.share({ title: `Cenová ponuka ${q.number}`, text: `Cenová ponuka od ${settings.company.name}`, url: publicUrl }); return } catch { /* cancelled: fall back to copy */ }
    }
    try { await navigator.clipboard.writeText(publicUrl); toast('Odkaz pre klienta skopírovaný') } catch { prompt('Odkaz pre klienta:', publicUrl) }
  }

  return (
    <>
      <div className="topline no-print">
        <button className="back-btn" onClick={() => { onSave(q, true).catch(() => {}); onBack() }}>← Ponuky</button>
        <span className="muted" aria-live="polite">{saved ? 'Uložené ✓' : 'Ukladám…'}</span>
      </div>
      <div className="topline">
        <h1 className="page-title">{q.number}</h1>
        <label className="field" style={{ width: 170 }}>
          <select aria-label="Stav ponuky" value={q.status} onChange={(e) => set({ status: e.target.value as Quote['status'] })}>
            {STATUSES.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
          </select>
        </label>
      </div>
      {q.status === 'prijata' && q.acceptedName && <div className="banner">✓ Klient ({q.acceptedName}) ponuku prijal cez odkaz.</div>}

      <p className="section-title">Klient</p>
      <div className="card pad stack">
        <div className="grid2">
          <label className="field"><span>Meno</span><input list="clients" value={q.client.name} onChange={(e) => pickClient(e.target.value)} /></label>
          <label className="field"><span>Firma</span><input value={q.client.company} onChange={(e) => setClient({ company: e.target.value })} /></label>
          <label className="field"><span>E-mail</span><input type="email" value={q.client.email} onChange={(e) => setClient({ email: e.target.value })} /></label>
          <label className="field"><span>Telefón</span><input type="tel" value={q.client.phone} onChange={(e) => setClient({ phone: e.target.value })} /></label>
        </div>
        <datalist id="clients">{clients.map((c) => <option key={c.id} value={c.name}>{c.company}</option>)}</datalist>
        {moreClient ? (
          <div className="grid2">
            <label className="field" style={{ gridColumn: '1 / -1' }}><span>Adresa</span><input value={q.client.address} onChange={(e) => setClient({ address: e.target.value })} /></label>
            <label className="field"><span>IČO</span><input value={q.client.ico} onChange={(e) => setClient({ ico: e.target.value })} /></label>
            <label className="field"><span>DIČ</span><input value={q.client.dic} onChange={(e) => setClient({ dic: e.target.value })} /></label>
          </div>
        ) : <button className="link-btn" style={{ alignSelf: 'flex-start' }} onClick={() => setMoreClient(true)}>+ Adresa a IČO</button>}
      </div>

      <p className="section-title">Projekt</p>
      <div className="card pad stack">
        <label className="field"><span>Názov</span><input placeholder="napr. Mural na fasáde školy" value={q.title} onChange={(e) => set({ title: e.target.value })} /></label>
        <label className="field"><span>Úvodný text</span><textarea value={q.intro} onChange={(e) => set({ intro: e.target.value })} /></label>
      </div>

      <div className="topline"><p className="section-title">Položky</p></div>
      <div className="card">
        {q.lines.length === 0 && <div className="empty"><p className="muted">Pridaj prvú službu.</p></div>}
        {q.lines.map((l, i) => (
          <div key={l.id} className="line">
            <div className="line-head">
              <input aria-label="Názov položky" value={l.name} onChange={(e) => setLine(l.id, { name: e.target.value })} />
              <button className="icon-btn" onClick={() => move(i, -1)} disabled={i === 0} aria-label="Posunúť hore">↑</button>
              <button className="icon-btn danger" onClick={() => setQ((x) => ({ ...x, lines: x.lines.filter((y) => y.id !== l.id) }))} aria-label="Odstrániť položku">✕</button>
            </div>
            <input className="line-desc" aria-label="Popis položky" placeholder="Popis (nepovinný)" value={l.description} onChange={(e) => setLine(l.id, { description: e.target.value })} />
            <div className="line-nums">
              <label className="field"><span>Množstvo</span><NumInput value={l.qty} onChange={(n) => setLine(l.id, { qty: n })} /></label>
              <label className="field"><span>Jednotka</span>
                <select value={l.unit} onChange={(e) => setLine(l.id, { unit: e.target.value })}>
                  {[...new Set([...UNITS, l.unit])].map((u) => <option key={u}>{u}</option>)}
                </select>
              </label>
              <label className="field"><span>Cena / j. (€)</span><NumInput value={l.unitPrice} onChange={(n) => setLine(l.id, { unitPrice: n })} /></label>
              <label className="field"><span>Koeficient</span><NumInput value={l.coef} onChange={(n) => setLine(l.id, { coef: n || 1 })} /></label>
            </div>
            <div className="line-total">{l.coef !== 1 && <span className="muted">{l.coefLabel || `×${fmtNum(l.coef)}`} · </span>}{money(lineTotal(l))}</div>
          </div>
        ))}
        <div className="pad" style={{ borderTop: q.lines.length ? '1px solid var(--line)' : undefined }}>
          <button className="btn-secondary" style={{ width: '100%' }} onClick={() => setAdding(true)}>+ Pridať službu</button>
        </div>
      </div>

      <p className="section-title">Podmienky</p>
      <div className="card pad stack">
        <div className="grid2">
          <label className="field"><span>Vystavená</span><input type="date" value={q.issueDate} onChange={(e) => set({ issueDate: e.target.value })} /></label>
          <label className="field"><span>Platí do</span><input type="date" value={q.validUntil} onChange={(e) => set({ validUntil: e.target.value })} /></label>
          <label className="field"><span>Zľava (%)</span><NumInput value={q.discountPct} onChange={(n) => set({ discountPct: n })} /></label>
          <label className="field"><span>Záloha (%)</span><NumInput value={q.depositPct} onChange={(n) => set({ depositPct: n })} /></label>
        </div>
        <label className="field"><span>Poznámka pre klienta</span><textarea value={q.note} onChange={(e) => set({ note: e.target.value })} /></label>
        <table className="sum-table">
          <tbody>
            <tr><td>Medzisúčet</td><td>{money(t.subtotal)}</td></tr>
            {t.discount > 0 && <tr><td>Zľava</td><td>−{money(t.discount)}</td></tr>}
            {settings.vatPayer && <tr><td>DPH {fmtNum(settings.vatRate)} %</td><td>{money(t.vat)}</td></tr>}
            <tr className="grand"><td>Spolu</td><td>{money(t.total)}</td></tr>
            {q.depositPct > 0 && <tr><td className="muted">Záloha</td><td className="muted">{money(t.deposit)}</td></tr>}
          </tbody>
        </table>
      </div>

      <div className="stack no-print">
        <button className="btn-primary" onClick={() => onSave(q, true).then(onPreview)}>Náhľad a PDF</button>
        <button className="btn-secondary" onClick={share}>Poslať odkaz klientovi</button>
        <div className="row" style={{ justifyContent: 'center' }}>
          <button className="link-btn" onClick={onDuplicate}>Duplikovať</button>
          <button className="link-btn" style={{ color: 'var(--accent-dark)' }} onClick={() => { if (confirm(`Naozaj zmazať ponuku ${q.number}?`)) onDelete() }}>Zmazať</button>
        </div>
      </div>

      {adding && (
        <AddServiceSheet prices={prices} settings={settings} onClose={() => setAdding(false)}
          onAdd={(lines) => { setQ((x) => ({ ...x, lines: [...x.lines, ...lines] })); toast(lines.length > 1 ? `Pridaných ${lines.length} položiek` : 'Položka pridaná') }} />
      )}
    </>
  )
}

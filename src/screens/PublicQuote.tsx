import { useEffect, useState } from 'react'
import { QuoteDocument } from '../components/QuoteDocument'
import { store } from '../lib/store'
import type { PublicQuote as PQ } from '../lib/types'

/** What the client opens from the shared link: the quote, a PDF button and an accept button. */
export function PublicQuote({ token }: { token: string }) {
  const [data, setData] = useState<PQ | null | undefined>(undefined)
  const [name, setName] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const load = () => store.getPublic(token).then(setData).catch(() => setData(null))
  useEffect(() => { load() }, [token]) // eslint-disable-line react-hooks/exhaustive-deps

  if (data === undefined) return <main className="center-screen"><div className="spinner" /></main>
  if (data === null) return (
    <main className="center-screen"><div className="card login-card"><h2>Ponuka sa nenašla</h2><p className="muted">Odkaz je neplatný alebo ponuku medzitým stiahli.</p></div></main>
  )
  const { quote, settings } = data
  const expired = quote.validUntil < new Date().toISOString().slice(0, 10)
  async function accept() {
    if (!name.trim()) { setError('Napíš prosím svoje meno.'); return }
    setBusy(true); setError('')
    try { await store.accept(token, name.trim()); await load() } catch { setError('Nepodarilo sa to. Skús to znova alebo nám napíš.') }
    setBusy(false)
  }
  return (
    <main className="public-page">
      <div className="doc-wrap"><QuoteDocument quote={quote} settings={settings} /></div>
      <div className="row no-print" style={{ justifyContent: 'center' }}>
        <button className="btn-secondary" onClick={() => window.print()}>Stiahnuť PDF</button>
      </div>
      {quote.status === 'odoslana' && !expired && (
        <div className="card accept-card no-print">
          <h2 style={{ fontSize: 26, textTransform: 'uppercase' }}>Súhlasíte s ponukou?</h2>
          <p className="muted">Potvrdením nám dáte vedieť, že chcete začať. Ozveme sa s ďalším postupom a zálohovou faktúrou.</p>
          <label className="field"><span>Vaše meno</span><input value={name} onChange={(e) => setName(e.target.value)} /></label>
          <p className="error" aria-live="polite">{error}</p>
          <button className="btn-primary" disabled={busy} onClick={accept}>{busy ? 'Posielam…' : 'Prijať ponuku'}</button>
        </div>
      )}
      {quote.status === 'odoslana' && expired && <div className="banner no-print">Platnosť ponuky vypršala. Napíšte nám a radi ju obnovíme.</div>}
      {quote.status === 'prijata' && <div className="banner no-print" style={{ background: 'var(--mint)' }}>Ďakujeme! Ponuka je prijatá, čoskoro sa ozveme.</div>}
    </main>
  )
}

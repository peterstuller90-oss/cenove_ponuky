import { useCallback, useEffect, useRef, useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import { QuoteDocument } from './components/QuoteDocument'
import { Icon, Logo, Toast, toast } from './components/ui'
import { addDays, nextNumber, today, token, uid } from './lib/calc'
import { store, supabase, type Data } from './lib/store'
import type { Quote } from './lib/types'
import { Login } from './screens/Login'
import { PriceList } from './screens/PriceList'
import { PublicQuote } from './screens/PublicQuote'
import { QuoteEditor } from './screens/QuoteEditor'
import { QuoteList } from './screens/QuoteList'
import { SettingsScreen } from './screens/SettingsScreen'

const publicToken = new URLSearchParams(location.search).get('p')
export const publicUrl = (t: string) => `${location.origin}${import.meta.env.BASE_URL}?p=${encodeURIComponent(t)}`

function useHash() {
  const [hash, setHash] = useState(location.hash.slice(1) || '/')
  useEffect(() => {
    const on = () => { setHash(location.hash.slice(1) || '/'); window.scrollTo(0, 0) }
    window.addEventListener('hashchange', on)
    return () => window.removeEventListener('hashchange', on)
  }, [])
  return hash
}
const go = (path: string) => { location.hash = path }

export default function App() {
  if (publicToken) return <PublicQuote token={publicToken} />
  return <Admin />
}

function Admin() {
  const [session, setSession] = useState<Session | null | undefined>(supabase ? undefined : null)
  const [allowed, setAllowed] = useState<boolean | undefined>(supabase ? undefined : true)

  useEffect(() => {
    if (!supabase) return
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data } = supabase.auth.onAuthStateChange((_e, s) => setSession(s))
    return () => data.subscription.unsubscribe()
  }, [])
  useEffect(() => {
    if (!supabase) return
    if (!session) { setAllowed(undefined); return }
    supabase.rpc('is_quote_admin').then(({ data }) => setAllowed(data === true))
  }, [session])

  if (supabase && session === undefined) return <main className="center-screen"><div className="spinner" /></main>
  if (supabase && !session) return <Login supabase={supabase} />
  if (supabase && allowed === undefined) return <main className="center-screen"><div className="spinner" /></main>
  if (supabase && !allowed) return <Login supabase={supabase} notAllowed={session?.user.email} />
  return <Workspace />
}

function Workspace() {
  const [data, setData] = useState<Data | null>(null)
  const [error, setError] = useState('')
  const hash = useHash()
  const latest = useRef(data)
  useEffect(() => { latest.current = data }, [data])
  const reload = useCallback(() => store.loadAll().then(setData).catch((e) => setError(e.message)), [])
  useEffect(() => { reload() }, [reload])

  const saveQuote = useCallback(async (q: Quote, rememberClient = false) => {
    setData((d) => d && { ...d, quotes: d.quotes.some((x) => x.id === q.id) ? d.quotes.map((x) => (x.id === q.id ? q : x)) : [q, ...d.quotes] })
    const d = latest.current
    if (!d) return
    await store.saveQuote(q, d.settings)
    // Remember the client for next time (not on every keystroke, only when leaving or sending).
    if (rememberClient && (q.client.name || q.client.company)) {
      const known = d.clients.find((c) => (c.name && c.name === q.client.name) || (c.company && c.company === q.client.company && !c.name))
      const client = { ...q.client, id: known?.id ?? uid() }
      if (!known || (['company', 'ico', 'dic', 'address', 'email', 'phone'] as const).some((k) => known[k] !== client[k])) {
        await store.saveClient(client)
        setData((x) => x && { ...x, clients: known ? x.clients.map((c) => (c.id === known.id ? client : c)) : [...x.clients, client] })
      }
    }
  }, [])

  if (error) return <main className="center-screen"><div className="card login-card"><h2>Chyba</h2><p className="error">{error}</p><button className="btn-primary" onClick={() => { setError(''); reload() }}>Skúsiť znova</button></div></main>
  if (!data) return <main className="center-screen"><div className="spinner" /></main>

  function newQuote(from?: Quote) {
    const s = data!.settings
    const now = new Date().toISOString()
    const q: Quote = {
      id: uid(),
      number: nextNumber(data!.quotes.map((x) => x.number), s.numberPrefix),
      status: 'koncept',
      publicToken: token(),
      client: from?.client ?? { name: '', company: '', ico: '', dic: '', address: '', email: '', phone: '' },
      title: from ? `${from.title} (kópia)` : '',
      intro: from?.intro ?? s.intro,
      issueDate: today(),
      validUntil: addDays(today(), s.validityDays),
      lines: from ? from.lines.map((l) => ({ ...l, id: uid() })) : [],
      discountPct: from?.discountPct ?? 0,
      depositPct: from?.depositPct ?? s.depositPct,
      note: from?.note ?? '',
      acceptedAt: null, acceptedName: '',
      createdAt: now, updatedAt: now,
    }
    saveQuote(q).catch((e) => toast('Neuložené: ' + e.message))
    go(`/ponuka/${q.id}`)
  }

  const [, route, id, sub] = hash.split('/')
  const quote = route === 'ponuka' ? data.quotes.find((q) => q.id === id) : undefined
  const tab = route === 'cennik' ? 'cennik' : route === 'nastavenia' ? 'nastavenia' : 'ponuky'

  let screen
  if (quote && sub === 'nahlad') {
    screen = (
      <>
        <div className="topline no-print">
          <button className="back-btn" onClick={() => go(`/ponuka/${quote.id}`)}>← Upraviť</button>
          <button className="btn-primary btn-sm" onClick={() => window.print()}>Uložiť PDF / tlačiť</button>
        </div>
        <div className="doc-wrap"><QuoteDocument quote={quote} settings={data.settings} /></div>
      </>
    )
  } else if (quote) {
    screen = (
      <QuoteEditor key={quote.id} quote={quote} settings={data.settings} prices={data.prices} clients={data.clients}
        publicUrl={publicUrl(quote.publicToken)} onSave={saveQuote} onBack={() => go('/')} onPreview={() => go(`/ponuka/${quote.id}/nahlad`)}
        onDuplicate={() => newQuote(quote)}
        onDelete={async () => { await store.deleteQuote(quote.id); setData({ ...data, quotes: data.quotes.filter((q) => q.id !== quote.id) }); go('/') }} />
    )
  } else if (tab === 'cennik') {
    screen = (
      <PriceList prices={data.prices}
        onSave={async (p) => { setData((d) => d && { ...d, prices: d.prices.some((x) => x.id === p.id) ? d.prices.map((x) => (x.id === p.id ? p : x)) : [...d.prices, p] }); await store.savePrice(p) }}
        onDelete={async (pid) => { setData((d) => d && { ...d, prices: d.prices.filter((x) => x.id !== pid) }); await store.deletePrice(pid) }} />
    )
  } else if (tab === 'nastavenia') {
    screen = <SettingsScreen settings={data.settings} demo={store.mode === 'demo'}
      onSave={async (s) => { await store.saveSettings(s); setData({ ...data, settings: s }) }}
      onLogout={supabase ? () => supabase!.auth.signOut() : undefined} />
  } else {
    screen = <QuoteList quotes={data.quotes} settings={data.settings} onOpen={(qid) => go(`/ponuka/${qid}`)} onNew={() => newQuote()} />
  }

  return (
    <div className="app">
      <main className="content">
        {route !== 'ponuka' && <div className="no-print top-logo" style={{ marginBottom: -4 }}><Logo width={160} /></div>}
        {store.mode === 'demo' && route !== 'ponuka' && tab !== 'nastavenia' && <div className="banner no-print">Demo režim: dáta sa ukladajú iba v tomto prehliadači.</div>}
        {screen}
      </main>
      <nav className="tabbar no-print">
        <div className="brand-mini"><img src={`${import.meta.env.BASE_URL}logo.png`} alt="Štullers" /></div>
        <a href="#/" className={tab === 'ponuky' ? 'tab active' : 'tab'}><Icon name="quotes" /><span>Ponuky</span></a>
        <a href="#/cennik" className={tab === 'cennik' ? 'tab active' : 'tab'}><Icon name="prices" /><span>Cenník</span></a>
        <a href="#/nastavenia" className={tab === 'nastavenia' ? 'tab active' : 'tab'}><Icon name="settings" /><span>Nastavenia</span></a>
      </nav>
      <Toast />
    </div>
  )
}

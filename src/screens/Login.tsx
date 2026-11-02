import { useState } from 'react'
import type { SupabaseClient } from '@supabase/supabase-js'
import { Logo } from '../components/ui'

export function Login({ supabase, notAllowed }: { supabase: SupabaseClient; notAllowed?: string }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true); setError('')
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password })
    setBusy(false)
    if (error) setError(error.status === 429 ? 'Veľa pokusov. Skús to o chvíľu.' : 'Nesprávny e-mail alebo heslo.')
  }
  return (
    <main className="center-screen">
      <form className="card login-card" onSubmit={submit}>
        <Logo />
        {notAllowed && <p className="error">Účet {notAllowed} nemá prístup k ponukám.</p>}
        <label className="field"><span>E-mail</span><input type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} required /></label>
        <label className="field"><span>Heslo</span><input type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} required /></label>
        <p className="error" aria-live="polite">{error}</p>
        <button className="btn-primary" disabled={busy}>{busy ? 'Prihlasujem…' : 'Prihlásiť'}</button>
        {notAllowed && <button type="button" className="link-btn" onClick={() => supabase.auth.signOut()}>Iný účet</button>}
      </form>
    </main>
  )
}

import { useState } from 'react'
import { NumInput, toast } from '../components/ui'
import type { Company, Settings } from '../lib/types'

export function SettingsScreen({ settings, onSave, demo, onLogout }: { settings: Settings; onSave: (s: Settings) => Promise<void>; demo: boolean; onLogout?: () => void }) {
  const [s, setS] = useState(settings)
  const set = (patch: Partial<Settings>) => setS((x) => ({ ...x, ...patch }))
  const co = (k: keyof Company, label: string, wide = false) => (
    <label className="field" style={wide ? { gridColumn: '1 / -1' } : undefined}><span>{label}</span>
      <input value={s.company[k]} onChange={(e) => setS((x) => ({ ...x, company: { ...x.company, [k]: e.target.value } }))} />
    </label>
  )
  const save = () => onSave(s).then(() => toast('Nastavenia uložené')).catch((e) => toast('Neuložené: ' + e.message))
  return (
    <>
      <h1 className="page-title">Nastavenia</h1>
      {demo && <div className="banner">Demo režim: dáta sú uložené len v tomto prehliadači. Po pripojení Supabase budú v cloude a uvidíte ich obaja.</div>}

      <p className="section-title">Vaše údaje na ponuke</p>
      <div className="card pad grid2">
        {co('name', 'Názov')}{co('person', 'Kontaktná osoba')}
        {co('address', 'Adresa', true)}
        {co('ico', 'IČO')}{co('dic', 'DIČ')}
        {co('icdph', 'IČ DPH')}{co('iban', 'IBAN')}
        {co('email', 'E-mail')}{co('phone', 'Telefón')}
        {co('web', 'Web / Instagram', true)}
      </div>

      <p className="section-title">Ceny a čísla</p>
      <div className="card pad stack">
        <label className="check"><input type="checkbox" checked={s.vatPayer} onChange={(e) => set({ vatPayer: e.target.checked })} />Sme platcami DPH</label>
        <div className="grid2">
          {s.vatPayer && <label className="field"><span>Sadzba DPH (%)</span><NumInput value={s.vatRate} onChange={(n) => set({ vatRate: n })} /></label>}
          <label className="field"><span>Platnosť ponuky (dni)</span><NumInput value={s.validityDays} onChange={(n) => set({ validityDays: n })} /></label>
          <label className="field"><span>Predvolená záloha (%)</span><NumInput value={s.depositPct} onChange={(n) => set({ depositPct: n })} /></label>
          <label className="field"><span>Predpona čísla</span><input value={s.numberPrefix} onChange={(e) => set({ numberPrefix: e.target.value })} /></label>
        </div>
      </div>

      <p className="section-title">Zložitosť murálu</p>
      <div className="card pad stack">
        {s.complexity.map((c, i) => (
          <div key={i} className="row" style={{ flexWrap: 'nowrap' }}>
            <label className="field grow"><span>Stupeň</span><input value={c.label} onChange={(e) => set({ complexity: s.complexity.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)) })} /></label>
            <label className="field" style={{ width: 110 }}><span>Násobok</span><NumInput value={c.coef} onChange={(n) => set({ complexity: s.complexity.map((x, j) => (j === i ? { ...x, coef: n } : x)) })} /></label>
            <button className="icon-btn danger" style={{ alignSelf: 'flex-end', marginBottom: 4 }} aria-label="Odstrániť stupeň" onClick={() => set({ complexity: s.complexity.filter((_, j) => j !== i) })}>✕</button>
          </div>
        ))}
        <button className="link-btn" style={{ alignSelf: 'flex-start' }} onClick={() => set({ complexity: [...s.complexity, { label: 'Nový', coef: 1 }] })}>+ Pridať stupeň</button>
      </div>

      <p className="section-title">Texty</p>
      <div className="card pad stack">
        <label className="field"><span>Predvolený úvod ponuky</span><textarea value={s.intro} onChange={(e) => set({ intro: e.target.value })} /></label>
        <label className="field"><span>Podmienky (na konci každej ponuky)</span><textarea rows={5} value={s.terms} onChange={(e) => set({ terms: e.target.value })} /></label>
      </div>

      <button className="btn-primary" onClick={save}>Uložiť nastavenia</button>
      {onLogout && <button className="link-btn" onClick={onLogout}>Odhlásiť sa</button>}
    </>
  )
}

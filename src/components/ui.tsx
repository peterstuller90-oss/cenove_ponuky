import { useEffect, useState, type ReactNode } from 'react'

export function Logo({ width = 200, label = 'Ponuky' }: { width?: number; label?: string }) {
  return (
    <div className="brand-logo">
      <img src={`${import.meta.env.BASE_URL}logo.png`} alt="Štullers" width={width} />
      {label && <span>{label}</span>}
    </div>
  )
}

export function Sheet({ onClose, title, children }: { onClose: () => void; title: string; children: ReactNode }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])
  return (
    <div className="sheet-backdrop" onClick={onClose}>
      <div className="sheet card" role="dialog" aria-label={title} onClick={(e) => e.stopPropagation()}>
        <div className="sheet-head">
          <h3>{title}</h3>
          <button className="icon-btn" onClick={onClose} aria-label="Zavrieť">✕</button>
        </div>
        {children}
      </div>
    </div>
  )
}

let showToast: (msg: string) => void = () => {}
export const toast = (msg: string) => showToast(msg)

export function Toast() {
  const [msg, setMsg] = useState('')
  useEffect(() => {
    let t: ReturnType<typeof setTimeout>
    showToast = (m) => { setMsg(m); clearTimeout(t); t = setTimeout(() => setMsg(''), 2600) }
    return () => clearTimeout(t)
  }, [])
  return msg ? <div id="toast" role="status">{msg}</div> : null
}

/** Number input that lets you type freely ("1," / empty) and reports a number. */
export function NumInput({ value, onChange, step = 'any', min, ...rest }: {
  value: number; onChange: (n: number) => void; step?: string; min?: number
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'>) {
  const [text, setText] = useState(String(value))
  useEffect(() => {
    setText((t) => (parseFloat(t.replace(',', '.')) === value ? t : String(value)))
  }, [value])
  return (
    <input
      {...rest}
      inputMode="decimal"
      value={text}
      min={min}
      step={step}
      onChange={(e) => {
        setText(e.target.value)
        const n = parseFloat(e.target.value.replace(',', '.'))
        onChange(Number.isFinite(n) ? n : 0)
      }}
    />
  )
}

type IconName = 'quotes' | 'prices' | 'settings' | 'plus'
const PATHS: Record<IconName, string> = {
  quotes: 'M7 3h7l5 5v13H7zM14 3v5h5M10 13h6M10 17h6',
  prices: 'M3 12l9-9h7v7l-9 9zM15.5 8.5h.01',
  settings: 'M12 15a3 3 0 100-6 3 3 0 000 6zM19 12l2-1-1-3-2 .2-1.3-1.3.2-2-3-1-1 2h-2l-1-2-3 1 .2 2L6.8 7.2l-2-.2-1 3 2 1v2l-2 1 1 3 2-.2 1.3 1.3-.2 2 3 1 1-2h2l1 2 3-1-.2-2 1.3-1.3 2 .2 1-3-2-1z',
  plus: 'M12 5v14M5 12h14',
}
export function Icon({ name }: { name: IconName }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={PATHS[name]} />
    </svg>
  )
}

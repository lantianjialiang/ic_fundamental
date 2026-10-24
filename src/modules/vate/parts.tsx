import type { ReactNode } from 'react'
import { useLocale } from '../../i18n/LocaleContext'
import { loc, type LText } from '../../i18n/locale'

export type Note = { kicker: LText | string; title: LText | string; text: LText | string }

export type Tone = 'pass' | 'fail' | 'warn' | 'muted'

const GLYPH: Record<Tone, string> = { pass: '✓', fail: '✗', warn: '⚠', muted: '■' }

/** 判定徽章：颜色之外一定带符号和文字，照顾色盲 */
export function Badge({ tone, label }: { tone: Tone; label: LText }) {
  const { t } = useLocale()
  return (
    <span className={`vbadge vbadge--${tone}`}>
      <span aria-hidden="true">{GLYPH[tone]}</span> {t(label)}
    </span>
  )
}

export function Field({ label, hint, value, children }: { label: LText; hint?: LText; value?: string; children: ReactNode }) {
  const { t } = useLocale()
  return (
    <div className="vfield">
      <div className="vfield__head">
        <span>{t(label)}</span>
        {value !== undefined ? <b>{value}</b> : null}
      </div>
      {children}
      {hint ? <p className="vfield__hint">{t(hint)}</p> : null}
    </div>
  )
}

export function Slider({
  label,
  value,
  min,
  max,
  step,
  onChange,
}: {
  label: string
  value: number
  min: number
  max: number
  step: number
  onChange: (v: number) => void
}) {
  return (
    <input
      type="range"
      className="vslider"
      aria-label={label}
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
    />
  )
}

export function Pane({ title, children, className = '' }: { title: LText; children: ReactNode; className?: string }) {
  const { t } = useLocale()
  return (
    <section className={`vpane ${className}`}>
      <h3 className="vpane__title">{t(title)}</h3>
      {children}
    </section>
  )
}

export const STATUS_LABEL = {
  pass: loc('PASS', 'PASS'),
  fail: loc('FAIL', 'FAIL'),
  invalid: loc('无效', 'INVALID'),
  abort: loc('中止', 'ABORTED'),
}

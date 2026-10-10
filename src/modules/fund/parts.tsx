import type { ReactNode } from 'react'
import { useLocale } from '../../i18n/LocaleContext'
import { type LText } from '../../i18n/locale'

export type Text = LText | string

/** 右侧说明栏的一条内容 */
export type Note = { kicker: Text; title: Text; text: Text }

export type Card = { id: string; title: Text; sub?: Text; text: Text; explain?: Text[] }

export function Cards<T extends Card>({
  items,
  activeId,
  onPick,
  cols = 3,
}: {
  items: T[]
  activeId?: string
  onPick: (item: T) => void
  cols?: 2 | 3 | 4
}) {
  const { t } = useLocale()
  return (
    <div className={`pick pick--${cols}`}>
      {items.map((item) => (
        <button
          key={item.id}
          type="button"
          className={`pick__card${activeId === item.id ? ' is-active' : ''}`}
          onClick={() => onPick(item)}
        >
          {t(item.title)}
          {item.sub ? <span>{t(item.sub)}</span> : null}
        </button>
      ))}
    </div>
  )
}

export function Explain({ paras }: { paras?: Text[] }) {
  const { t } = useLocale()
  if (!paras || paras.length === 0) return null
  return (
    <div className="term-explain">
      {paras.map((para, index) => (
        <p key={index}>{t(para)}</p>
      ))}
    </div>
  )
}

export function Seg<T extends string>({
  options,
  value,
  onChange,
}: {
  options: Array<{ id: T; label: Text }>
  value: T
  onChange: (id: T) => void
}) {
  const { t } = useLocale()
  return (
    <div className="seg" role="group">
      {options.map((option) => (
        <button
          key={option.id}
          type="button"
          className={value === option.id ? 'is-active' : ''}
          onClick={() => onChange(option.id)}
        >
          {t(option.label)}
        </button>
      ))}
    </div>
  )
}

export type ReadoutItem = { label: Text; value: string; state?: 'pass' | 'fail' }

export function Readout({ items }: { items: ReadoutItem[] }) {
  const { t } = useLocale()
  return (
    <div className="readout">
      {items.map((item, index) => (
        <div
          key={index}
          className={`readout__item${item.state ? ` is-${item.state}` : ''}`}
        >
          <b>{t(item.label)}</b>
          <span>{item.value}</span>
        </div>
      ))}
    </div>
  )
}

export function Steps({ items }: { items: Text[] }) {
  const { t } = useLocale()
  return (
    <ol className="flow-steps">
      {items.map((item, index) => (
        <li key={index}>{t(item)}</li>
      ))}
    </ol>
  )
}

export function Callout({
  tone,
  children,
}: {
  tone?: 'warn' | 'bad' | 'ok'
  children: ReactNode
}) {
  return <div className={`callout${tone ? ` callout--${tone}` : ''}`}>{children}</div>
}

export function Knob({
  label,
  value,
  unit,
  min,
  max,
  step,
  onChange,
}: {
  label: Text
  value: number
  unit: string
  min: number
  max: number
  step: number
  onChange: (value: number) => void
}) {
  const { t } = useLocale()
  return (
    <label>
      <span>
        {t(label)} <b>{`${value} ${unit}`}</b>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
      />
    </label>
  )
}

/** 电阻按量级显示 */
export function fmtOhm(ohm: number) {
  if (!Number.isFinite(ohm)) return '∞'
  if (ohm >= 1e6) return `${(ohm / 1e6).toFixed(3)} MΩ`
  if (ohm >= 1e3) return `${(ohm / 1e3).toFixed(1)} kΩ`
  return `${ohm.toFixed(1)} Ω`
}

export function fmtV(volt: number) {
  return `${volt >= 0 ? '+' : ''}${volt.toFixed(2)} V`
}

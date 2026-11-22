import { type ReactNode } from 'react'
import { useLocale } from '../../i18n/LocaleContext'
import { loc, type LText } from '../../i18n/locale'
import './flowVisuals.css'

export function Formula({ rule, value, note, children }: {
  rule: string; value: string; note: LText; children?: ReactNode
}) {
  const { t } = useLocale()
  return (
    <figure className="flow-visual flow-formula">
      <div><b>{rule}</b><strong>{value}</strong></div>
      {children}
      <figcaption>{t(note)}</figcaption>
    </figure>
  )
}

export function ScaleBars({ items, max }: { items: readonly { title: LText; value: number; display?: string }[]; max: number }) {
  const { t } = useLocale()
  return (
    <div className="flow-bars">
      {items.map((item) => (
        <div key={item.title.zh}>
          <span>{t(item.title)}</span><b>{item.display ?? item.value.toFixed(2)}</b>
          <i aria-hidden="true"><i style={{ width: `${Math.max(0, Math.min(1, item.value / max)) * 100}%` }} /></i>
        </div>
      ))}
    </div>
  )
}

export function Diagram({ title, caption, children }: { title: LText; caption: LText; children: ReactNode }) {
  const { t } = useLocale()
  return <figure className="flow-visual"><h4>{t(title)}</h4>{children}<figcaption>{t(caption)}</figcaption></figure>
}

export function DiagramChoices<T extends string>({ label, items, value, onPick }: {
  label: LText; items: readonly { id: T; title: LText }[]; value: T; onPick: (id: T) => void
}) {
  const { t } = useLocale()
  return (
    <div className="flow-choices" role="group" aria-label={t(label)}>
      {items.map(({ id, title }) => (
        <button type="button" key={id} aria-pressed={id === value} onClick={() => onPick(id)}>{t(title)}</button>
      ))}
    </div>
  )
}

export function DiagramLegend({ items }: { items: readonly (readonly [string, LText])[] }) {
  const { t } = useLocale()
  return <ul className="flow-legend">{items.map(([tone, label]) => <li key={tone}><i className={`flow-tone-${tone}`} />{t(label)}</li>)}</ul>
}

export function StagePlayer({ count, step, onStep }: { count: number; step: number; onStep: (i: number) => void }) {
  const { t } = useLocale()
  return (
    <div className="flow-stepper">
      <button type="button" disabled={step === 0} onClick={() => onStep(step - 1)}>{t(loc('上一步', 'Previous step'))}</button>
      <span>{step + 1} / {count}</span>
      <button type="button" disabled={step === count - 1} onClick={() => onStep(step + 1)}>{t(loc('下一步', 'Next step'))}</button>
    </div>
  )
}

export function YieldStages({ stages }: { stages: readonly { title: LText; rate: number }[] }) {
  let remaining = 1
  return <ScaleBars max={1} items={stages.map(({ title, rate }) => {
    remaining *= rate
    return { title, value: remaining, display: `${(remaining * 100).toFixed(2)}%` }
  })} />
}

import { useLocale } from '../../i18n/LocaleContext'
import { type LText } from '../../i18n/locale'

export function YieldBars({ items }: { items: Array<{ title: LText; value: number; color?: string }> }) {
  const { t } = useLocale()
  return (
    <div className="mfg-bars">
      {items.map((item) => (
        <div className="mfg-bar" key={item.title.en}>
          <span>{t(item.title)}</span>
          <i style={{ width: `${Math.max(4, Math.min(100, item.value * 100))}%`, background: item.color }} />
          <b>{(item.value * 100).toFixed(1)}%</b>
        </div>
      ))}
    </div>
  )
}

export function PackageCut({
  parts,
  activeId,
  onPick,
}: {
  parts: Array<{ id: string; title: LText; y: number; h: number; color: string }>
  activeId: string
  onPick: (id: string) => void
}) {
  const { t } = useLocale()
  const active = parts.find((p) => p.id === activeId) ?? parts[0]
  return (
    <figure className="mfg-stack">
      <svg className="mfg-svg" viewBox="0 0 360 220" role="img" aria-label={t(active.title)}>
        <rect x="8" y="8" width="344" height="204" rx="8" fill="#102028" />
        {parts.map((part) => {
          const on = part.id === activeId
          return (
            <g
              key={part.id}
              className={`mfg-node${on ? ' is-on' : ''}`}
              tabIndex={0}
              role="button"
              onClick={() => onPick(part.id)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') onPick(part.id)
              }}
            >
              <rect x="40" y={part.y} width="280" height={part.h} rx="3" fill={part.color} stroke={on ? '#f4d27a' : '#2a3a44'} strokeWidth={on ? 2 : 1} />
              <text x="180" y={part.y + part.h / 2 + 4} textAnchor="middle" fill="#102028" fontSize="11">
                {t(part.title)}
              </text>
            </g>
          )
        })}
      </svg>
      <figcaption className="mfg-summary">{t(active.title)}</figcaption>
    </figure>
  )
}

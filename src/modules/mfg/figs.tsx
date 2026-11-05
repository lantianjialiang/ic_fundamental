import { useLocale } from '../../i18n/LocaleContext'
import { loc, type LText } from '../../i18n/locale'

function txt(t: (item: LText) => string, item: LText) {
  return t(item)
}

export function WaferDisk({
  dies,
  good,
  label,
}: {
  dies: number
  good: number
  label: LText
}) {
  const { t } = useLocale()
  const cols = Math.max(8, Math.round(Math.sqrt(Math.max(dies, 1))))
  const cells = Array.from({ length: Math.min(dies, cols * cols) }, (_, i) => i)
  return (
    <figure className="mfg-map">
      <svg className="mfg-svg" viewBox="0 0 220 220" role="img" aria-label={txt(t, label)}>
        <circle cx="110" cy="110" r="100" fill="#1b3a4a" stroke="#7eb8c9" strokeWidth="3" />
        {cells.map((i) => {
          const r = Math.floor(i / cols)
          const c = i % cols
          const x = 22 + c * (176 / cols)
          const y = 22 + r * (176 / cols)
          const s = 176 / cols - 1.2
          const cx = x + s / 2
          const cy = y + s / 2
          const inCircle = (cx - 110) ** 2 + (cy - 110) ** 2 < 88 ** 2
          if (!inCircle) return null
          return <rect key={i} x={x} y={y} width={s} height={s} rx="1" fill={i < good ? '#3d9b6e' : '#c45c4a'} />
        })}
      </svg>
      <figcaption className="mfg-summary">{t(label)}</figcaption>
    </figure>
  )
}

export function LayerBars({
  layers,
  activeId,
  onPick,
}: {
  layers: Array<{ id: string; title: LText; color: string; h?: number }>
  activeId: string
  onPick: (id: string) => void
}) {
  const { t } = useLocale()
  return (
    <figure className="mfg-stack">
      <svg className="mfg-svg" viewBox={`0 0 320 ${layers.length * 28 + 16}`} role="img">
        {layers.map((layer, index) => {
          const y = 8 + index * 28
          const on = layer.id === activeId
          return (
            <g
              key={layer.id}
              className={`mfg-node${on ? ' is-on' : ''}`}
              tabIndex={0}
              role="button"
              onClick={() => onPick(layer.id)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') onPick(layer.id)
              }}
            >
              <rect x="8" y={y} width="304" height={layer.h ?? 24} rx="4" fill={layer.color} stroke={on ? '#f4d27a' : '#2a3a44'} strokeWidth={on ? 2 : 1} />
              <text x="160" y={y + 16} textAnchor="middle" fill="#102028" fontSize="12">
                {t(layer.title)}
              </text>
            </g>
          )
        })}
      </svg>
    </figure>
  )
}

export function ControlPlot({
  points,
  mean,
  lcl,
  ucl,
}: {
  points: number[]
  mean: number
  lcl: number
  ucl: number
}) {
  const { t } = useLocale()
  const w = 320
  const h = 140
  const min = Math.min(lcl, ...points) - 0.02
  const max = Math.max(ucl, ...points) + 0.02
  const yOf = (v: number) => h - 16 - ((v - min) / (max - min)) * (h - 28)
  const xOf = (i: number) => 16 + (i * (w - 32)) / Math.max(1, points.length - 1)
  const path = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${xOf(i)},${yOf(p)}`).join(' ')
  return (
    <figure className="mfg-chart">
      <svg className="mfg-svg" viewBox={`0 0 ${w} ${h}`} role="img" aria-label={t(loc('控制图', 'Control chart'))}>
        <line x1="8" y1={yOf(ucl)} x2={w - 8} y2={yOf(ucl)} stroke="#c45c4a" strokeDasharray="4 3" />
        <line x1="8" y1={yOf(lcl)} x2={w - 8} y2={yOf(lcl)} stroke="#c45c4a" strokeDasharray="4 3" />
        <line x1="8" y1={yOf(mean)} x2={w - 8} y2={yOf(mean)} stroke="#7eb8c9" />
        <path d={path} fill="none" stroke="#f4d27a" strokeWidth="2" />
        {points.map((p, i) => (
          <circle key={i} cx={xOf(i)} cy={yOf(p)} r="3" fill={p > ucl || p < lcl ? '#c45c4a' : '#f4d27a'} />
        ))}
      </svg>
      <figcaption className="mfg-summary">
        {t(loc(`μ=${mean.toFixed(3)}，UCL=${ucl.toFixed(3)}，LCL=${lcl.toFixed(3)}`, `μ=${mean.toFixed(3)}, UCL=${ucl.toFixed(3)}, LCL=${lcl.toFixed(3)}`))}
      </figcaption>
    </figure>
  )
}

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

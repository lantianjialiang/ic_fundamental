import { useLocale } from '../../i18n/LocaleContext'
import { loc } from '../../i18n/locale'
import { Hit } from '../prep/common'
import { S } from './data/pcbMaterial'
import { METRICS, SPECIALS, barFrac, metricOf, type MetricId, type SpecialId } from './data/pcbMaterialSpecial'

const L = {
  log: loc('对数刻度', 'Log scale'),
  lin: loc('线性刻度', 'Linear scale'),
}

const ROW = 40
const BAR_X = 240
const BAR_W = 380

export function BarsFig({ metric, active, onPick }: { metric: MetricId; active: SpecialId; onPick: (id: SpecialId) => void }) {
  const { t } = useLocale()
  const spec = METRICS.find((m) => m.id === metric) ?? METRICS[0]
  const height = 40 + SPECIALS.length * ROW
  return (
    <figure className="term-fig">
      <svg viewBox={`0 0 760 ${height}`} className="term-fig__svg" role="group" aria-label={t(S.specialCap)}>
        <rect width="760" height={height} rx="10" fill="var(--well)" />
        <text x="20" y="24" fill="var(--text)" fontSize="12" fontWeight="700">
          {t(spec.label)}
        </text>
        <text x="740" y="24" textAnchor="end" fill="var(--muted)" fontSize="11">
          {t(spec.scale === 'log' ? L.log : L.lin)}
        </text>
        {SPECIALS.map((m, i) => {
          const y = 40 + i * ROW
          const v = metricOf(m, metric)
          const w = Math.max(6, barFrac(metric, v) * BAR_W)
          const on = active === m.id
          return (
            <Hit key={m.id} label={t(m.name)} active={on} onPick={() => onPick(m.id)}>
              <rect x="12" y={y} width="736" height={ROW - 6} rx="6" fill={on ? 'var(--gold-bg)' : 'transparent'} stroke={on ? 'var(--gold)' : 'var(--line)'} strokeWidth={on ? 2 : 1} />
              <text x="24" y={y + 22} fill={on ? 'var(--text)' : 'var(--text-2)'} fontSize="12" fontWeight={on ? 700 : 400}>
                {t(m.short)}
              </text>
              <rect x={BAR_X} y={y + 8} width={w} height="18" rx="3" fill={on ? '#e29a5a' : '#6f8aa5'} />
              <text x={BAR_X + w + 8} y={y + 22} fill="var(--text)" fontSize="11">
                {`${v}${spec.unit}`}
              </text>
            </Hit>
          )
        })}
      </svg>
      <figcaption>{t(S.specialCap)}</figcaption>
    </figure>
  )
}

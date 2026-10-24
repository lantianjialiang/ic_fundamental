import { useLocale } from '../../i18n/LocaleContext'
import { M } from './genMultisiteData'
import { type SitePoint } from './model/multisite'

const W = 480
const H = 230
const PX0 = 52
const PX1 = 460
const PY0 = 14
const PY1 = 186

type Props = {
  points: SitePoint[]
  current: number
  best: number
  limit: number
}

/** COT 随 Site 数变化：可行段实线，超过通道上限的段虚线；当前 N 为方块，可行最低点为菱形 */
export function MultisiteFig({ points, current, best, limit }: Props) {
  const { t } = useLocale()
  const finite = points.filter((p) => Number.isFinite(p.cot))
  const maxN = points.length
  const yMax = Math.max(...finite.map((p) => p.cot)) * 1.05
  const yMin = Math.min(...finite.map((p) => p.cot)) * 0.95
  const xOf = (n: number) => PX0 + ((n - 1) / Math.max(1, maxN - 1)) * (PX1 - PX0)
  const yOf = (v: number) => PY1 - ((v - yMin) / Math.max(1e-9, yMax - yMin)) * (PY1 - PY0)

  const feasible = finite.filter((p) => p.feasible)
  const infeasible = finite.filter((p) => !p.feasible)
  const toPath = (list: SitePoint[]) => list.map((p, i) => `${i === 0 ? 'M' : 'L'}${xOf(p.n).toFixed(1)},${yOf(p.cot).toFixed(1)}`).join(' ')
  const bestPoint = points.find((p) => p.n === best && p.feasible)
  const curPoint = points.find((p) => p.n === current)
  const limitX = xOf(Math.min(limit, maxN))
  const ticks = [1, 4, 8, 12, 16].filter((n) => n <= maxN)

  return (
    <figure className="term-fig">
      <svg viewBox={`0 0 ${W} ${H}`} className="term-fig__svg" role="img" aria-label={t(M.curveAria)}>
        <rect width={W} height={H} rx="10" fill="var(--well)" />
        <rect x={PX0} y={PY0} width={PX1 - PX0} height={PY1 - PY0} fill="var(--fig-box)" stroke="var(--line-2)" />

        {limit < maxN && limit >= 1 ? (
          <line x1={limitX} x2={limitX} y1={PY0} y2={PY1} stroke="var(--muted)" strokeWidth="1" strokeDasharray="2 3" />
        ) : null}

        {feasible.length > 1 ? <path d={toPath(feasible)} fill="none" stroke="var(--green)" strokeWidth="2.2" /> : null}
        {infeasible.length > 1 ? <path d={toPath(infeasible)} fill="none" stroke="var(--muted)" strokeWidth="1.5" strokeDasharray="5 4" /> : null}

        {bestPoint ? (
          <polygon
            points={(() => {
              const x = xOf(bestPoint.n)
              const y = yOf(bestPoint.cot)
              return `${x},${y - 7} ${x + 7},${y} ${x},${y + 7} ${x - 7},${y}`
            })()}
            fill="var(--gold)"
            stroke="var(--text)"
            strokeWidth="0.8"
          />
        ) : null}

        {curPoint && Number.isFinite(curPoint.cot) ? (
          <rect
            x={xOf(curPoint.n) - 4.5}
            y={yOf(curPoint.cot) - 4.5}
            width="9"
            height="9"
            fill={curPoint.feasible ? 'var(--text)' : 'var(--muted)'}
            stroke="var(--fig-box)"
            strokeWidth="1"
          />
        ) : null}

        {ticks.map((n) => (
          <text key={n} x={xOf(n)} y={PY1 + 16} textAnchor="middle" fill="var(--muted)" fontSize="10" fontFamily="var(--mono)">
            {n}
          </text>
        ))}
        <text x={(PX0 + PX1) / 2} y={H - 4} textAnchor="middle" fill="var(--text)" fontSize="11">
          {t(M.curveX)}
        </text>
        <text x="8" y={(PY0 + PY1) / 2} fill="var(--text)" fontSize="11" transform={`rotate(-90 8 ${(PY0 + PY1) / 2})`} textAnchor="middle">
          {t(M.curveY)}
        </text>
        <text x={PX0 - 6} y={PY0 + 10} textAnchor="end" fill="var(--muted)" fontSize="10" fontFamily="var(--mono)">
          {yMax.toFixed(2)}
        </text>
        <text x={PX0 - 6} y={PY1} textAnchor="end" fill="var(--muted)" fontSize="10" fontFamily="var(--mono)">
          {yMin.toFixed(2)}
        </text>
      </svg>
      <figcaption>{t(M.curveCap)}</figcaption>
    </figure>
  )
}

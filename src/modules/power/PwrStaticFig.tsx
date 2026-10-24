import { useLocale } from '../../i18n/LocaleContext'
import { fillL } from './pwrSelectorData'
import { S } from './pwrStaticData'
import { errorCurve, rdsErrorAt, type StaticState } from './pwrStaticModel'

/** 示波器风格的深色底，颜色写死在 SVG 里（与 PWR-01 的图保持一致） */
const BG = '#0d1117'
const BOX = '#161b22'
const EDGE = '#3d4756'
const TEXT = '#c9d1d9'
const MUTED = '#8b949e'
const GOLD = '#e8c45a'
const BLUE = '#58a6ff'
const RED = '#f85149'

const W = 520
const H = 230
const PAD_L = 52
const PAD_R = 16
const PAD_T = 30
const PAD_B = 34
const PLOT_W = W - PAD_L - PAD_R
const PLOT_H = H - PAD_T - PAD_B
/** 横轴：10 µs ～ 10 ms，对数刻度 */
const LOG_LO = 1
const LOG_HI = 4

const xOfUs = (tUs: number) => PAD_L + ((Math.log10(tUs) - LOG_LO) / (LOG_HI - LOG_LO)) * PLOT_W

/** 误差随脉宽（对数横轴）的曲线；1% 误差线与当前脉宽标在图上 */
export function RdsErrFig({ state }: { state: StaticState }) {
  const { t } = useLocale()
  const curve = errorCurve(state)
  const current = rdsErrorAt(state.force, state.ta, state.dutyPct / 100, state.pulseUs * 1e-6)
  const maxErr = Math.max(...curve.map((point) => point.errPct), 0)
  const yMax = Math.max(2, Math.ceil(maxErr))
  const yOfPct = (pct: number) => PAD_T + (1 - pct / yMax) * PLOT_H
  const path = curve
    .map((point, index) => `${index === 0 ? 'M' : 'L'}${xOfUs(point.tUs).toFixed(1)},${yOfPct(point.errPct).toFixed(1)}`)
    .join(' ')
  const xCurrent = xOfUs(Math.min(Math.max(state.pulseUs, 10), 10000))
  const summary = t(
    fillL(S.errSummary, {
      pulse: state.pulseUs >= 1000 ? `${(state.pulseUs / 1000).toFixed(2)} ms` : `${state.pulseUs} µs`,
      err: current.errPct.toFixed(2),
    }),
  )
  const xTicks: Array<{ us: number; label: string }> = [
    { us: 10, label: '10 µs' },
    { us: 100, label: '100 µs' },
    { us: 1000, label: '1 ms' },
    { us: 10000, label: '10 ms' },
  ]

  return (
    <figure className="term-fig pwr-fig">
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={t(S.rdsAria)} className="pwr-svg">
        <rect x={0} y={0} width={W} height={H} rx={10} fill={BG} />
        <text x={12} y={18} fill={TEXT} fontSize={12}>
          {t(S.rdsTitle)}
        </text>
        <rect x={PAD_L} y={PAD_T} width={PLOT_W} height={PLOT_H} fill={BOX} stroke={EDGE} />
        {[0, yMax / 2, yMax].map((pct) => (
          <g key={pct}>
            <line x1={PAD_L} x2={PAD_L + PLOT_W} y1={yOfPct(pct)} y2={yOfPct(pct)} stroke={EDGE} strokeDasharray="2 3" />
            <text x={PAD_L - 6} y={yOfPct(pct) + 4} textAnchor="end" fill={MUTED} fontSize={10}>
              {`${pct.toFixed(0)}%`}
            </text>
          </g>
        ))}
        <line x1={PAD_L} x2={PAD_L + PLOT_W} y1={yOfPct(1)} y2={yOfPct(1)} stroke={RED} strokeWidth={1.5} strokeDasharray="6 4" />
        <text x={PAD_L + PLOT_W - 4} y={yOfPct(1) - 5} textAnchor="end" fill={RED} fontSize={10}>
          1%
        </text>
        {xTicks.map((tick) => (
          <text key={tick.us} x={xOfUs(tick.us)} y={H - 12} textAnchor="middle" fill={MUTED} fontSize={10}>
            {tick.label}
          </text>
        ))}
        <path d={path} fill="none" stroke={BLUE} strokeWidth={2} />
        <line x1={xCurrent} x2={xCurrent} y1={PAD_T} y2={PAD_T + PLOT_H} stroke={GOLD} strokeDasharray="4 3" />
        <circle cx={xCurrent} cy={yOfPct(current.errPct)} r={5} fill={GOLD} />
      </svg>
      <figcaption>
        <span className="pwr-fig__summary">{summary}</span>
        <span className="pwr-fig__cap">{t(S.rdsCap)}</span>
      </figcaption>
    </figure>
  )
}

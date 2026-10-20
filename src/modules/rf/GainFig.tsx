import { useLocale } from '../../i18n/LocaleContext'
import { FIG } from './rfGainData'
import { F_MAX_GHZ, F_MIN_GHZ, type GainAnalysis } from './rfGainModel'

const W = 480
const H = 232
const PX0 = 46
const PX1 = 468
const PY0 = 14
const PY1 = 190
/** 纵轴范围（dB）：放大器峰值 +12 dB，无源器件峰值约 −2.5 dB，都在范围内 */
const YMAX = 15
const YMIN = -30
const FREQ_TICKS = [0.1, 0.2, 0.5, 1, 2, 5, 10, 20]
const DB_TICKS = [10, 0, -10, -20, -30]

const fx = (f: number) => PX0 + (Math.log(f / F_MIN_GHZ) / Math.log(F_MAX_GHZ / F_MIN_GHZ)) * (PX1 - PX0)
const dy = (db: number) => {
  const clamped = Math.min(YMAX, Math.max(db, YMIN))
  return PY0 + ((YMAX - clamped) / (YMAX - YMIN)) * (PY1 - PY0)
}

/** 增益曲线：对数频率轴；金色带为工作带宽，虚线为峰值下降 3 dB，红点为 3 dB 带宽的两端 */
export function GainFig({ analysis }: { analysis: GainAnalysis }) {
  const { t } = useLocale()
  const curve = analysis.points.map((p) => `${fx(p.f).toFixed(1)},${dy(p.db).toFixed(1)}`).join(' ')
  const level = dy(analysis.peakDb - 3)
  const bandX0 = fx(analysis.bandLow)
  const bandX1 = fx(analysis.bandHigh)
  return (
    <figure className="term-fig">
      <svg viewBox={`0 0 ${W} ${H}`} className="term-fig__svg" role="img" aria-label={t(FIG.aria)}>
        <rect width={W} height={H} rx="10" fill="var(--well)" />
        <rect x={PX0} y={PY0} width={PX1 - PX0} height={PY1 - PY0} fill="var(--fig-box)" stroke="var(--line-2)" />
        <rect x={bandX0} y={PY0} width={Math.max(bandX1 - bandX0, 0)} height={PY1 - PY0} fill="var(--gold)" fillOpacity="0.14" />
        {DB_TICKS.map((db) => (
          <g key={db}>
            <line x1={PX0} x2={PX1} y1={dy(db)} y2={dy(db)} stroke="var(--line-2)" strokeDasharray="2 4" opacity="0.6" />
            <text x={PX0 - 6} y={dy(db) + 3} textAnchor="end" fill="var(--muted)" fontSize="10" fontFamily="var(--mono)">
              {`${db}`}
            </text>
          </g>
        ))}
        <line x1={PX0} x2={PX1} y1={level} y2={level} stroke="var(--gold)" strokeDasharray="4 3" />
        <polyline points={curve} fill="none" stroke="var(--blue)" strokeWidth="1.8" />
        {analysis.fLow !== null ? <circle cx={fx(analysis.fLow)} cy={level} r="3.5" fill="var(--red)" /> : null}
        {analysis.fHigh !== null ? <circle cx={fx(analysis.fHigh)} cy={level} r="3.5" fill="var(--red)" /> : null}
        <circle cx={fx(analysis.peakF)} cy={dy(analysis.peakDb)} r="3" fill="var(--text)" />
        {FREQ_TICKS.map((f) => (
          <text key={f} x={fx(f)} y={PY1 + 14} textAnchor="middle" fill="var(--muted)" fontSize="10" fontFamily="var(--mono)">
            {`${f}`}
          </text>
        ))}
        <text x={PX1} y={H - 8} textAnchor="end" fill="var(--muted)" fontSize="10" fontFamily="var(--mono)">
          GHz
        </text>
      </svg>
      <figcaption>{t(FIG.cap)}</figcaption>
    </figure>
  )
}

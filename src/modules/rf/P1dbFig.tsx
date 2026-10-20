import { useLocale } from '../../i18n/LocaleContext'
import { FIG } from './rfP1dbData'
import { type P1dbAnalysis } from './rfP1dbModel'

const W = 480
const H = 232
const PX0 = 46
const PX1 = 468
const PY0 = 14
const PY1 = 190
/** 坐标范围（dBm）：输入 −40 到 +30，输出 −40 到 +40 */
const XMIN = -40
const XMAX = 30
const YMIN = -40
const YMAX = 40
const X_TICKS = [-40, -30, -20, -10, 0, 10, 20, 30]
const Y_TICKS = [-40, -20, 0, 20, 40]

const fxp = (pin: number) => PX0 + ((pin - XMIN) / (XMAX - XMIN)) * (PX1 - PX0)
const fyp = (pout: number) => PY0 + ((YMAX - pout) / (YMAX - YMIN)) * (PY1 - PY0)

/** 输入−输出曲线：虚线为理想 1:1 增长（小信号增益），蓝线为 Rapp 模型，红线为 Psat，金点为 P1dB，蓝点为工作点 */
export function P1dbFig({ analysis }: { analysis: P1dbAnalysis }) {
  const { t } = useLocale()
  const curve = analysis.rows.map((r) => `${fxp(r.pin).toFixed(1)},${fyp(r.pout).toFixed(1)}`).join(' ')
  const g = analysis.smallGainDb
  const psatY = fyp(analysis.psat)
  return (
    <figure className="term-fig">
      <svg viewBox={`0 0 ${W} ${H}`} className="term-fig__svg" role="img" aria-label={t(FIG.aria)}>
        <defs>
          <clipPath id="rf-p1db-clip">
            <rect x={PX0} y={PY0} width={PX1 - PX0} height={PY1 - PY0} />
          </clipPath>
        </defs>
        <rect width={W} height={H} rx="10" fill="var(--well)" />
        <rect x={PX0} y={PY0} width={PX1 - PX0} height={PY1 - PY0} fill="var(--fig-box)" stroke="var(--line-2)" />
        {Y_TICKS.map((v) => (
          <g key={`y${v}`}>
            <line x1={PX0} x2={PX1} y1={fyp(v)} y2={fyp(v)} stroke="var(--line-2)" strokeDasharray="2 4" opacity="0.6" />
            <text x={PX0 - 6} y={fyp(v) + 3} textAnchor="end" fill="var(--muted)" fontSize="10" fontFamily="var(--mono)">
              {`${v}`}
            </text>
          </g>
        ))}
        {X_TICKS.map((v) => (
          <text key={`x${v}`} x={fxp(v)} y={PY1 + 14} textAnchor="middle" fill="var(--muted)" fontSize="10" fontFamily="var(--mono)">
            {`${v}`}
          </text>
        ))}
        <text x={PX1} y={H - 8} textAnchor="end" fill="var(--muted)" fontSize="10" fontFamily="var(--mono)">
          dBm
        </text>
        <g clipPath="url(#rf-p1db-clip)">
          <line x1={fxp(XMIN)} y1={fyp(XMIN + g)} x2={fxp(XMAX)} y2={fyp(XMAX + g)} stroke="var(--muted)" strokeDasharray="5 4" />
          <polyline points={curve} fill="none" stroke="var(--blue)" strokeWidth="1.8" />
          <line x1={PX0} x2={PX1} y1={psatY} y2={psatY} stroke="var(--red)" strokeDasharray="4 3" />
        </g>
        <text x={PX0 + 6} y={psatY - 5} fill="var(--red)" fontSize="10" fontFamily="var(--mono)">
          Psat
        </text>
        {analysis.p1in !== null && analysis.p1out !== null ? (
          <>
            <circle cx={fxp(analysis.p1in)} cy={fyp(analysis.p1out)} r="4" fill="var(--gold)" />
            <text x={fxp(analysis.p1in) - 8} y={fyp(analysis.p1out) - 10} textAnchor="end" fill="var(--gold)" fontSize="10" fontFamily="var(--mono)">
              P1dB
            </text>
          </>
        ) : null}
        <circle cx={fxp(analysis.pin)} cy={fyp(analysis.opPout)} r="3.5" fill="var(--blue)" stroke="var(--text)" strokeWidth="1" />
      </svg>
      <figcaption>{t(FIG.cap)}</figcaption>
    </figure>
  )
}

import { useLocale } from '../../i18n/LocaleContext'
import { loc } from '../../i18n/locale'
import { gammaMagAt, VSWR_LIMIT, type SparamAnalysis, type SparamState } from './rfSparamModel'

const W = 480
const H = 250

/** 左：Γ 平面（单位圆 |Γ| = 1，虚线圆为 VSWR = 2 的界线 |Γ| = 1/3） */
const GC_X = 118
const GC_Y = 136
const GR = 92

/** 右：|Γ| 随 R 变化（X 保持当前值） */
const PX0 = 300
const PX1 = 462
const PY0 = 44
const PY1 = 204
const R_MAX = 200

const GAMMA_LIMIT = (VSWR_LIMIT - 1) / (VSWR_LIMIT + 1)

const FIG = {
  aria: loc(
    '左图为反射系数 Γ 平面，原点是匹配，外圆是全反射；右图为 |Γ| 随负载电阻 R 变化的曲线，当前负载用一个点标出。',
    'Left: the reflection coefficient Γ plane; the origin is a match and the outer circle is full reflection. Right: |Γ| versus load resistance R, with the current load marked as a dot.',
  ),
  gammaTitle: loc('Γ 平面', 'Γ plane'),
  curveTitle: loc('|Γ| 随 R 变化', '|Γ| vs R'),
  limit: loc('2:1', '2:1'),
  caption: loc(
    '左图：离原点越远，反射越大；外圆 |Γ| = 1 是全反射。右图：X 固定，R 离 50 Ω 越远，|Γ| 越大；虚线以下才是 VSWR ≤ 2。',
    'Left: the farther from the origin, the larger the reflection; the outer circle |Γ| = 1 is full reflection. Right: with X fixed, the farther R is from 50 Ω, the larger |Γ|; only below the dashed line is VSWR ≤ 2.',
  ),
  re: loc('Re', 'Re'),
  im: loc('Im', 'Im'),
  rAxis: loc('R（Ω）', 'R (Ω)'),
}

function xOfR(rOhm: number): number {
  return PX0 + (rOhm / R_MAX) * (PX1 - PX0)
}

function yOfGamma(gammaMag: number): number {
  return PY1 - gammaMag * (PY1 - PY0)
}

/** 曲线：每 2 Ω 取一个点，X 固定为当前值 */
function curvePath(xOhm: number): string {
  const points: string[] = []
  for (let r = 0; r <= R_MAX; r += 2) {
    points.push(`${xOfR(r).toFixed(1)},${yOfGamma(gammaMagAt(r, xOhm)).toFixed(1)}`)
  }
  return `M ${points.join(' L ')}`
}

/** 负载的反射系数与曲线：两张图同时标出当前负载 */
export function RfSparamFig({ state, analysis }: { state: SparamState; analysis: SparamAnalysis }) {
  const { t } = useLocale()
  const dotX = GC_X + analysis.gamma.re * GR
  const dotY = GC_Y - analysis.gamma.im * GR
  const curveX = xOfR(state.rOhm)
  const curveY = yOfGamma(analysis.gammaMag)
  const dotClass = analysis.pass ? 'rfs-dot rfs-dot--pass' : 'rfs-dot rfs-dot--fail'
  return (
    <figure className="term-fig">
      <svg className="rfs-svg" viewBox={`0 0 ${W} ${H}`} role="img" aria-label={t(FIG.aria)}>
        <rect x={0} y={0} width={W} height={H} rx={10} className="rfs-bg" />

        <text x={8} y={18} className="rfs-title">{t(FIG.gammaTitle)}</text>
        <line x1={GC_X - GR - 8} y1={GC_Y} x2={GC_X + GR + 8} y2={GC_Y} className="rfs-axis" />
        <line x1={GC_X} y1={GC_Y - GR - 8} x2={GC_X} y2={GC_Y + GR + 8} className="rfs-axis" />
        <circle cx={GC_X} cy={GC_Y} r={GR} className="rfs-outer" />
        <circle cx={GC_X} cy={GC_Y} r={GR * GAMMA_LIMIT} className="rfs-limit" />
        <text x={GC_X + 4} y={GC_Y - GR * GAMMA_LIMIT - 3} className="rfs-tick">{t(FIG.limit)}</text>
        <text x={GC_X + GR + 14} y={GC_Y - 6} className="rfs-tick">{t(FIG.re)}</text>
        <text x={GC_X + 6} y={GC_Y - GR - 10} className="rfs-tick">{t(FIG.im)}</text>
        <circle cx={dotX} cy={dotY} r={5} className={dotClass} />

        <text x={PX0} y={18} className="rfs-title">{t(FIG.curveTitle)}</text>
        <line x1={PX0} y1={PY0 - 6} x2={PX0} y2={PY1} className="rfs-axis" />
        <line x1={PX0} y1={PY1} x2={PX1 + 6} y2={PY1} className="rfs-axis" />
        <line x1={PX0} y1={yOfGamma(GAMMA_LIMIT)} x2={PX1} y2={yOfGamma(GAMMA_LIMIT)} className="rfs-limit" />
        <text x={PX0 + 4} y={yOfGamma(GAMMA_LIMIT) + 12} className="rfs-tick">{t(FIG.limit)}</text>
        {[0, 50, 100, 150, 200].map((r) => (
          <text key={r} x={xOfR(r)} y={PY1 + 14} textAnchor="middle" className="rfs-tick">
            {String(r)}
          </text>
        ))}
        <text x={PX1} y={PY1 + 30} textAnchor="end" className="rfs-tick">{t(FIG.rAxis)}</text>
        <text x={PX0 - 6} y={PY0 + 4} textAnchor="end" className="rfs-tick">1</text>
        <text x={PX0 - 6} y={PY1 + 4} textAnchor="end" className="rfs-tick">0</text>
        <path d={curvePath(state.xOhm)} className="rfs-curve" />
        <circle cx={curveX} cy={curveY} r={5} className={dotClass} />
      </svg>
      <figcaption>{t(FIG.caption)}</figcaption>
    </figure>
  )
}

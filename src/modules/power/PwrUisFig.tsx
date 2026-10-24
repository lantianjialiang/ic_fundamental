import { useLocale } from '../../i18n/LocaleContext'
import { type LText } from '../../i18n/locale'
import { S } from './pwrUisData'
import { X_MAX, X_MIN, Y_MAX, Y_MIN } from './pwrUisModel'

/** 示波器风格的深色底，颜色写死在 SVG 里 */
const BG = '#0d1117'
const WIRE = '#8b949e'
const PART = '#c9d1d9'
const GRID = '#30363d'
const RDS = '#58a6ff'
const MAXI = '#e8c45a'
const THERM = '#f0883e'
const BVC = '#8b949e'
const OK = '#3fb950'
const BAD = '#f85149'

/** 雪崩电路示意图（教学示意）：母线 → 电感 L → 下管 DUT 漏极，源极接地 */
export function UisCircuitFig() {
  const { t } = useLocale()
  return (
    <figure className="pwr-uis-fig">
      <svg viewBox="0 0 300 150" role="img" aria-label={t(S.uisCircuitAria)} className="pwr-uis-svg">
        <rect x={0} y={0} width={300} height={150} rx={10} fill={BG} />
        <path d="M60 24 H200" stroke={WIRE} strokeWidth={2} fill="none" />
        <text x={66} y={16} fill={PART} fontSize={12}>Vdd</text>
        <path d="M100 24 V36 M100 36 a5 5 0 0 1 0 10 a5 5 0 0 1 0 10 a5 5 0 0 1 0 10 a5 5 0 0 1 0 10 M100 76 V84 H200 V96" stroke={PART} strokeWidth={1.8} fill="none" />
        <text x={92} y={58} textAnchor="end" fill={PART} fontSize={12}>L</text>
        <path d="M200 24 V36" stroke={WIRE} strokeWidth={2} fill="none" />
        <path d="M200 96 V100 H206 M206 100 V122 M206 122 H200 V134 M194 104 V118" stroke={PART} strokeWidth={2} fill="none" />
        <text x={216} y={114} fill={PART} fontSize={12}>DUT</text>
        <path d="M194 111 H176" stroke={WIRE} strokeWidth={1.8} fill="none" />
        <text x={172} y={106} textAnchor="end" fill={WIRE} fontSize={11}>Vgs</text>
        <path d="M200 134 V140 M190 140 H210 M194 144 H206" stroke={WIRE} strokeWidth={1.8} fill="none" />
        <text x={216} y={144} fill={WIRE} fontSize={11}>GND</text>
      </svg>
      <figcaption className="pwr-uis-note">{t(S.uisCircuitCap)}</figcaption>
    </figure>
  )
}

/* ---------- SOA 对数-对数图 ---------- */

const W = 520
const H = 300
const PL = 56
const PR = 14
const PT = 14
const PB = 40

/** x 取对数的像素位置 */
function xPx(v: number): number {
  return PL + ((Math.log10(v) - Math.log10(X_MIN)) / (Math.log10(X_MAX) - Math.log10(X_MIN))) * (W - PL - PR)
}

/** y 取对数的像素位置（向上为大） */
function yPx(v: number): number {
  return PT + (1 - (Math.log10(v) - Math.log10(Y_MIN)) / (Math.log10(Y_MAX) - Math.log10(Y_MIN))) * (H - PT - PB)
}

/** 折线路径：超出坐标范围的点断开，不画到图外 */
function pathOf(points: Array<[number, number]>): string {
  let d = ''
  let open = false
  for (const [x, y] of points) {
    const inside = x >= X_MIN && x <= X_MAX && y >= Y_MIN && y <= Y_MAX
    if (!inside) {
      open = false
      continue
    }
    d += `${open ? 'L' : 'M'}${xPx(x).toFixed(1)},${yPx(y).toFixed(1)} `
    open = true
  }
  return d.trim()
}

const X_TICKS = [0.1, 1, 10, 100]
const Y_TICKS = [0.1, 1, 10, 100, 1000]

export type SoaCurves = {
  rds: Array<[number, number]>
  max: Array<[number, number]>
  thermal: Array<[number, number]>
  bv: Array<[number, number]>
}

/** SOA 图：四条边界（对数-对数）、工作点；图的文字替代由调用方给出 */
export function SoaPlot({
  curves,
  op,
  labels,
  ariaLabel,
  caption,
}: {
  curves: SoaCurves
  op: { vds: number; id: number; ok: boolean }
  labels: { rds: LText; max: LText; thermal: LText; bv: LText; op: LText; okText: LText; badText: LText }
  ariaLabel: string
  caption: string
}) {
  const { t } = useLocale()
  return (
    <figure className="pwr-uis-soa">
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={ariaLabel} className="pwr-uis-svg">
        <rect x={0} y={0} width={W} height={H} rx={10} fill={BG} />
        {X_TICKS.map((v) => (
          <g key={`x${v}`}>
            <line x1={xPx(v)} y1={PT} x2={xPx(v)} y2={H - PB} stroke={GRID} />
            <text x={xPx(v)} y={H - PB + 14} textAnchor="middle" fill={PART} fontSize={10}>
              {String(v)}
            </text>
          </g>
        ))}
        {Y_TICKS.map((v) => (
          <g key={`y${v}`}>
            <line x1={PL} y1={yPx(v)} x2={W - PR} y2={yPx(v)} stroke={GRID} />
            <text x={PL - 6} y={yPx(v) + 3} textAnchor="end" fill={PART} fontSize={10}>
              {String(v)}
            </text>
          </g>
        ))}
        <rect x={PL} y={PT} width={W - PL - PR} height={H - PT - PB} fill="none" stroke={WIRE} />
        <path d={pathOf(curves.rds)} stroke={RDS} strokeWidth={1.8} fill="none" />
        <path d={pathOf(curves.max)} stroke={MAXI} strokeWidth={1.8} fill="none" />
        <path d={pathOf(curves.thermal)} stroke={THERM} strokeWidth={1.8} fill="none" />
        <path d={pathOf(curves.bv)} stroke={BVC} strokeWidth={1.4} strokeDasharray="5 4" fill="none" />
        <circle cx={xPx(op.vds)} cy={yPx(op.id)} r={5} fill={op.ok ? OK : BAD} stroke={PART} strokeWidth={1} />
        <text x={W / 2} y={H - 6} textAnchor="middle" fill={PART} fontSize={11}>
          {t(S.axisX)}
        </text>
        <text x={14} y={PT + 4} fill={PART} fontSize={11}>
          {t(S.axisY)}
        </text>
      </svg>
      <div className="pwr-uis-legend">
        <span>
          <i style={{ background: RDS }} aria-hidden="true" />
          {t(labels.rds)}
        </span>
        <span>
          <i style={{ background: MAXI }} aria-hidden="true" />
          {t(labels.max)}
        </span>
        <span>
          <i style={{ background: THERM }} aria-hidden="true" />
          {t(labels.thermal)}
        </span>
        <span>
          <i style={{ background: BVC }} aria-hidden="true" />
          {t(labels.bv)}
        </span>
        <span>
          <i style={{ background: op.ok ? OK : BAD }} aria-hidden="true" />
          {t(labels.op)} {t(op.ok ? labels.okText : labels.badText)}
        </span>
      </div>
      <figcaption className="pwr-uis-note">{caption}</figcaption>
    </figure>
  )
}

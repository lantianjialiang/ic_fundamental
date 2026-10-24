import { useLocale } from '../../i18n/LocaleContext'
import { T_MAX_H, T_MIN_H, type BathAnalysis, type SegId } from './relBathtubModel'
import { FIG } from './relBathtubData'

/** 示波器风格的深色底，颜色写死在 SVG 里（与 RF 课保持一致） */
const BG = '#0d1117'
const BOX = '#161b22'
const EDGE = '#3d4756'
const TEXT = '#c9d1d9'
const MUTED = '#8b949e'
const GOLD = '#e8c45a'
const BLUE = '#58a6ff'

/** 三张图共用的绘图区：左右留出刻度文字的位置 */
const W = 560
const H = 240
const X0 = 62
const X1 = 540
const Y0 = 26
const Y1 = 196
const DECADES = Math.log10(T_MAX_H / T_MIN_H)

/** 时间（h）→ x 坐标，对数轴 */
function mapX(t: number): number {
  const clamped = Math.min(Math.max(t, T_MIN_H), T_MAX_H)
  return X0 + ((Math.log10(clamped) - Math.log10(T_MIN_H)) / DECADES) * (X1 - X0)
}

/** 失效率（FIT）→ y 坐标，对数轴，1 … 1e9 FIT */
function mapYFit(fit: number): number {
  const clamped = Math.min(Math.max(fit, 1), 1e9)
  return Y1 - (Math.log10(clamped) / 9) * (Y1 - Y0)
}

/** 可靠度 → y 坐标，线性轴，0 … 1 */
function mapYR(r: number): number {
  return Y1 - Math.min(Math.max(r, 0), 1) * (Y1 - Y0)
}

const X_TICKS: Array<{ t: number; label: string }> = [
  { t: 0.1, label: '0.1' },
  { t: 1, label: '1' },
  { t: 100, label: '10²' },
  { t: 1e4, label: '10⁴' },
  { t: 1e6, label: '10⁶' },
]

function XAxis() {
  const { t } = useLocale()
  return (
    <g>
      <line x1={X0} y1={Y1} x2={X1} y2={Y1} stroke={EDGE} />
      {X_TICKS.map((tick) => (
        <g key={tick.label}>
          <line x1={mapX(tick.t)} y1={Y0} x2={mapX(tick.t)} y2={Y1} stroke={EDGE} strokeOpacity={0.35} strokeDasharray="2 4" />
          <text x={mapX(tick.t)} y={212} textAnchor="middle" fill={MUTED} fontSize={11}>
            {tick.label}
          </text>
        </g>
      ))}
      <text x={X1} y={232} textAnchor="end" fill={MUTED} fontSize={11}>
        {t(FIG.axT)}
      </text>
    </g>
  )
}

/** 段界的分界线与 ELFR 覆盖段的阴影 */
function SegmentBands({ a, seg }: { a: BathAnalysis; seg: SegId }) {
  const bands: Record<SegId, [number, number]> = {
    random: [a.t1, a.t2],
    early: [T_MIN_H, a.t1],
    wear: [a.t2, T_MAX_H],
  }
  const [lo, hi] = bands[seg]
  return (
    <g>
      <rect x={mapX(lo)} y={Y0} width={Math.max(0, mapX(hi) - mapX(lo))} height={Y1 - Y0} fill={GOLD} fillOpacity={0.14} />
      <line x1={mapX(a.t1)} y1={Y0} x2={mapX(a.t1)} y2={Y1} stroke={MUTED} strokeDasharray="4 3" />
      <line x1={mapX(a.t2)} y1={Y0} x2={mapX(a.t2)} y2={Y1} stroke={MUTED} strokeDasharray="4 3" />
    </g>
  )
}

function polyline(xs: number[], ys: number[]): string {
  return xs.map((x, i) => `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${ys[i].toFixed(1)}`).join(' ')
}

/** 失效率 h(t) 的浴盆曲线（对数轴），阴影标出 ELFR 覆盖的段 */
export function BathFig({ analysis, seg }: { analysis: BathAnalysis; seg: SegId }) {
  const { t } = useLocale()
  const xs = analysis.grid.map(mapX)
  const ys = analysis.hazardFit.map(mapYFit)
  return (
    <figure className="term-fig rel-bath-fig">
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={t(FIG.bathAria)} className="rel-svg">
        <rect x={0} y={0} width={W} height={H} rx={10} fill={BG} />
        <rect x={X0} y={Y0} width={X1 - X0} height={Y1 - Y0} fill={BOX} />
        <text x={X0} y={16} fill={TEXT} fontSize={12}>
          {t(FIG.axH)}
        </text>
        {[1, 1e3, 1e6, 1e9].map((fit) => (
          <g key={fit}>
            <line x1={X0} y1={mapYFit(fit)} x2={X1} y2={mapYFit(fit)} stroke={EDGE} strokeOpacity={0.35} strokeDasharray="2 4" />
            <text x={X0 - 6} y={mapYFit(fit) + 4} textAnchor="end" fill={MUTED} fontSize={11}>
              {fit === 1 ? '1' : fit === 1e3 ? '10³' : fit === 1e6 ? '10⁶' : '10⁹'}
            </text>
          </g>
        ))}
        <SegmentBands a={analysis} seg={seg} />
        <path d={polyline(xs, ys)} fill="none" stroke={GOLD} strokeWidth={2} />
        <XAxis />
      </svg>
      <figcaption>
        {t(FIG.bathCap)}
        <span className="rel-legend">{`${t(FIG.legHazard)} · ${t(FIG.legBand)}`}</span>
      </figcaption>
    </figure>
  )
}

/** 可靠度 R(t)：全群体（金）与只看随机段 exp(−λt)（蓝虚线） */
export function RelCurveFig({ analysis, seg }: { analysis: BathAnalysis; seg: SegId }) {
  const { t } = useLocale()
  const xs = analysis.grid.map(mapX)
  const full = analysis.rel.map(mapYR)
  const random = analysis.relRandom.map(mapYR)
  const r90x = mapX(analysis.r90)
  const r90y = mapYR(0.9)
  return (
    <figure className="term-fig rel-bath-fig">
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={t(FIG.relAria)} className="rel-svg">
        <rect x={0} y={0} width={W} height={H} rx={10} fill={BG} />
        <rect x={X0} y={Y0} width={X1 - X0} height={Y1 - Y0} fill={BOX} />
        <text x={X0} y={16} fill={TEXT} fontSize={12}>
          {t(FIG.relTitle)}
        </text>
        {[0, 0.5, 1].map((r) => (
          <g key={r}>
            <line x1={X0} y1={mapYR(r)} x2={X1} y2={mapYR(r)} stroke={EDGE} strokeOpacity={0.35} strokeDasharray="2 4" />
            <text x={X0 - 6} y={mapYR(r) + 4} textAnchor="end" fill={MUTED} fontSize={11}>
              {r.toFixed(1)}
            </text>
          </g>
        ))}
        <SegmentBands a={analysis} seg={seg} />
        <line x1={X0} y1={r90y} x2={X1} y2={r90y} stroke={MUTED} strokeDasharray="1 3" />
        <line x1={r90x} y1={r90y} x2={r90x} y2={Y1} stroke={MUTED} strokeDasharray="1 3" />
        <path d={polyline(xs, random)} fill="none" stroke={BLUE} strokeWidth={2} strokeDasharray="5 4" />
        <path d={polyline(xs, full)} fill="none" stroke={GOLD} strokeWidth={2} />
        <XAxis />
      </svg>
      <figcaption>
        {t(FIG.relCap)}
        <span className="rel-legend">{`${t(FIG.legRel)} · ${t(FIG.legRandom)} · ${t(FIG.legBand)}`}</span>
      </figcaption>
    </figure>
  )
}

/** 失效数直方图：蒙特卡洛计数（蓝柱）与解析期望（金线），按对数时间分箱 */
export function HistFig({ analysis, seg }: { analysis: BathAnalysis; seg: SegId }) {
  const { t } = useLocale()
  const { edges, counts, expected } = analysis.hist
  const peak = Math.max(1, ...counts, ...expected)
  const yOf = (count: number) => Y1 - (count / peak) * (Y1 - Y0)
  const centers = edges.slice(0, -1).map((lo, i) => (mapX(lo) + mapX(edges[i + 1])) / 2)
  return (
    <figure className="term-fig rel-bath-fig">
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={t(FIG.histAria)} className="rel-svg">
        <rect x={0} y={0} width={W} height={H} rx={10} fill={BG} />
        <rect x={X0} y={Y0} width={X1 - X0} height={Y1 - Y0} fill={BOX} />
        <text x={X0} y={16} fill={TEXT} fontSize={12}>
          {t(FIG.histTitle)}
        </text>
        <SegmentBands a={analysis} seg={seg} />
        {counts.map((count, i) => {
          const x = mapX(edges[i])
          const w = Math.max(1, mapX(edges[i + 1]) - x - 1)
          return <rect key={i} x={x} y={yOf(count)} width={w} height={Y1 - yOf(count)} fill={BLUE} />
        })}
        <path d={polyline(centers, expected.map(yOf))} fill="none" stroke={GOLD} strokeWidth={2} />
        <XAxis />
      </svg>
      <figcaption>
        {t(FIG.histCap)}
        <span className="rel-legend">{`${t(FIG.legMc)} · ${t(FIG.legExp)} · ${t(FIG.legBand)}`}</span>
      </figcaption>
    </figure>
  )
}

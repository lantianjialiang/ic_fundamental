import { useLocale } from '../../i18n/LocaleContext'
import { type LText } from '../../i18n/locale'
import './scope.css'

export type ScopeTrace = {
  id: string
  label: LText
  color: string
  values: number[]
}

type Props = {
  /** 时间轴（与 traces 的采样点一一对应） */
  t: number[]
  /** 时间单位，例如 'ns'、'µs' */
  tUnit: string
  traces: ScopeTrace[]
  /** 积分区间（可选），用于能量、电荷等的读数 */
  shade?: { from: number; to: number; label: LText }
  /** 可选第二个区间与功率曲线面积，时间轴和 shade 相同 */
  band?: { from: number; to: number; label: LText }
  area?: { traceId: string; from: number; to: number }
  yUnit?: string
  /** 纵轴范围；不给则由数据自动决定 */
  yRange?: [number, number]
  /** 文字替代：整幅波形的读数摘要，已翻译好 */
  summary: string
  /** 无障碍名称，已翻译好 */
  ariaLabel: string
}

const W = 520
const H = 220
const PAD_L = 52
const PAD_R = 12
const PAD_T = 14
const PAD_B = 30

/** 多通道示波器视图：折线、可选积分阴影、文字摘要（替代读数） */
export function ScopeView({ t, tUnit, traces, shade, band, area, yUnit, yRange, summary, ariaLabel }: Props) {
  const { t: tr } = useLocale()
  const tMax = t.length > 0 ? t[t.length - 1] : 1
  const all = traces.flatMap((tc) => tc.values)
  const lo = yRange ? yRange[0] : Math.min(0, ...all)
  const hi = yRange ? yRange[1] : Math.max(1e-9, ...all)
  const span = hi - lo || 1
  const xOf = (v: number) => PAD_L + (v / (tMax || 1)) * (W - PAD_L - PAD_R)
  const yOf = (v: number) => PAD_T + (1 - (v - lo) / span) * (H - PAD_T - PAD_B)
  const pathOf = (values: number[]) =>
    values.map((v, i) => `${i === 0 ? 'M' : 'L'}${xOf(t[i]).toFixed(1)},${yOf(v).toFixed(1)}`).join(' ')
  const areaTrace = area && traces.find((trace) => trace.id === area.traceId)
  const areaPoints = area && areaTrace
    ? t.flatMap((time, index) => time >= area.from && time <= area.to ? [[xOf(time), yOf(areaTrace.values[index])]] : [])
    : []
  const firstAreaPoint = areaPoints[0]
  const lastAreaPoint = areaPoints[areaPoints.length - 1]

  return (
    <figure className="scope">
      <svg viewBox={`0 0 ${W} ${H}`} className="scope__svg" role="img" aria-label={ariaLabel}>
        <rect x={PAD_L} y={PAD_T} width={W - PAD_L - PAD_R} height={H - PAD_T - PAD_B} fill="var(--fig-box)" stroke="var(--line-2)" />
        {shade ? (
          <rect
            x={xOf(shade.from)}
            y={PAD_T}
            width={Math.max(0, xOf(shade.to) - xOf(shade.from))}
            height={H - PAD_T - PAD_B}
            fill="var(--gold)"
            opacity="0.14"
          >
            <title>{tr(shade.label)}</title>
          </rect>
        ) : null}
        {firstAreaPoint && lastAreaPoint && (
          <polygon points={[[firstAreaPoint[0], yOf(0)], ...areaPoints, [lastAreaPoint[0], yOf(0)]].map((point) => point.join(',')).join(' ')}
            fill={areaTrace?.color} opacity="0.28" data-scope-area="" />
        )}
        {band && band.to > band.from && (
          <rect x={xOf(band.from)} y={PAD_T} width={xOf(band.to) - xOf(band.from)} height={H - PAD_T - PAD_B}
            fill="var(--blue)" fillOpacity="0.12" stroke="var(--blue)" strokeDasharray="3 3" data-scope-band="">
            <title>{tr(band.label)}</title>
          </rect>
        )}
        {traces.map((tc) => (
          <path key={tc.id} d={pathOf(tc.values)} fill="none" stroke={tc.color} strokeWidth="1.8" />
        ))}
        <text x={PAD_L - 6} y={PAD_T + 10} textAnchor="end" fill="var(--muted)" fontSize="10" fontFamily="var(--mono)">
          {hi.toPrecision(3)}{yUnit ? ` ${yUnit}` : ''}
        </text>
        <text x={PAD_L - 6} y={H - PAD_B} textAnchor="end" fill="var(--muted)" fontSize="10" fontFamily="var(--mono)">
          {lo.toPrecision(3)}
        </text>
        <text x={W - PAD_R} y={H - 8} textAnchor="end" fill="var(--muted)" fontSize="10" fontFamily="var(--mono)">
          {`${tMax.toPrecision(3)} ${tUnit}`}
        </text>
      </svg>
      <div className="scope__legend">
        {traces.map((tc) => (
          <span key={tc.id} className="scope__key">
            <i style={{ background: tc.color }} aria-hidden="true" />
            {tr(tc.label)}
          </span>
        ))}
        {shade ? <span className="scope__key">{tr(shade.label)}</span> : null}
        {band && band.to > band.from ? <span className="scope__key">{tr(band.label)}</span> : null}
      </div>
      <figcaption className="scope__summary">{summary}</figcaption>
    </figure>
  )
}

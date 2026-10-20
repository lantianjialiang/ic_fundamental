import { useLocale } from '../../i18n/LocaleContext'
import { FIG } from './hsJitterData'
import { type JitterAnalysis, LOG_FLOOR } from './hsJitterModel'

const CW = 480
const CH = 172
const PAD_L = 42
const PAD_R = 14
const PAD_T = 12
const PAD_B = 30
const PLOT_W = CW - PAD_L - PAD_R
const PLOT_H = CH - PAD_T - PAD_B

/** 示波器风格的深色底，颜色写死在 SVG 里，与眼图保持一致 */
const BG = '#0d1117'
const GRID = '#3d4756'
const LABEL = '#8b949e'
const BAR = 'rgba(88, 166, 255, 0.62)'
const MODEL = '#e8c45a'
const OPEN = 'rgba(126, 231, 135, 0.28)'
const OPEN_LINE = '#7ee787'

/** 直方图：固定种子抽样的偏移分布，叠上双峰高斯的理论曲线 */
export function JitterHistFig({ analysis: a }: { analysis: JitterAnalysis }) {
  const { t } = useLocale()
  const xOf = (ps: number) => PAD_L + ((ps + a.range) / (2 * a.range)) * PLOT_W
  let peak = 1
  for (const bin of a.bins) {
    if (bin.count > peak) {
      peak = bin.count
    }
    if (bin.model > peak) {
      peak = bin.model
    }
  }
  const yMax = peak * 1.1
  const yOf = (count: number) => PAD_T + PLOT_H - (count / yMax) * PLOT_H
  const barW = (a.binWidth / (2 * a.range)) * PLOT_W
  const modelPoints = a.bins.map((bin) => `${xOf(bin.centre).toFixed(1)},${yOf(bin.model).toFixed(1)}`).join(' ')

  return (
    <figure className="term-fig">
      <svg className="hs-jitter-fig" viewBox={`0 0 ${CW} ${CH}`} role="img" aria-label={t(FIG.histAria)}>
        <rect x={0} y={0} width={CW} height={CH} fill={BG} rx={10} />
        {a.bins.map((bin, index) => (
          <rect
            key={index}
            x={xOf(bin.centre) - barW / 2}
            y={yOf(bin.count)}
            width={Math.max(0, barW - 1)}
            height={Math.max(0, PAD_T + PLOT_H - yOf(bin.count))}
            fill={BAR}
          />
        ))}
        <polyline points={modelPoints} fill="none" stroke={MODEL} strokeWidth={1.5} />
        <line x1={PAD_L} x2={PAD_L + PLOT_W} y1={PAD_T + PLOT_H} y2={PAD_T + PLOT_H} stroke={GRID} strokeWidth={1} />
        <text x={PAD_L} y={PAD_T + PLOT_H + 16} textAnchor="start" fontSize={11} fill={LABEL}>
          {`${(-a.range).toFixed(0)} ps`}
        </text>
        <text x={xOf(0)} y={PAD_T + PLOT_H + 16} textAnchor="middle" fontSize={11} fill={LABEL}>
          0
        </text>
        <text x={PAD_L + PLOT_W} y={PAD_T + PLOT_H + 16} textAnchor="end" fontSize={11} fill={LABEL}>
          {`+${a.range.toFixed(0)} ps`}
        </text>
        <text x={PAD_L - 6} y={PAD_T + 10} textAnchor="end" fontSize={11} fill={LABEL}>
          {t(FIG.histCount)}
        </text>
      </svg>
      <figcaption>{t(FIG.histCap)}</figcaption>
    </figure>
  )
}

/** 浴盆曲线：误码率（对数）随采样位置变化；目标 BER 下的开口为绿色区 */
export function JitterBathFig({ analysis: a, ber }: { analysis: JitterAnalysis; ber: number }) {
  const { t } = useLocale()
  const xOf = (ps: number) => PAD_L + (ps / a.ui) * PLOT_W
  const yOf = (log: number) => PAD_T + ((0 - log) / (0 - LOG_FLOOR)) * PLOT_H
  const curve = a.bath.map((point) => `${xOf(point.x).toFixed(1)},${yOf(point.log).toFixed(1)}`).join(' ')
  const targetY = yOf(Math.log10(ber))
  const openWidth = xOf(a.openRight) - xOf(a.openLeft)
  const ticks = [0, -4, -8, -12, -16]
  const tickLabel = (log: number) => (log === 0 ? '1' : `1e${log}`)

  return (
    <figure className="term-fig">
      <svg className="hs-jitter-fig" viewBox={`0 0 ${CW} ${CH}`} role="img" aria-label={t(FIG.bathAria)}>
        <rect x={0} y={0} width={CW} height={CH} fill={BG} rx={10} />
        {a.pass ? (
          <g>
            <rect x={xOf(a.openLeft)} y={PAD_T} width={Math.max(0, openWidth)} height={PLOT_H} fill={OPEN} />
            <line x1={xOf(a.openLeft)} x2={xOf(a.openLeft)} y1={PAD_T} y2={PAD_T + PLOT_H} stroke={OPEN_LINE} strokeWidth={1} strokeDasharray="4 3" />
            <line x1={xOf(a.openRight)} x2={xOf(a.openRight)} y1={PAD_T} y2={PAD_T + PLOT_H} stroke={OPEN_LINE} strokeWidth={1} strokeDasharray="4 3" />
          </g>
        ) : null}
        {ticks.map((log) => (
          <g key={log}>
            <line x1={PAD_L} x2={PAD_L + PLOT_W} y1={yOf(log)} y2={yOf(log)} stroke={GRID} strokeWidth={1} strokeDasharray="2 4" />
            <text x={PAD_L - 6} y={yOf(log)} textAnchor="end" dominantBaseline="middle" fontSize={11} fill={LABEL}>
              {tickLabel(log)}
            </text>
          </g>
        ))}
        <line x1={PAD_L} x2={PAD_L + PLOT_W} y1={targetY} y2={targetY} stroke={MODEL} strokeWidth={1} strokeDasharray="5 3" />
        <polyline points={curve} fill="none" stroke="#58a6ff" strokeWidth={2} />
        {a.pass && openWidth > 90 ? (
          <text x={(xOf(a.openLeft) + xOf(a.openRight)) / 2} y={PAD_T + 14} textAnchor="middle" fontSize={11} fill={OPEN_LINE}>
            {`${t(FIG.openLabel)} ${a.opening.toFixed(1)} ps`}
          </text>
        ) : null}
        <text x={PAD_L} y={PAD_T + PLOT_H + 16} textAnchor="start" fontSize={11} fill={LABEL}>
          0
        </text>
        <text x={PAD_L + PLOT_W} y={PAD_T + PLOT_H + 16} textAnchor="end" fontSize={11} fill={LABEL}>
          {`UI = ${a.ui.toFixed(1)} ps`}
        </text>
      </svg>
      <figcaption>{t(FIG.bathCap)}</figcaption>
    </figure>
  )
}

import { useLocale } from '../../i18n/LocaleContext'
import { FIG } from './hsTimingData'
import { type TimingAnalysis } from './hsTimingModel'

const CW = 480
const CH = 150
const PAD_L = 16
const PAD_R = 16
const PLOT_T = 30
const PLOT_B = 104

/** 示波器风格的深色底，颜色写死在 SVG 里，与眼图保持一致 */
const BG = '#0d1117'
const GRID = '#3d4756'
const LABEL = '#8b949e'
const EDGE = '#c9d1d9'
const SPREAD = 'rgba(139, 148, 158, 0.22)'
const DANGER = 'rgba(248, 81, 73, 0.38)'
const WINDOW = 'rgba(126, 231, 135, 0.32)'
const OK_LINE = '#7ee787'
const BAD_LINE = '#f85149'

/** 横轴范围：0 与 UI 两个理想沿，再留出抖动与边距 */
function axisRange(a: TimingAnalysis): { lo: number; hi: number } {
  const pad = 0.12 * a.ui
  const lo = Math.min(0, a.minEdge) - pad
  const hi = Math.max(a.ui, a.ui + a.maxEdge) + pad
  return { lo, hi }
}

/** 数据位时序图：两个数据沿带抖动，红色为 Setup / Hold 违例区，绿色为有效窗口，竖线为采样沿 */
export function TimingFig({ analysis: a }: { analysis: TimingAnalysis }) {
  const { t } = useLocale()
  const { lo, hi } = axisRange(a)
  const xOf = (ps: number) => PAD_L + ((ps - lo) / (hi - lo)) * (CW - PAD_L - PAD_R)

  const setupX = xOf(a.setupBoundary)
  const holdX = xOf(a.holdBoundary)
  const clockX = xOf(a.sample)
  const clockOk = a.pass
  const clockLabelLeft = a.sample < a.ui / 2

  return (
    <figure className="term-fig">
      <svg
        className="hs-timing-fig"
        viewBox={`0 0 ${CW} ${CH}`}
        role="img"
        aria-label={t(FIG.aria)}
      >
        <rect x={0} y={0} width={CW} height={CH} fill={BG} rx={10} />

        <rect
          x={xOf(a.minEdge)}
          y={PLOT_T}
          width={Math.max(0, xOf(a.maxEdge) - xOf(a.minEdge))}
          height={PLOT_B - PLOT_T}
          fill={SPREAD}
        />
        <rect
          x={xOf(a.ui + a.minEdge)}
          y={PLOT_T}
          width={Math.max(0, xOf(a.ui + a.maxEdge) - xOf(a.ui + a.minEdge))}
          height={PLOT_B - PLOT_T}
          fill={SPREAD}
        />

        <rect
          x={xOf(a.minEdge)}
          y={PLOT_T}
          width={Math.max(0, setupX - xOf(a.minEdge))}
          height={PLOT_B - PLOT_T}
          fill={DANGER}
        />
        <rect
          x={holdX}
          y={PLOT_T}
          width={Math.max(0, xOf(a.ui + a.maxEdge) - holdX)}
          height={PLOT_B - PLOT_T}
          fill={DANGER}
        />

        {a.window > 0 ? (
          <rect x={setupX} y={PLOT_T} width={holdX - setupX} height={PLOT_B - PLOT_T} fill={WINDOW} />
        ) : null}

        {a.offsets.map((offset, index) => (
          <g key={index}>
            <line x1={xOf(offset)} x2={xOf(offset)} y1={PLOT_T + 2} y2={PLOT_T + 12} stroke={LABEL} strokeWidth={1} />
            <line x1={xOf(a.ui + offset)} x2={xOf(a.ui + offset)} y1={PLOT_T + 2} y2={PLOT_T + 12} stroke={LABEL} strokeWidth={1} />
          </g>
        ))}

        <line x1={xOf(0)} x2={xOf(0)} y1={PLOT_T} y2={PLOT_B} stroke={EDGE} strokeWidth={1.5} />
        <line x1={xOf(a.ui)} x2={xOf(a.ui)} y1={PLOT_T} y2={PLOT_B} stroke={EDGE} strokeWidth={1.5} />
        <line x1={xOf(lo)} x2={xOf(hi)} y1={PLOT_B} y2={PLOT_B} stroke={GRID} strokeWidth={1} />

        <line
          x1={clockX}
          x2={clockX}
          y1={PLOT_T - 6}
          y2={PLOT_B}
          stroke={clockOk ? OK_LINE : BAD_LINE}
          strokeWidth={2}
        />
        <text
          x={clockLabelLeft ? clockX + 5 : clockX - 5}
          y={PLOT_T - 10}
          textAnchor={clockLabelLeft ? 'start' : 'end'}
          fontSize={11}
          fontFamily="Consolas, ui-monospace, monospace"
          fill={clockOk ? OK_LINE : BAD_LINE}
        >
          {`${t(FIG.clock)} ${a.sample.toFixed(1)} ps`}
        </text>

        <text x={xOf(0)} y={PLOT_B + 16} textAnchor="start" fontSize={11} fill={LABEL}>
          {t(FIG.edge0)}
        </text>
        <text x={xOf(a.ui)} y={PLOT_B + 16} textAnchor="end" fontSize={11} fill={LABEL}>
          {t(FIG.edge1)}
        </text>
      </svg>
      <figcaption>{t(FIG.cap)}</figcaption>
    </figure>
  )
}

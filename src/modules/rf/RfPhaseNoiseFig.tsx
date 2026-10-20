import { type MouseEvent } from 'react'
import { useLocale } from '../../i18n/LocaleContext'
import { FIG } from './rfPhaseNoiseData'
import { type PnAnalysis, type PnState, fmtFreq, lOf, offsetHz } from './rfPhaseNoiseModel'

const CW = 480
const CH = 260
const PAD_L = 52
const PAD_R = 12
const PAD_T = 12
const PAD_B = 40
const PLOT_W = CW - PAD_L - PAD_R
const PLOT_H = CH - PAD_T - PAD_B
/** 横轴 10^3–10^7 Hz（对数），纵轴 −50 到 −170 dBc/Hz */
const EXP_MIN = 3
const EXP_MAX = 7
const YTOP = -50
const YBOT = -170

const xOfExp = (exp: number) => PAD_L + ((exp - EXP_MIN) / (EXP_MAX - EXP_MIN)) * PLOT_W
const yOf = (dbcHz: number) => PAD_T + ((YTOP - Math.min(Math.max(dbcHz, YBOT), YTOP)) / (YTOP - YBOT)) * PLOT_H

/** 示波器风格的深色底，颜色写死在 SVG 里 */
const BG = '#0d1117'
const GRID = '#3d4756'
const LABEL_COLOR = '#8b949e'
const TRACE = '#58a6ff'
const BAND = '#e8c45a'
const GUIDE = '#8b949e'
const MARK = '#f85149'

const Y_TICKS = [-60, -80, -100, -120, -140, -160]
const X_TICKS = [3, 4, 5, 6, 7]
const X_TICK_TEXT: Record<number, string> = { 3: '1 kHz', 4: '10 kHz', 5: '100 kHz', 6: '1 MHz', 7: '10 MHz' }

/** 相位噪声图：L(f) 曲线（对数频率轴）、1/f² 与底噪的虚线、积分区间、当前偏移点；点击曲线可选频偏 */
export function PhaseNoiseFig({
  state,
  analysis,
  onPick,
}: {
  state: PnState
  analysis: PnAnalysis
  onPick: (exp: number) => void
}) {
  const { t } = useLocale()

  const curve: string[] = []
  const points = 160
  for (let i = 0; i < points; i += 1) {
    const exp = EXP_MIN + ((EXP_MAX - EXP_MIN) * i) / (points - 1)
    curve.push(`${xOfExp(exp).toFixed(1)},${yOf(lOf(state, 10 ** exp)).toFixed(1)}`)
  }

  // 1/f² 虚线：从 1 kHz 画到与底噪相交（或到 10 MHz）；底噪虚线从相交处画到 10 MHz
  const cross = EXP_MIN + (state.l1k - state.floor) / 20
  const flickerEnd = Math.min(Math.max(cross, EXP_MIN), EXP_MAX)
  const flickerY = (exp: number) => state.l1k - 20 * (exp - EXP_MIN)
  const flickerLine = `${xOfExp(EXP_MIN).toFixed(1)},${yOf(flickerY(EXP_MIN)).toFixed(1)} ${xOfExp(flickerEnd).toFixed(1)},${yOf(flickerY(flickerEnd)).toFixed(1)}`
  const floorLine = `${xOfExp(flickerEnd).toFixed(1)},${yOf(state.floor).toFixed(1)} ${xOfExp(EXP_MAX).toFixed(1)},${yOf(state.floor).toFixed(1)}`

  const lowExp = Math.log10(state.fLow)
  const bandX = xOfExp(lowExp)
  const bandW = xOfExp(EXP_MAX) - bandX

  const f = offsetHz(state)
  const markX = xOfExp(state.offsetExp)
  const markY = yOf(analysis.l)
  const markLabel = `${fmtFreq(f)}  L = ${analysis.l.toFixed(1)} dBc/Hz`

  const handleClick = (event: MouseEvent<SVGSVGElement>) => {
    const rect = event.currentTarget.getBoundingClientRect()
    const x = ((event.clientX - rect.left) * CW) / rect.width
    const exp = EXP_MIN + ((x - PAD_L) / PLOT_W) * (EXP_MAX - EXP_MIN)
    const clamped = Math.min(EXP_MAX, Math.max(EXP_MIN, exp))
    onPick(Math.round(clamped * 20) / 20)
  }

  return (
    <figure className="term-fig rf-pn-fig">
      <svg
        viewBox={`0 0 ${CW} ${CH}`}
        role="img"
        aria-label={t(FIG.aria)}
        className="rf-svg"
        onClick={handleClick}
      >
        <rect x={0} y={0} width={CW} height={CH} fill={BG} />

        {Y_TICKS.map((tick) => (
          <g key={`y${tick}`}>
            <line x1={PAD_L} x2={PAD_L + PLOT_W} y1={yOf(tick)} y2={yOf(tick)} stroke={GRID} strokeDasharray="4 3" />
            <text x={PAD_L - 6} y={yOf(tick)} textAnchor="end" dominantBaseline="middle" fill={LABEL_COLOR} fontSize={11}>
              {`${tick}`}
            </text>
          </g>
        ))}
        {X_TICKS.map((tick) => (
          <g key={`x${tick}`}>
            <line x1={xOfExp(tick)} x2={xOfExp(tick)} y1={PAD_T} y2={PAD_T + PLOT_H} stroke={GRID} strokeDasharray="4 3" />
            <text x={xOfExp(tick)} y={PAD_T + PLOT_H + 14} textAnchor="middle" fill={LABEL_COLOR} fontSize={11}>
              {X_TICK_TEXT[tick]}
            </text>
          </g>
        ))}
        <text x={PAD_L} y={CH - 4} fill={LABEL_COLOR} fontSize={11}>
          {t(FIG.axis)}
        </text>

        <rect x={bandX} y={PAD_T} width={bandW} height={PLOT_H} fill={BAND} fillOpacity={0.12} />
        <text x={bandX + 4} y={PAD_T + PLOT_H - 6} fill={BAND} fontSize={11}>
          {t(FIG.band)}
        </text>

        <polyline points={flickerLine} fill="none" stroke={GUIDE} strokeWidth={1} strokeDasharray="5 4" />
        <polyline points={floorLine} fill="none" stroke={GUIDE} strokeWidth={1} strokeDasharray="5 4" />

        <polyline points={curve.join(' ')} fill="none" stroke={TRACE} strokeWidth={1.6} />

        <line x1={markX} x2={markX} y1={PAD_T} y2={PAD_T + PLOT_H} stroke={MARK} strokeWidth={1} strokeDasharray="2 3" />
        <circle cx={markX} cy={markY} r={4} fill={MARK} />
        <text x={PAD_L + PLOT_W - 4} y={PAD_T + 14} textAnchor="end" fill={MARK} fontSize={11}>
          {markLabel}
        </text>
      </svg>
      <figcaption>{t(FIG.cap)}</figcaption>
    </figure>
  )
}

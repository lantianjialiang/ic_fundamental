import { type ReactElement } from 'react'
import { useLocale } from '../../i18n/LocaleContext'
import { FIG } from './memDdrData'
import { DQ_COUNT, SAMPLES, bitMargin, bitPass, commonMargin, sampleDelays, type DdrAnalysis } from './memDdrModel'

/** 示波器风格的深色底，颜色写死：SVG 里不便读 CSS 变量 */
const BG = '#0d1117'
const GRID = '#3d4756'
const LABEL = '#8b949e'
const PASS_COLOR = '#2ea043'
const FAIL_COLOR = '#4a2227'
const GOLD = '#e8c45a'
const BLUE = '#58a6ff'
const CURSOR = '#ffffff'
const MONO = 'Consolas, ui-monospace, monospace'

/* ---------- 条带图：每根 DQ 线一行，横轴是 DQS 延迟 ---------- */

const ST_W = 460
const ST_PAD_L = 52
const ST_PAD_R = 12
const ST_PAD_T = 14
const ST_ROW = 16
const ST_BAR = 12
const ST_PLOT_W = ST_W - ST_PAD_L - ST_PAD_R
const ST_PLOT_H = DQ_COUNT * ST_ROW
const ST_H = ST_PAD_T + ST_PLOT_H + 40

export function DdrStripFig({ analysis }: { analysis: DdrAnalysis }) {
  const { t } = useLocale()
  const { ui, half, centres, delay, lo, hi, open } = analysis
  const xOf = (d: number) => ST_PAD_L + (d / ui) * ST_PLOT_W
  const colW = ST_PLOT_W / SAMPLES

  const cells: ReactElement[] = []
  for (let i = 0; i < DQ_COUNT; i += 1) {
    const y = ST_PAD_T + i * ST_ROW
    for (let k = 0; k < SAMPLES; k += 1) {
      const d = (k / SAMPLES) * ui
      const pass = bitPass(d, centres[i], half)
      cells.push(
        <rect key={`${i}-${k}`} x={ST_PAD_L + k * colW} y={y} width={colW + 0.3} height={ST_BAR} fill={pass ? PASS_COLOR : FAIL_COLOR} />,
      )
    }
  }

  return (
    <figure className="term-fig">
      <svg viewBox={`0 0 ${ST_W} ${ST_H}`} className="term-fig__svg" role="img" aria-label={t(FIG.stripAria)}>
        <rect x={0} y={0} width={ST_W} height={ST_H} fill={BG} />
        {cells}
        {open ? (
          <rect
            x={xOf(lo)}
            y={ST_PAD_T - 3}
            width={Math.max(0, xOf(hi) - xOf(lo))}
            height={ST_PLOT_H + 6}
            fill="none"
            stroke={GOLD}
            strokeWidth={1.5}
          />
        ) : null}
        <line x1={xOf(delay)} x2={xOf(delay)} y1={ST_PAD_T - 3} y2={ST_PAD_T + ST_PLOT_H + 3} stroke={CURSOR} strokeWidth={1.5} />
        <g fontFamily={MONO} fontSize={11} fill={LABEL}>
          <text x={ST_PAD_L - 6} y={ST_PAD_T - 4} textAnchor="end">{t(FIG.axisLines)}</text>
          {Array.from({ length: DQ_COUNT }, (_, i) => (
            <text key={i} x={ST_PAD_L - 6} y={ST_PAD_T + i * ST_ROW + ST_BAR} textAnchor="end">
              {`DQ${i}`}
            </text>
          ))}
          <text x={ST_PAD_L} y={ST_PAD_T + ST_PLOT_H + 14} textAnchor="start">0</text>
          <text x={xOf(ui / 2)} y={ST_PAD_T + ST_PLOT_H + 14} textAnchor="middle">{`${(ui / 2).toFixed(0)} ps`}</text>
          <text x={ST_PAD_L + ST_PLOT_W} y={ST_PAD_T + ST_PLOT_H + 14} textAnchor="end">{`${ui.toFixed(0)} ps`}</text>
          <text x={ST_PAD_L + ST_PLOT_W} y={ST_H - 8} textAnchor="end">{t(FIG.axisDelay)}</text>
        </g>
      </svg>
      <figcaption>{t(FIG.stripCap)}</figcaption>
    </figure>
  )
}

/* ---------- 裕量曲线：所有位的最小裕量 vs DQ0 单独的裕量 ---------- */

const MG_W = 460
const MG_H = 180
const MG_PAD_L = 52
const MG_PAD_R = 12
const MG_PAD_T = 12
const MG_PAD_B = 28
const MG_PLOT_W = MG_W - MG_PAD_L - MG_PAD_R
const MG_PLOT_H = MG_H - MG_PAD_T - MG_PAD_B

export function DdrMarginFig({ analysis }: { analysis: DdrAnalysis }) {
  const { t } = useLocale()
  const { ui, half, centres, delay } = analysis
  const yMax = ui / 2
  const xOf = (d: number) => MG_PAD_L + (d / ui) * MG_PLOT_W
  const yOf = (m: number) => {
    const clamped = Math.min(yMax, Math.max(-yMax, m))
    return MG_PAD_T + ((yMax - clamped) / (2 * yMax)) * MG_PLOT_H
  }
  const delays = sampleDelays(ui)
  const common = delays.map((d) => `${xOf(d).toFixed(1)},${yOf(commonMargin(d, centres, half)).toFixed(1)}`).join(' ')
  const dq0 = delays.map((d) => `${xOf(d).toFixed(1)},${yOf(bitMargin(d, centres[0], half)).toFixed(1)}`).join(' ')

  return (
    <figure className="term-fig">
      <svg viewBox={`0 0 ${MG_W} ${MG_H}`} className="term-fig__svg" role="img" aria-label={t(FIG.marginAria)}>
        <rect x={0} y={0} width={MG_W} height={MG_H} fill={BG} />
        <line x1={MG_PAD_L} x2={MG_PAD_L + MG_PLOT_W} y1={yOf(0)} y2={yOf(0)} stroke={GRID} strokeWidth={1} strokeDasharray="4 3" />
        <line x1={MG_PAD_L} x2={MG_PAD_L} y1={MG_PAD_T} y2={MG_PAD_T + MG_PLOT_H} stroke={GRID} strokeWidth={1} />
        <polyline points={dq0} fill="none" stroke={BLUE} strokeWidth={1.4} strokeDasharray="4 3" />
        <polyline points={common} fill="none" stroke={GOLD} strokeWidth={1.8} />
        <line x1={xOf(delay)} x2={xOf(delay)} y1={MG_PAD_T} y2={MG_PAD_T + MG_PLOT_H} stroke={CURSOR} strokeWidth={1.2} />
        <g fontFamily={MONO} fontSize={11} fill={LABEL}>
          <text x={MG_PAD_L - 6} y={MG_PAD_T + 4} textAnchor="end">{`+${yMax.toFixed(0)}`}</text>
          <text x={MG_PAD_L - 6} y={yOf(0)} textAnchor="end" dominantBaseline="middle">0</text>
          <text x={MG_PAD_L - 6} y={MG_PAD_T + MG_PLOT_H} textAnchor="end">{`-${yMax.toFixed(0)}`}</text>
          <text x={MG_PAD_L} y={MG_PAD_T + MG_PLOT_H + 14} textAnchor="start">0</text>
          <text x={xOf(ui / 2)} y={MG_PAD_T + MG_PLOT_H + 14} textAnchor="middle">{`${(ui / 2).toFixed(0)} ps`}</text>
          <text x={MG_PAD_L + MG_PLOT_W} y={MG_PAD_T + MG_PLOT_H + 14} textAnchor="end">{`${ui.toFixed(0)} ps`}</text>
          <text x={MG_PAD_L + 4} y={MG_PAD_T + 12} textAnchor="start">{t(FIG.marginLabel)}</text>
        </g>
      </svg>
      <figcaption>{t(FIG.marginCap)}</figcaption>
    </figure>
  )
}

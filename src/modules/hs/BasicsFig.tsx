import { useLocale } from '../../i18n/LocaleContext'
import { FIG } from './basicsData'
import { type BasicsAnalysis, PATTERN, SPU } from './basicsModel'

const CW = 480
const CH = 262
const PAD_L = 40
const PAD_R = 14
const PAD_T = 14
const PAD_B = 30
const PLOT_W = CW - PAD_L - PAD_R
const PLOT_H = CH - PAD_T - PAD_B
/** 纵轴范围：留出上方一段放 tr 的标注 */
const YMIN = -0.15
const YMAX = 1.25
const N = PATTERN.length
const LN9 = Math.log(9)

const xOf = (ui: number) => PAD_L + (ui / N) * PLOT_W
const yOf = (v: number) => PAD_T + ((YMAX - v) / (YMAX - YMIN)) * PLOT_H

/** 采样序列转成 SVG 路径：横轴单位 UI，每个采样点一段 */
function pathOf(values: ArrayLike<number>): string {
  let d = ''
  for (let i = 0; i < values.length; i += 1) {
    const x = xOf(i / SPU)
    const y = yOf(values[i])
    d += `${i === 0 ? 'M' : 'L'}${x.toFixed(1)} ${y.toFixed(1)} `
  }
  return d.trim()
}

/** 波形图：实线是通道输出，虚线是理想方波，金色标出 tr 的 10%–90% 区间 */
export function BasicsFig({ analysis, tr }: { analysis: BasicsAnalysis; tr: number }) {
  const { t } = useLocale()
  const tau = tr / LN9
  /** 第一个上升沿（第 1 位起点为 UI 1）上 10% 与 90% 的时刻，单位 UI */
  const u10 = 1 + (tau * -Math.log(0.9)) / analysis.ui
  const u90 = 1 + (tau * -Math.log(0.1)) / analysis.ui
  const yArrow = yOf(1.12)
  const xMid = (xOf(u10) + xOf(u90)) / 2

  return (
    <figure className="term-fig">
      <svg viewBox={`0 0 ${CW} ${CH}`} className="term-fig__svg hs-eye" role="img" aria-label={t(FIG.aria)}>
        <rect width={CW} height={CH} rx="10" fill="var(--well)" />
        {[0, 1].map((v) => (
          <g key={v}>
            <line x1={PAD_L} y1={yOf(v)} x2={PAD_L + PLOT_W} y2={yOf(v)} stroke="var(--fig-box)" strokeDasharray="4 3" />
            <text x={PAD_L - 6} y={yOf(v) + 4} textAnchor="end" fill="var(--dim)" fontSize="11">
              {v}
            </text>
          </g>
        ))}
        {Array.from({ length: N + 1 }, (_, k) => (
          <g key={k}>
            <line x1={xOf(k)} y1={PAD_T} x2={xOf(k)} y2={PAD_T + PLOT_H} stroke="var(--fig-box)" />
            <text x={xOf(k)} y={PAD_T + PLOT_H + 13} textAnchor="middle" fill="var(--dim)" fontSize="10">
              {k}
            </text>
          </g>
        ))}
        <text x={CW - PAD_R} y={CH - 4} textAnchor="end" fill="var(--dim)" fontSize="10">
          {t(FIG.axis)}
        </text>

        <path d={pathOf(analysis.ideal)} fill="none" stroke="var(--muted)" strokeWidth="1.5" strokeDasharray="4 4" />
        <path d={pathOf(analysis.wave)} fill="none" stroke="var(--sky)" strokeWidth="2" />

        <line x1={xOf(u10)} y1={yArrow} x2={xOf(u90)} y2={yArrow} stroke="var(--gold)" strokeWidth="1.5" />
        <line x1={xOf(u10)} y1={yArrow - 4} x2={xOf(u10)} y2={yArrow + 4} stroke="var(--gold)" strokeWidth="1.5" />
        <line x1={xOf(u90)} y1={yArrow - 4} x2={xOf(u90)} y2={yArrow + 4} stroke="var(--gold)" strokeWidth="1.5" />
        <text x={xMid} y={yArrow - 6} textAnchor="middle" fill="var(--gold)" fontSize="11">
          {`tr = ${tr.toFixed(0)} ps`}
        </text>
        <circle cx={xOf(u10)} cy={yOf(0.1)} r="3" fill="var(--gold)" />
        <circle cx={xOf(u90)} cy={yOf(0.9)} r="3" fill="var(--gold)" />
      </svg>
      <figcaption>{t(FIG.cap)}</figcaption>
    </figure>
  )
}

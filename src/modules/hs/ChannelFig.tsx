import { useLocale } from '../../i18n/LocaleContext'
import { FIG } from './channelData'
import { type ChannelAnalysis, SPU, VIEW_UI } from './channelModel'

const CW = 480
const CH = 262
const PAD_L = 40
const PAD_R = 14
const PAD_T = 14
const PAD_B = 30
const PLOT_W = CW - PAD_L - PAD_R
const PLOT_H = CH - PAD_T - PAD_B
/** 纵轴范围：归一化电平，留出回声与抬高后的余量 */
const VMAX = 1.7

const xOf = (ui: number) => PAD_L + (ui / VIEW_UI) * PLOT_W
const yOf = (v: number) => PAD_T + ((VMAX - v) / (2 * VMAX)) * PLOT_H

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

/** 接收端波形图：实线为接收波形，虚线为理想方波，点线为远端稳态电平 */
export function ChannelFig({ analysis }: { analysis: ChannelAnalysis }) {
  const { t } = useLocale()
  const level = analysis.levelRel

  return (
    <figure className="term-fig">
      <svg viewBox={`0 0 ${CW} ${CH}`} className="term-fig__svg hs-eye" role="img" aria-label={t(FIG.aria)}>
        <rect width={CW} height={CH} rx="10" fill="var(--well)" />
        {[1, 0, -1].map((v) => (
          <g key={v}>
            <line x1={PAD_L} y1={yOf(v)} x2={PAD_L + PLOT_W} y2={yOf(v)} stroke="var(--fig-box)" strokeDasharray="4 3" />
            <text x={PAD_L - 6} y={yOf(v) + 4} textAnchor="end" fill="var(--dim)" fontSize="11">
              {v > 0 ? `+${v}` : `${v}`}
            </text>
          </g>
        ))}
        {[level, -level].map((v) => (
          <g key={`level-${v}`}>
            <line x1={PAD_L} y1={yOf(v)} x2={PAD_L + PLOT_W} y2={yOf(v)} stroke="var(--gold)" strokeWidth="1" strokeDasharray="1 3" />
            <text x={PAD_L + PLOT_W - 4} y={yOf(v) - 4} textAnchor="end" fill="var(--gold)" fontSize="10">
              {`${v > 0 ? '+' : ''}${v.toFixed(2)}`}
            </text>
          </g>
        ))}
        {Array.from({ length: VIEW_UI + 1 }, (_, k) => (
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
        <path d={pathOf(analysis.view)} fill="none" stroke="var(--sky)" strokeWidth="2" />
      </svg>
      <figcaption>{t(FIG.cap)}</figcaption>
    </figure>
  )
}

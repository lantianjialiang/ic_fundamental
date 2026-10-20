import { useLocale } from '../../i18n/LocaleContext'
import { FIG, LABEL, S } from './rfHarmData'
import { type CompKey, type HarmAnalysis, MASK } from './rfHarmModel'

const CW = 480
const CH = 260
const PAD_L = 46
const PAD_R = 12
const PAD_T = 12
const PAD_B = 40
const PLOT_W = CW - PAD_L - PAD_R
const PLOT_H = CH - PAD_T - PAD_B
/** 横轴 0–512 MHz，纵轴 0 到 −90 dBc */
const FMAX = 512
const YTOP = 0
const YBOT = -90

const xOf = (mhz: number) => PAD_L + (mhz / FMAX) * PLOT_W
const yOf = (dbc: number) => PAD_T + ((YTOP - Math.max(dbc, YBOT)) / (YTOP - YBOT)) * PLOT_H

/** 示波器风格的深色底，颜色写死在 SVG 里 */
const BG = '#0d1117'
const GRID = '#3d4756'
const LABEL_COLOR = '#8b949e'
const TRACE = '#58a6ff'
const MASK_COLOR = '#e8c45a'
const PASS_COLOR = '#3fb950'
const FAIL_COLOR = '#f85149'

const ORDER: CompKey[] = ['f0', 'h2', 'h3', 'spur']
/** 标签相对峰顶的位置：基波在顶部，标签放在右下方；其余放在峰顶上方 */
const LABEL_DY: Record<CompKey, number> = { f0: 16, h2: -8, h3: -8, spur: -8 }

/** 频谱图：dBc 曲线、阶梯状掩模、各分量的峰与标注；超限分量标红 */
export function HarmFig({ analysis }: { analysis: HarmAnalysis }) {
  const { t } = useLocale()

  const trace: string[] = []
  for (let k = 0; k < analysis.dbc.length; k += 1) {
    trace.push(`${xOf(k).toFixed(1)},${yOf(analysis.dbc[k]).toFixed(1)}`)
  }

  let maskPath = ''
  MASK.forEach((step, index) => {
    const y = yOf(step.limitDbc).toFixed(1)
    maskPath += index === 0 ? `M ${xOf(step.fromMhz).toFixed(1)} ${y} ` : `V ${y} `
    maskPath += `H ${xOf(step.toMhz).toFixed(1)} `
  })

  const yTicks = [0, -30, -60, -90]
  const xTicks = [0, 100, 200, 300, 400, 512]

  return (
    <figure className="term-fig rf-harm-fig">
      <svg viewBox={`0 0 ${CW} ${CH}`} role="img" aria-label={t(FIG.aria)} className="rf-svg">
        <rect x={0} y={0} width={CW} height={CH} fill={BG} />

        {yTicks.map((tick) => (
          <g key={`y${tick}`}>
            <line x1={PAD_L} x2={PAD_L + PLOT_W} y1={yOf(tick)} y2={yOf(tick)} stroke={GRID} strokeDasharray="4 3" />
            <text x={PAD_L - 6} y={yOf(tick)} textAnchor="end" dominantBaseline="middle" fill={LABEL_COLOR} fontSize={11}>
              {`${tick}`}
            </text>
          </g>
        ))}
        {xTicks.map((tick) => (
          <text key={`x${tick}`} x={xOf(tick)} y={PAD_T + PLOT_H + 16} textAnchor="middle" fill={LABEL_COLOR} fontSize={11}>
            {`${tick}`}
          </text>
        ))}
        <text x={PAD_L} y={CH - 4} fill={LABEL_COLOR} fontSize={11}>
          {t(FIG.axis)}
        </text>

        <polyline points={trace.join(' ')} fill="none" stroke={TRACE} strokeWidth={1.2} />

        <path d={maskPath.trim()} fill="none" stroke={MASK_COLOR} strokeWidth={2} />
        <text x={xOf(405)} y={yOf(-50) - 6} fill={MASK_COLOR} fontSize={11}>
          {t(S.maskLabel)}
        </text>

        {ORDER.map((key) => {
          const comp = analysis.comps[key]
          const x = xOf(comp.freqMhz)
          const y = yOf(comp.dbc)
          const color = comp.pass ? PASS_COLOR : FAIL_COLOR
          const labelY = Math.min(Math.max(y + LABEL_DY[key], PAD_T + 12), PAD_T + PLOT_H - 4)
          return (
            <g key={key}>
              <circle cx={x} cy={y} r={3.5} fill={color} />
              <text x={x + 6} y={labelY} fill={color} fontSize={11}>
                {`${t(LABEL[key])} ${comp.dbc.toFixed(0)} dBc`}
              </text>
            </g>
          )
        })}
      </svg>
      <figcaption>{t(FIG.cap)}</figcaption>
    </figure>
  )
}

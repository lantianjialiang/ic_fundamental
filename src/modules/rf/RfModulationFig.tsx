import { useLocale } from '../../i18n/LocaleContext'
import { type LText } from '../../i18n/locale'
import { type Complex } from './core/units'

const CW = 320
const CH = 320
const HALF = 128
const CX = CW / 2
const CY = CH / 2

const BG = '#0d1117'
const GRID = '#3d4756'
const LABEL = '#8b949e'
const BOUND = '#5b6575'
const IDEAL = '#e8c45a'
const RX_OK = '#58a6ff'
const RX_BAD = '#f85149'

/** 判决边界：相邻两个电平的中点（QPSK 只有 0，16QAM 有 −0.63、0、+0.63） */
function boundaries(points: Complex[]): number[] {
  const levels: number[] = []
  for (const p of points) {
    const v = Math.round(p.re * 1e6) / 1e6
    if (!levels.includes(v)) {
      levels.push(v)
    }
  }
  levels.sort((a, b) => a - b)
  const out: number[] = []
  for (let i = 0; i + 1 < levels.length; i += 1) {
    out.push((levels[i] + levels[i + 1]) / 2)
  }
  return out
}

/**
 * 星座图（RF-11 与 RF-12 共用）：理想点用空心叉，接收点用实心点，判决边界用虚线。
 * points 为理想星座，rx 为接收点（与理想星座同一单位），bad 标出判错的符号。
 */
export function ConstellationFig({
  points,
  rx,
  bad,
  span,
  aria,
  caption,
}: {
  points: Complex[]
  rx: Complex[]
  bad?: boolean[]
  span: number
  aria: LText
  caption: LText
}) {
  const { t } = useLocale()
  const scale = HALF / span
  const px = (v: number) => CX + v * scale
  const py = (v: number) => CY - v * scale
  const bounds = boundaries(points)
  const cross = 5

  const okDots: Complex[] = []
  const badDots: Complex[] = []
  rx.forEach((p, index) => {
    if (bad !== undefined && bad[index]) {
      badDots.push(p)
    } else {
      okDots.push(p)
    }
  })

  return (
    <figure className="term-fig rf-const">
      <svg viewBox={`0 0 ${CW} ${CH}`} role="img" aria-label={t(aria)} className="rf-const__svg">
        <rect x={0} y={0} width={CW} height={CH} rx={10} fill={BG} />
        <line x1={12} y1={CY} x2={CW - 12} y2={CY} stroke={GRID} strokeWidth={1} />
        <line x1={CX} y1={12} x2={CX} y2={CH - 12} stroke={GRID} strokeWidth={1} />
        {bounds.map((b) => (
          <g key={`b${b}`}>
            <line x1={px(b)} y1={12} x2={px(b)} y2={CH - 12} stroke={BOUND} strokeWidth={1} strokeDasharray="4 3" />
            <line x1={12} y1={py(b)} x2={CW - 12} y2={py(b)} stroke={BOUND} strokeWidth={1} strokeDasharray="4 3" />
          </g>
        ))}
        <text x={CW - 14} y={CY - 6} fill={LABEL} fontSize={11} fontFamily="Consolas, ui-monospace, monospace" textAnchor="end">
          I
        </text>
        <text x={CX + 6} y={16} fill={LABEL} fontSize={11} fontFamily="Consolas, ui-monospace, monospace">
          Q
        </text>
        {okDots.map((p, index) => (
          <circle key={`o${index}`} cx={px(p.re)} cy={py(p.im)} r={2.4} fill={RX_OK} />
        ))}
        {badDots.map((p, index) => (
          <circle key={`x${index}`} cx={px(p.re)} cy={py(p.im)} r={2.6} fill={RX_BAD} />
        ))}
        {points.map((p, index) => (
          <g key={`i${index}`} stroke={IDEAL} strokeWidth={1.8} fill="none">
            <line x1={px(p.re) - cross} y1={py(p.im) - cross} x2={px(p.re) + cross} y2={py(p.im) + cross} />
            <line x1={px(p.re) - cross} y1={py(p.im) + cross} x2={px(p.re) + cross} y2={py(p.im) - cross} />
          </g>
        ))}
      </svg>
      <figcaption>{t(caption)}</figcaption>
    </figure>
  )
}

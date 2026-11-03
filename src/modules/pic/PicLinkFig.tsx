const BG = '#0d1117'
const BOX = '#161b22'
const EDGE = '#3d4756'
const TEXT = '#c9d1d9'
const MUTED = '#8b949e'
const GOLD = '#e8c45a'
const BLUE = '#58a6ff'

/** 光眼图：方块高度就是 OMA，ER 标在右侧，避免和左侧的 OMA 字叠在一起。 */
export function PicLinkFig({
  omaMw,
  erDb,
  aria,
  summary,
  omaLabel,
  erLabel,
}: {
  omaMw: number
  erDb: number
  aria: string
  summary: string
  omaLabel: string
  erLabel: string
}) {
  const W = 440
  const H = 210
  const mid = 112
  const h = Math.max(12, Math.min(132, omaMw * 44))
  const top = mid - h / 2
  const x0 = 156
  const x1 = 268
  const erText = Number.isFinite(erDb) ? `${erDb.toFixed(1)} dB` : 'inf'

  return (
    <figure className="pic-fig">
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={aria} className="pic-svg">
        <rect width={W} height={H} rx={10} fill={BG} />
        <rect x={x0} y={top} width={x1 - x0} height={h} rx={4} fill={BLUE} opacity={0.9} />
        <text x={x0 - 12} y={mid + 4} fill={TEXT} fontSize={13} textAnchor="end">
          {omaLabel}
        </text>
        <text x={x1 + 14} y={mid - 2} fill={GOLD} fontSize={13}>
          {erLabel}
        </text>
        <text x={x1 + 14} y={mid + 16} fill={GOLD} fontSize={12}>
          {erText}
        </text>
      </svg>
      <p className="pic-summary">{summary}</p>
    </figure>
  )
}

/** BER 对接收 OMA。横轴按对数均匀（曲线点本身是对数取样）。 */
export function BerOmaPlot({
  omaMw,
  ber,
  cursor,
  onCursor,
  aria,
  summary,
  xLabel,
  yLabel,
  markLabel,
}: {
  omaMw: number[]
  ber: number[]
  cursor: number
  onCursor: (index: number) => void
  aria: string
  summary: string
  xLabel: string
  yLabel: string
  markLabel: string
}) {
  const W = 440
  const H = 220
  const L = 46
  const R = 14
  const T = 28
  const B = 32
  const n = omaMw.length
  const i = Math.min(Math.max(0, cursor), Math.max(0, n - 1))
  const yOf = (value: number) => {
    const log = Math.max(-16, Math.min(0, Math.log10(Math.max(value, 1e-18))))
    return T + ((0 - log) / 16) * (H - T - B)
  }
  const xOf = (index: number) => L + (n <= 1 ? 0 : (index / (n - 1)) * (W - L - R))
  const d = ber.map((value, index) => `${index === 0 ? 'M' : 'L'} ${xOf(index).toFixed(1)} ${yOf(value).toFixed(1)}`).join(' ')
  const yMark = yOf(1e-12)

  return (
    <figure className="pic-fig">
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={aria} className="pic-svg">
        <rect width={W} height={H} rx={10} fill={BG} />
        <text x={8} y={16} fill={TEXT} fontSize={11}>
          {yLabel}
        </text>
        <rect x={L} y={T} width={W - L - R} height={H - T - B} fill={BOX} stroke={EDGE} />
        {[0, -4, -8, -12, -16].map((tick) => {
          const y = yOf(10 ** tick)
          return (
            <g key={tick}>
              <line x1={L} x2={W - R} y1={y} y2={y} stroke={EDGE} />
              <text x={L - 4} y={y + 3} fill={MUTED} fontSize={10} textAnchor="end">
                {String(tick)}
              </text>
            </g>
          )
        })}
        <line x1={L} x2={W - R} y1={yMark} y2={yMark} stroke={MUTED} strokeDasharray="4 3" />
        <text x={L + 6} y={yMark - 4} fill={MUTED} fontSize={10}>
          {markLabel}
        </text>
        <path d={d} fill="none" stroke={BLUE} strokeWidth={1.8} />
        <line x1={xOf(i)} x2={xOf(i)} y1={T} y2={H - B} stroke={GOLD} strokeDasharray="3 3" />
        <text x={(L + W - R) / 2} y={H - 8} fill={MUTED} fontSize={11} textAnchor="middle">
          {`${xLabel}  ${omaMw[0]?.toFixed(2)} – ${omaMw[n - 1]?.toFixed(2)}`}
        </text>
      </svg>
      <input
        type="range"
        min={0}
        max={Math.max(0, n - 1)}
        step={1}
        value={i}
        aria-label={aria}
        onChange={(event) => onCursor(Number(event.target.value))}
      />
      <p className="pic-summary">{summary}</p>
    </figure>
  )
}

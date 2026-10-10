import { type Seg } from './data/func'

export type WaveRow = {
  name: string
  segs: Seg[]
  color?: string
  /** 在指定时刻写字，例如期望字符 */
  labels?: Array<{ t: number; text: string; bad?: boolean }>
}

type Props = {
  span: number
  period: number
  rows: WaveRow[]
  /** 每个周期内的 Strobe 时刻 */
  strobe?: number
  /** 每个周期内的 Strobe 窗口 */
  window?: [number, number]
  /** 每个周期内要标出的边沿（虚线） */
  edges?: number[]
  ariaLabel: string
}

const X0 = 84
const X1 = 664
const ROW_H = 54

export function WaveRows({ span, period, rows, strobe, window, edges = [], ariaLabel }: Props) {
  const height = 34 + rows.length * ROW_H + 10
  const x = (ns: number) => X0 + (ns / span) * (X1 - X0)
  const cycles = Math.round(span / period)
  const cycleIdx = Array.from({ length: cycles }, (_, i) => i)

  return (
    <svg viewBox={`0 0 680 ${height}`} className="term-fig__svg" role="img" aria-label={ariaLabel}>
      <rect width="680" height={height} rx="10" fill="var(--well)" />
      {/* T0 网格与边沿 */}
      {cycleIdx.map((i) => (
        <g key={i}>
          <line x1={x(i * period)} y1={20} x2={x(i * period)} y2={height - 8} stroke="var(--line)" />
          <text x={x(i * period) + 3} y={16} fill="var(--dim)" fontSize="10">
            {i === 0 ? 'T0' : `${i * period}`}
          </text>
          {edges.map((e) => (
            <line
              key={e}
              x1={x(i * period + e)}
              y1={26}
              x2={x(i * period + e)}
              y2={height - 8}
              stroke="var(--blue)"
              strokeOpacity="0.35"
              strokeDasharray="3 4"
            />
          ))}
          {window ? (
            <rect
              x={x(i * period + window[0])}
              y={24}
              width={Math.max(2, x(i * period + window[1]) - x(i * period + window[0]))}
              height={height - 32}
              fill="var(--gold)"
              opacity="0.12"
            />
          ) : null}
          {strobe !== undefined ? (
            <line
              x1={x(i * period + strobe)}
              y1={24}
              x2={x(i * period + strobe)}
              y2={height - 8}
              stroke="var(--gold)"
              strokeWidth="1.5"
            />
          ) : null}
        </g>
      ))}
      <line x1={x(span)} y1={20} x2={x(span)} y2={height - 8} stroke="var(--line)" />
      {rows.map((row, r) => {
        const top = 34 + r * ROW_H
        const hi = top + 8
        const lo = top + 34
        const mid = (hi + lo) / 2
        const y = (level: Seg['level']) => (level === 'z' ? mid : level ? hi : lo)
        const color = row.color ?? 'var(--sky)'
        return (
          <g key={row.name}>
            <text x={12} y={mid + 4} fill="var(--text-2)" fontSize="12" fontFamily="monospace">
              {row.name}
            </text>
            {row.segs.map((seg, i) => {
              const prev = row.segs[i - 1]
              const vertical =
                prev && prev.level !== seg.level && prev.level !== 'z' && seg.level !== 'z' ? (
                  <line x1={x(seg.x0)} y1={y(prev.level)} x2={x(seg.x0)} y2={y(seg.level)} stroke={color} strokeWidth="2" />
                ) : null
              return (
                <g key={i}>
                  {vertical}
                  <line
                    x1={x(seg.x0)}
                    y1={y(seg.level)}
                    x2={x(seg.x1)}
                    y2={y(seg.level)}
                    stroke={seg.level === 'z' ? 'var(--muted)' : color}
                    strokeWidth="2"
                    strokeDasharray={seg.level === 'z' ? '4 4' : undefined}
                  />
                </g>
              )
            })}
            {row.labels?.map((label, i) => (
              <text
                key={i}
                x={x(label.t) + 4}
                y={top + 4}
                fill={label.bad ? 'var(--red)' : 'var(--gold)'}
                fontSize="11"
                fontFamily="monospace"
              >
                {label.text}
              </text>
            ))}
          </g>
        )
      })}
    </svg>
  )
}

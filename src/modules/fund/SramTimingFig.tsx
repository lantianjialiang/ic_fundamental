import { SRAM_SPAN, type BusSeg, type Span } from './data/ac'

const X0 = 84
const X1 = 664
const ROW_H = 58

export function SramTimingFig({
  rows,
  spans,
  active,
  onPick,
  ariaLabel,
}: {
  rows: Array<{ name: string; segs: BusSeg[] }>
  spans: Span[]
  active: string
  onPick: (id: string) => void
  ariaLabel: string
}) {
  const height = 40 + rows.length * ROW_H
  const x = (ns: number) => X0 + (ns / SRAM_SPAN) * (X1 - X0)
  const ticks = Array.from({ length: SRAM_SPAN + 1 }, (_, i) => i)

  return (
    <svg viewBox={`0 0 680 ${height}`} className="term-fig__svg" role="img" aria-label={ariaLabel}>
      <rect width="680" height={height} rx="10" fill="var(--well)" />
      {ticks.map((ns) => (
        <g key={ns}>
          <line x1={x(ns)} y1={22} x2={x(ns)} y2={height - 6} stroke="var(--fig-box)" />
          {ns % 5 === 0 || ns === 2 || ns === 13 ? (
            <text x={x(ns)} y={15} textAnchor="middle" fill="var(--dim)" fontSize="10">
              {ns}
            </text>
          ) : null}
        </g>
      ))}
      {rows.map((row, r) => {
        const top = 30 + r * ROW_H
        const hi = top + 10
        const lo = top + 34
        const mid = (hi + lo) / 2
        return (
          <g key={row.name}>
            <text x={12} y={mid + 4} fill="var(--text-2)" fontSize="12" fontFamily="monospace">
              {row.name}
            </text>
            {row.segs.map((seg, i) => {
              const a = x(seg.x0)
              const b = x(seg.x1)
              const prev = row.segs[i - 1]
              if (seg.kind === 'hi' || seg.kind === 'lo') {
                const y = seg.kind === 'hi' ? hi : lo
                const py = prev ? (prev.kind === 'hi' ? hi : lo) : y
                return (
                  <g key={i}>
                    {prev ? <line x1={a} y1={py} x2={a} y2={y} stroke="var(--sky)" strokeWidth="2" /> : null}
                    <line x1={a} y1={y} x2={b} y2={y} stroke="var(--sky)" strokeWidth="2" />
                  </g>
                )
              }
              if (seg.kind === 'z') {
                return <line key={i} x1={a} y1={mid} x2={b} y2={mid} stroke="var(--muted)" strokeWidth="2" strokeDasharray="4 4" />
              }
              const s = 4
              const path = `M${a} ${mid} L${a + s} ${hi} L${b - s} ${hi} L${b} ${mid} L${b - s} ${lo} L${a + s} ${lo} Z`
              return (
                <g key={i}>
                  <path
                    d={path}
                    fill={seg.kind === 'x' ? 'url(#sram-hatch)' : 'var(--green-bg)'}
                    stroke={seg.kind === 'x' ? 'var(--dim)' : 'var(--green)'}
                    strokeWidth="1.5"
                  />
                  {seg.label ? (
                    <text x={(a + b) / 2} y={mid + 4} textAnchor="middle" fill="var(--green-2)" fontSize="12">
                      {seg.label}
                    </text>
                  ) : null}
                </g>
              )
            })}
          </g>
        )
      })}
      <defs>
        <pattern id="sram-hatch" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2="6" stroke="var(--line-2)" strokeWidth="2" />
        </pattern>
      </defs>
      {spans.filter((span) => span.id === active).map((span) => {
        const on = true
        const top = 30 + span.row * ROW_H
        const y = top + 48
        const a = x(span.from)
        const b = x(span.to)
        const color = on ? 'var(--gold)' : 'var(--blue)'
        if (span.from === span.to) {
          return (
            <g key={span.id} style={{ cursor: 'pointer' }} onClick={() => onPick(span.id)}>
              <line x1={a} y1={24} x2={a} y2={height - 6} stroke={color} strokeWidth={on ? 2 : 1.2} />
              <text x={a + 4} y={y + 4} fill={color} fontSize="11">
                {span.label}
              </text>
            </g>
          )
        }
        return (
          <g key={span.id} style={{ cursor: 'pointer' }} onClick={() => onPick(span.id)} opacity={on ? 1 : 0.55}>
            <line x1={a} y1={y} x2={b} y2={y} stroke={color} strokeWidth={on ? 2 : 1.2} />
            <line x1={a} y1={y - 4} x2={a} y2={y + 4} stroke={color} strokeWidth={on ? 2 : 1.2} />
            <line x1={b} y1={y - 4} x2={b} y2={y + 4} stroke={color} strokeWidth={on ? 2 : 1.2} />
            {on ? (
              <>
                <line x1={a} y1={top + 4} x2={a} y2={y} stroke={color} strokeDasharray="2 3" />
                <line x1={b} y1={top + 4} x2={b} y2={y} stroke={color} strokeDasharray="2 3" />
              </>
            ) : null}
            <text x={(a + b) / 2} y={y - 5} textAnchor="middle" fill={color} fontSize="11">
              {span.label}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

import { mzmPower } from './core/photonics'

const BG = '#0d1117'
const BOX = '#161b22'
const EDGE = '#3d4756'
const TEXT = '#c9d1d9'
const MUTED = '#8b949e'
const GOLD = '#e8c45a'
const BLUE = '#58a6ff'

const W = 640
const H = 270
const L = 56
const R = 18
const T = 26
const B = 42

function tick(n: number): string {
  const rounded = Math.round(n)
  if (Math.abs(n - rounded) < 1e-6) return String(rounded)
  return n.toFixed(1)
}

export function PicModFig({
  p0,
  vpi,
  phi0,
  vpp,
  aria,
  summary,
  xLabel,
  yLabel,
  highLabel,
  lowLabel,
}: {
  p0: number
  vpi: number
  phi0: number
  vpp: number
  aria: string
  summary: string
  xLabel: string
  yLabel: string
  highLabel: string
  lowLabel: string
}) {
  const vmax = Math.max(vpi, Math.abs(vpp) / 2, 0.5) * 1.25
  const pMax = Math.max(p0, 1e-6) * 1.12
  const samples = Array.from({ length: 121 }, (_, index) => -vmax + (2 * vmax * index) / 120)
  const xOf = (v: number) => L + ((v + vmax) / (2 * vmax)) * (W - L - R)
  const yOf = (p: number) => T + ((pMax - p) / pMax) * (H - T - B)
  const path = samples
    .map((v, index) => {
      const p = mzmPower({ p0, v, vpi, phi0 })
      return `${index === 0 ? 'M' : 'L'} ${xOf(v).toFixed(1)} ${yOf(p).toFixed(1)}`
    })
    .join(' ')
  const marks = [
    { v: vpp / 2, p: mzmPower({ p0, v: vpp / 2, vpi, phi0 }), label: highLabel, up: true },
    { v: -vpp / 2, p: mzmPower({ p0, v: -vpp / 2, vpi, phi0 }), label: lowLabel, up: false },
  ].sort((a, b) => b.p - a.p)
  marks[0].label = highLabel
  marks[0].up = true
  marks[1].label = lowLabel
  marks[1].up = false
  let labelX = marks.map((mark) => xOf(mark.v))
  if (Math.abs(labelX[0] - labelX[1]) < 48) {
    labelX = [labelX[0] - 22, labelX[1] + 22]
  }

  return (
    <figure className="pic-fig">
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={aria} className="pic-svg">
        <rect width={W} height={H} rx={10} fill={BG} />
        <text x={12} y={16} fill={TEXT} fontSize={12}>
          {yLabel}
        </text>
        <rect x={L} y={T} width={W - L - R} height={H - T - B} fill={BOX} stroke={EDGE} />
        {[0, p0].map((p) => (
          <g key={p}>
            <line x1={L} x2={W - R} y1={yOf(p)} y2={yOf(p)} stroke={EDGE} />
            <text x={L - 6} y={yOf(p) + 4} fill={MUTED} fontSize={10} textAnchor="end">
              {tick(p)}
            </text>
          </g>
        ))}
        {[-vpi, 0, vpi].map((v) => (
          <g key={v}>
            <line x1={xOf(v)} x2={xOf(v)} y1={T} y2={H - B} stroke={EDGE} strokeDasharray="2 4" />
            <text x={xOf(v)} y={H - B + 16} fill={MUTED} fontSize={10} textAnchor="middle">
              {tick(v)}
            </text>
          </g>
        ))}
        <path d={path} fill="none" stroke={BLUE} strokeWidth={1.8} />
        {marks.map((mark, index) => {
          const y = mark.up ? Math.max(T + 12, yOf(mark.p) - 10) : Math.min(H - B - 6, yOf(mark.p) + 16)
          return (
            <g key={mark.label}>
              <circle cx={xOf(mark.v)} cy={yOf(mark.p)} r={4} fill={index === 0 ? GOLD : '#f0f6fc'} />
              <text x={labelX[index]} y={y} fill={TEXT} fontSize={11} textAnchor="middle">
                {mark.label}
              </text>
            </g>
          )
        })}
        <text x={W - R} y={H - 8} fill={MUTED} fontSize={11} textAnchor="end">
          {xLabel}
        </text>
      </svg>
      <p className="pic-summary">{summary}</p>
    </figure>
  )
}

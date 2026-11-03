import { useEffect, useRef } from 'react'
import { type DefectKind } from './core/sensor.ts'

const BG = '#0d1117'
const BOX = '#161b22'
const EDGE = '#3d4756'
const TEXT = '#c9d1d9'
const MUTED = '#8b949e'
const GOLD = '#e8c45a'
const BLUE = '#58a6ff'

/** 灰度或伪彩帧。伪彩用亮度区分，不单靠红绿。图下给读数摘要。 */
export function FrameView({
  frame,
  w,
  mode,
  hot,
  aria,
  summary,
}: {
  frame: Float32Array
  w: number
  mode: 'gray' | 'heat'
  hot?: number[]
  aria: string
  summary: string
}) {
  const ref = useRef<HTMLCanvasElement>(null)
  const h = Math.round(frame.length / w)
  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    canvas.width = w
    canvas.height = h
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    let lo = Infinity
    let hi = -Infinity
    for (let i = 0; i < frame.length; i += 1) {
      if (frame[i] < lo) lo = frame[i]
      if (frame[i] > hi) hi = frame[i]
    }
    const span = Math.max(hi - lo, 1e-6)
    const image = ctx.createImageData(w, h)
    for (let i = 0; i < frame.length; i += 1) {
      const t = (frame[i] - lo) / span
      const o = i * 4
      if (mode === 'gray') {
        const g = Math.round(t * 255)
        image.data[o] = g
        image.data[o + 1] = g
        image.data[o + 2] = g
      } else {
        image.data[o] = Math.round(20 + t * 220)
        image.data[o + 1] = Math.round(40 + t * 140)
        image.data[o + 2] = Math.round(90 - t * 40)
      }
      image.data[o + 3] = 255
    }
    ctx.putImageData(image, 0, 0)
    if (hot && hot.length > 0) {
      ctx.strokeStyle = '#e8c45a'
      const step = Math.max(1, Math.floor(hot.length / 80))
      for (let k = 0; k < hot.length; k += step) {
        const i = hot[k]
        ctx.strokeRect(i % w, (i / w) | 0, 1, 1)
      }
    }
  }, [frame, w, h, mode, hot])

  return (
    <figure className="sns-fig">
      <canvas ref={ref} className="sns-canvas" role="img" aria-label={aria} />
      <p className="sns-summary">{summary}</p>
    </figure>
  )
}

export function PtcPlot({
  points,
  slope,
  intercept,
  aria,
  summary,
  xLabel,
  yLabel,
}: {
  points: Array<{ mean: number; variance: number }>
  slope: number
  intercept: number
  aria: string
  summary: string
  xLabel: string
  yLabel: string
}) {
  const W = 560
  const H = 280
  const L = 48
  const R = 16
  const T = 20
  const B = 36
  const xs = points.map((p) => Math.log10(Math.max(p.mean, 0.1)))
  const ys = points.map((p) => Math.log10(Math.max(p.variance, 1e-4)))
  const x0 = Math.min(...xs, 0)
  const x1 = Math.max(...xs, 1)
  const y0 = Math.min(...ys, -1)
  const y1 = Math.max(...ys, 1)
  const xOf = (v: number) => L + ((v - x0) / (x1 - x0 || 1)) * (W - L - R)
  const yOf = (v: number) => T + (1 - (v - y0) / (y1 - y0 || 1)) * (H - T - B)
  const fit = [x0, x1].map((x) => {
    const mean = 10 ** x
    const variance = Math.max(slope * mean + intercept, 1e-4)
    return `${xOf(x).toFixed(1)},${yOf(Math.log10(variance)).toFixed(1)}`
  })
  const fitLine = fit.join(' ')

  return (
    <figure className="sns-fig">
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={aria} className="sns-svg">
        <rect width={W} height={H} rx={10} fill={BG} />
        <rect x={L} y={T} width={W - L - R} height={H - T - B} fill={BOX} stroke={EDGE} />
        <polyline fill="none" stroke={GOLD} strokeWidth={1.6} points={fitLine} />
        {points.map((p, index) => (
          <circle key={index} cx={xOf(Math.log10(Math.max(p.mean, 0.1)))} cy={yOf(Math.log10(Math.max(p.variance, 1e-4)))} r={3.2} fill={BLUE} />
        ))}
        <text x={12} y={16} fill={TEXT} fontSize={11}>
          {yLabel}
        </text>
        <text x={W / 2} y={H - 8} fill={MUTED} fontSize={11} textAnchor="middle">
          {xLabel}
        </text>
      </svg>
      <p className="sns-summary">{summary}</p>
    </figure>
  )
}

const KIND_COLOR: Record<DefectKind, string> = {
  ok: '#2a3340',
  dead: '#58a6ff',
  hot: '#e8c45a',
  low: '#d2a8ff',
}

export function DefectMapView({
  kind,
  w,
  aria,
  summary,
  legend,
}: {
  kind: DefectKind[]
  w: number
  aria: string
  summary: string
  legend: Record<DefectKind, string>
}) {
  const h = Math.round(kind.length / w)
  const cell = Math.max(2, Math.min(8, Math.floor(280 / Math.max(w, h))))
  const width = w * cell + 16
  const height = h * cell + 36
  return (
    <figure className="sns-fig">
      <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label={aria} className="sns-svg">
        <rect width={width} height={height} rx={10} fill={BG} />
        {kind.map((name, index) => (
          <rect
            key={index}
            x={8 + (index % w) * cell}
            y={8 + ((index / w) | 0) * cell}
            width={cell}
            height={cell}
            fill={KIND_COLOR[name]}
          />
        ))}
        {(['dead', 'hot', 'low'] as const).map((name, index) => (
          <g key={name} transform={`translate(${8 + index * 90}, ${height - 16})`}>
            <rect width={10} height={10} fill={KIND_COLOR[name]} />
            <text x={14} y={9} fill={TEXT} fontSize={10}>
              {legend[name]}
            </text>
          </g>
        ))}
      </svg>
      <p className="sns-summary">{summary}</p>
    </figure>
  )
}
